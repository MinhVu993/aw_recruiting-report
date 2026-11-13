import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";
    const factory = searchParams.get("factory")?.trim() || "aw";
    const division = searchParams.get("division")?.trim() || "";
    const department = searchParams.get("department")?.trim() || "";
    const position = searchParams.get("position")?.trim() || "";

    // Build conditions for demands
    const demandWhere: any = {};
    if (department) {
      demandWhere.demDept = department;
    }
    if (position) {
      demandWhere.demPosition = position;
    }
    if (fromDate || toDate) {
      demandWhere.demInputdate = {};
      if (fromDate) demandWhere.demInputdate.gte = fromDate;
      if (toDate) demandWhere.demInputdate.lte = toDate;
    }

    // Build conditions for candidates
    const candWhere: any = {
      loc: factory,
      status: "1",
    };
    if (department) {
      candWhere.OR = [{ applyDp: department }, { tmpDepartid: department }];
    }
    if (position) {
      candWhere.position = position;
    }
    if (fromDate || toDate) {
      candWhere.keyInDate = {};
      if (fromDate) candWhere.keyInDate.gte = fromDate;
      if (toDate) candWhere.keyInDate.lte = toDate;
    }

    // Build conditions for resignations
    const resignWhere: any = {};
    if (department) {
      resignWhere.erDeptid = department;
    }
    if (fromDate || toDate) {
      resignWhere.erResigndate = {};
      if (fromDate) resignWhere.erResigndate.gte = new Date(fromDate);
      if (toDate) resignWhere.erResigndate.lte = new Date(toDate);
    }

    // Parallel fetch demands, candidates, resignations, awDepts
    const [demands, candidates, resignations, awDepts, reasonMasters] = await Promise.all([
      prisma.demandData.findMany({
        where: demandWhere,
        select: {
          demId: true,
          demDept: true,
          demPosition: true,
          demAmount: true,
          demRecruited: true,
          demInputdate: true,
        },
      }),
      prisma.employeeInfo.findMany({
        where: candWhere,
        select: {
          id: true,
          candidateName: true,
          keyInDate: true,
          actEnDate: true,
          exEnDate: true,
          hrIvDate: true,
          hrAcQu: true,
          dpAcQu: true,
          reg: true,
          applyDp: true,
          position: true,
          dateOfBirth: true,
        },
      }),
      prisma.resignData.findMany({
        where: resignWhere,
        select: {
          id: true,
          erDeptid: true,
          erReason: true,
          erResigndate: true,
          erAge: true,
        },
      }),
      prisma.awDept.findMany({
        select: {
          subDivision: true,
          department: true,
          name: true,
        },
      }),
      prisma.reasonResign.findMany({
        select: {
          id: true,
          reason: true,
        },
      }),
    ]);

    // Map department to division if needed
    const deptToDivMap = new Map<string, string>();
    for (const d of awDepts) {
      if (d.subDivision && d.department) {
        deptToDivMap.set(d.subDivision, d.department);
      }
    }

    // Apply division filter if requested
    let filteredDemands = demands;
    let filteredCandidates = candidates;
    let filteredResignations = resignations;

    if (division) {
      filteredDemands = demands.filter(
        (d) => deptToDivMap.get(d.demDept) === division || d.demDept === division
      );
      filteredCandidates = candidates.filter(
        (c) =>
          (c.applyDp && deptToDivMap.get(c.applyDp) === division) ||
          c.applyDp === division
      );
      filteredResignations = resignations.filter(
        (r) =>
          (r.erDeptid && deptToDivMap.get(r.erDeptid) === division) ||
          r.erDeptid === division
      );
    }

    // KPI Metrics
    const totalDemand = filteredDemands.reduce((sum, d) => sum + (d.demAmount || 0), 0);
    const totalRecruited = filteredCandidates.filter(
      (c) => c.actEnDate && c.actEnDate !== "no" && c.reg === "yes"
    ).length;
    const progressPercent = totalDemand > 0 ? Number(((totalRecruited / totalDemand) * 100).toFixed(1)) : 0;
    const interviewCount = filteredCandidates.filter((c) => c.hrIvDate && c.hrIvDate !== "no").length;
    const acceptedCount = filteredCandidates.filter(
      (c) => c.hrAcQu === "yes" && c.dpAcQu === "yes"
    ).length;
    const acceptanceRate =
      interviewCount > 0 ? Number(((acceptedCount / interviewCount) * 100).toFixed(1)) : 0;
    const totalResignations = filteredResignations.length;

    // Monthly Trend Series (based on candidate keyInDate / actEnDate)
    const monthlyMap = new Map<string, { month: string; demand: number; recruited: number; resigned: number }>();

    for (const d of filteredDemands) {
      const month = d.demInputdate ? d.demInputdate.slice(0, 7) : "Unknown";
      if (month === "Unknown") continue;
      const entry = monthlyMap.get(month) || { month, demand: 0, recruited: 0, resigned: 0 };
      entry.demand += d.demAmount;
      monthlyMap.set(month, entry);
    }

    for (const c of filteredCandidates) {
      const dateStr = (c.actEnDate && c.actEnDate !== "no" ? c.actEnDate : c.keyInDate) || "";
      const month = dateStr ? dateStr.slice(0, 7) : "Unknown";
      if (month === "Unknown") continue;
      const entry = monthlyMap.get(month) || { month, demand: 0, recruited: 0, resigned: 0 };
      if (c.actEnDate && c.actEnDate !== "no" && c.reg === "yes") {
        entry.recruited += 1;
      }
      monthlyMap.set(month, entry);
    }

    for (const r of filteredResignations) {
      const month = r.erResigndate
        ? new Date(r.erResigndate).toISOString().slice(0, 7)
        : "Unknown";
      if (month === "Unknown") continue;
      const entry = monthlyMap.get(month) || { month, demand: 0, recruited: 0, resigned: 0 };
      entry.resigned += 1;
      monthlyMap.set(month, entry);
    }

    const monthlyTrend = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    // Department Funnel Series
    const deptFunnelMap = new Map<
      string,
      { department: string; demand: number; applied: number; interviewed: number; accepted: number; hired: number }
    >();

    for (const d of filteredDemands) {
      const dept = d.demDept || "Other";
      const entry = deptFunnelMap.get(dept) || {
        department: dept,
        demand: 0,
        applied: 0,
        interviewed: 0,
        accepted: 0,
        hired: 0,
      };
      entry.demand += d.demAmount;
      deptFunnelMap.set(dept, entry);
    }

    for (const c of filteredCandidates) {
      const dept = c.applyDp || "Other";
      const entry = deptFunnelMap.get(dept) || {
        department: dept,
        demand: 0,
        applied: 0,
        interviewed: 0,
        accepted: 0,
        hired: 0,
      };
      entry.applied += 1;
      if (c.hrIvDate && c.hrIvDate !== "no") entry.interviewed += 1;
      if (c.hrAcQu === "yes" && c.dpAcQu === "yes") entry.accepted += 1;
      if (c.actEnDate && c.actEnDate !== "no" && c.reg === "yes") entry.hired += 1;
      deptFunnelMap.set(dept, entry);
    }

    const departmentFunnel = Array.from(deptFunnelMap.values());

    // Age Distribution Series (from candidates dateOfBirth)
    const currentYear = new Date().getFullYear();
    const ageDistribution = [
      { range: "18-24", count: 0 },
      { range: "25-34", count: 0 },
      { range: "35-44", count: 0 },
      { range: "45+", count: 0 },
    ];

    for (const c of filteredCandidates) {
      if (!c.dateOfBirth) continue;
      const birthYear = parseInt(c.dateOfBirth.slice(0, 4), 10);
      if (isNaN(birthYear) || birthYear <= 1900 || birthYear > currentYear) continue;
      const age = currentYear - birthYear;
      if (age >= 18 && age <= 24) ageDistribution[0].count++;
      else if (age >= 25 && age <= 34) ageDistribution[1].count++;
      else if (age >= 35 && age <= 44) ageDistribution[2].count++;
      else if (age >= 45) ageDistribution[3].count++;
    }

    // Resignation Pareto Series
    const reasonMasterMap = new Map<string, any>();
    for (const rm of reasonMasters) {
      reasonMasterMap.set(String(rm.id), rm.reason);
    }

    const reasonCountMap = new Map<string, number>();
    for (const r of filteredResignations) {
      const reasonCode = String(r.erReason || "").trim() || "Unknown";
      reasonCountMap.set(reasonCode, (reasonCountMap.get(reasonCode) || 0) + 1);
    }

    const sortedReasons = Array.from(reasonCountMap.entries())
      .map(([code, count]) => {
        const meta = reasonMasterMap.get(code);
        const name = meta && typeof meta === "object" ? (meta as any).vn || (meta as any).en || code : code;
        return { reasonCode: code, name, count };
      })
      .sort((a, b) => b.count - a.count);

    let cumulative = 0;
    const resignationPareto = sortedReasons.map((item) => {
      cumulative += item.count;
      const cumulativePercent =
        totalResignations > 0 ? Number(((cumulative / totalResignations) * 100).toFixed(1)) : 0;
      return {
        ...item,
        cumulativeCount: cumulative,
        cumulativePercent,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          totalDemand,
          totalRecruited,
          progressPercent,
          interviewCount,
          acceptanceRate,
          totalResignations,
        },
        charts: {
          monthlyTrend,
          departmentFunnel,
          ageDistribution,
          resignationPareto,
        },
      },
    });
  } catch (error: any) {
    console.error("Error generating dashboard analytics:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate dashboard analytics" },
      { status: 500 }
    );
  }
}
