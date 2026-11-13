import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAwRecruitReportRow } from "@/lib/aw-report-calc";
import { parseMultilangName } from "@/app/api/depts/dept-mapper";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";
    const department = searchParams.get("department")?.trim() || "";
    const keyInDate = searchParams.get("keyInDate")?.trim() || "";

    // Parse department filter: could be comma-separated or single
    const depts = department
      ? department
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
      : [];

    // Find employee records where actEnDate is within range
    // or keyInDate is within range
    const empDateConditions: any[] = [];
    if (fromDate || toDate) {
      const actCond: any = {};
      const keyCond: any = {};
      if (fromDate) {
        actCond.gte = fromDate;
        keyCond.gte = fromDate;
      }
      if (toDate) {
        actCond.lte = toDate;
        keyCond.lte = toDate;
      }
      empDateConditions.push({ actEnDate: actCond }, { keyInDate: keyCond });
    }

    const matchingCandidates = await prisma.employeeInfo.findMany({
      where: {
        status: "1",
        ...(empDateConditions.length > 0 ? { OR: empDateConditions } : {}),
      },
      select: {
        empDemandid: true,
      },
    });

    const activeDemandIds = Array.from(
      new Set(
        matchingCandidates
          .map((c) => c.empDemandid)
          .filter((id): id is string => Boolean(id && id.trim()))
      )
    );

    // Build demand query conditions
    const demandOrConditions: any[] = [];
    if (activeDemandIds.length > 0) {
      demandOrConditions.push({ demId: { in: activeDemandIds } });
    }
    if (fromDate || toDate) {
      const inputDateCond: any = {};
      if (fromDate) inputDateCond.gte = fromDate;
      if (toDate) inputDateCond.lte = toDate;
      demandOrConditions.push({ demInputdate: inputDateCond });
    }

    const demandWhere: any = {};
    if (depts.length > 0) {
      demandWhere.demDept = { in: depts };
    }
    if (demandOrConditions.length > 0) {
      demandWhere.OR = demandOrConditions;
    }

    const demands = await prisma.demandData.findMany({
      where: demandWhere,
      select: {
        id: true,
        demId: true,
        demDept: true,
        demUnit: true,
        demSubDepartment: true,
        demPosition: true,
        demSubPosition: true,
        demInputdate: true,
        demNote: true,
        demAmount: true,
      },
      orderBy: { id: "desc" },
    });

    // Group and deduplicate combination key: demId-demDept_demUnit_demPosition
    type UniqueDemand = {
      id: number;
      demId: string;
      demDept: string;
      demUnit: string | null;
      demSubDepartment: string | null;
      demPosition: string;
      demSubPosition: string | null;
      demInputdate: string;
      demNote: string | null;
      demandAmount: number;
    };

    const demandMap = new Map<string, UniqueDemand>();

    for (const d of demands) {
      if (!d.demId) continue;
      const key = `${d.demId}-${d.demDept}_${d.demUnit || ""}_${d.demPosition}`;
      const existing = demandMap.get(key);
      if (existing) {
        existing.demandAmount += d.demAmount;
      } else {
        demandMap.set(key, {
          id: d.id,
          demId: d.demId,
          demDept: d.demDept,
          demUnit: d.demUnit,
          demSubDepartment: d.demSubDepartment,
          demPosition: d.demPosition,
          demSubPosition: d.demSubPosition,
          demInputdate: d.demInputdate,
          demNote: d.demNote,
          demandAmount: d.demAmount,
        });
      }
    }

    const uniqueDemands = Array.from(demandMap.values());
    const uniqueDemandIds = Array.from(new Set(uniqueDemands.map((d) => d.demId)));
    const uniqueDeptCodes = Array.from(
      new Set(
        uniqueDemands
          .flatMap((d) => [d.demDept, d.demSubDepartment, d.demUnit])
          .filter((code): code is string => Boolean(code && code.trim()))
      )
    );

    // Fetch related candidates and department metadata in parallel
    const [allRelatedCandidates, awDepts] = await Promise.all([
      uniqueDemandIds.length > 0
        ? prisma.employeeInfo.findMany({
            where: {
              empDemandid: { in: uniqueDemandIds },
              status: "1",
            },
            select: {
              empDemandid: true,
              applyDp: true,
              actEnDate: true,
              exEnDate: true,
              hrIvDate: true,
              hrAcDate: true,
              dpAcDate: true,
              hrAcQu: true,
              dpAcQu: true,
              reg: true,
              brouComBus: true,
              regedForBus: true,
            },
          })
        : Promise.resolve([]),
      uniqueDeptCodes.length > 0
        ? prisma.awDept.findMany({
            where: {
              subDivision: { in: uniqueDeptCodes },
            },
          })
        : Promise.resolve([]),
    ]);

    const deptMetaMap = new Map<string, any>();
    for (const dept of awDepts) {
      deptMetaMap.set(dept.subDivision, dept);
    }

    // Group candidates by empDemandid
    const candidatesByDemand = new Map<string, typeof allRelatedCandidates>();
    for (const c of allRelatedCandidates) {
      if (!c.empDemandid) continue;
      const list = candidatesByDemand.get(c.empDemandid) || [];
      list.push(c);
      candidatesByDemand.set(c.empDemandid, list);
    }

    const reportRows: any[] = [];
    let totalDemand = 0;
    let totalRecruited = 0;
    let totalStillInNeed = 0;
    let totalInterview = 0;
    let totalBus = 0;

    const divisionSet = new Set<string>();
    const departmentSet = new Set<string>();
    const unitSet = new Set<string>();
    const deptByDivMap = new Map<string, Set<string>>();
    const unitByDeptMap = new Map<string, Set<string>>();

    for (const d of uniqueDemands) {
      const candidatesForDem = (candidatesByDemand.get(d.demId) || []).filter(
        (c) => !c.applyDp || c.applyDp === d.demDept
      );

      const calculated = calculateAwRecruitReportRow({
        demId: d.demId,
        demNote: d.demNote,
        demDept: d.demDept,
        demSubDepartment: d.demSubDepartment,
        demUnit: d.demUnit,
        position: d.demPosition,
        demandAmount: d.demandAmount,
        fromdate: fromDate,
        todate: toDate,
        keyInDate,
        empnoInfos: candidatesForDem,
      });

      // Filter parity: demand > 0 || totalRecruitedUntilToday > 0 (or candidates exist)
      if (calculated.demand > 0 || calculated.totalRecruitedUntilToday > 0 || candidatesForDem.length > 0) {
        const deptMeta = deptMetaMap.get(d.demDept) || null;
        const subDeptMeta = d.demSubDepartment ? deptMetaMap.get(d.demSubDepartment) || null : null;
        const unitMeta = d.demUnit ? deptMetaMap.get(d.demUnit) || null : null;
        const unitFallback = d.demUnit || d.demSubDepartment || d.demDept;
        const demUnitName = parseMultilangName(unitMeta?.name ?? subDeptMeta?.name ?? deptMeta?.name, unitFallback);
        const deptAccRateNum =
          calculated.accByHR > 0 ? Math.round((calculated.accByDept / calculated.accByHR) * 100) : 0;
        const employmentRateNum =
          calculated.accByDept > 0
            ? Math.round((calculated.actualEnrollDate / calculated.accByDept) * 100)
            : 0;

        if (d.demDept) {
          divisionSet.add(d.demDept);
          if (!deptByDivMap.has(d.demDept)) deptByDivMap.set(d.demDept, new Set());
        }
        if (d.demSubDepartment) {
          departmentSet.add(d.demSubDepartment);
          if (d.demDept) deptByDivMap.get(d.demDept)?.add(d.demSubDepartment);
          if (!unitByDeptMap.has(d.demSubDepartment)) unitByDeptMap.set(d.demSubDepartment, new Set());
        }
        if (d.demUnit) {
          unitSet.add(d.demUnit);
          if (d.demSubDepartment) unitByDeptMap.get(d.demSubDepartment)?.add(d.demUnit);
        }

        const row = {
          id: d.id,
          id_code: d.demId,
          ...calculated,
          sub_position: d.demSubPosition || "",
          dem_inputdate: d.demInputdate || "",
          dem_unit_name: demUnitName,
          deptAccRate: `${deptAccRateNum}%`,
          deptAccRateNum,
          employmentRate: `${employmentRateNum}%`,
          employmentRateNum,
          offerCycleTimeAvg: 0,
          enrolledCycleTimeAvg: 0,
          deptName: deptMeta?.name || null,
          subDeptName: subDeptMeta?.name || null,
          unitName: unitMeta?.name || null,
        };

        reportRows.push(row);
        totalDemand += calculated.demand;
        totalRecruited += calculated.totalRecruitedUntilToday;
        totalStillInNeed += calculated.stillInNeedUntilToday;
        totalInterview += calculated.comeToInterview;
        totalBus += calculated.comeByBus;
      }
    }

    const deptByDiv: Record<string, string[]> = {};
    deptByDivMap.forEach((set, key) => {
      deptByDiv[key] = Array.from(set).sort();
    });
    const unitByDept: Record<string, string[]> = {};
    unitByDeptMap.forEach((set, key) => {
      unitByDept[key] = Array.from(set).sort();
    });

    return NextResponse.json({
      success: true,
      data: reportRows,
      hierarchy: {
        divisions: Array.from(divisionSet).sort(),
        departments: Array.from(departmentSet).sort(),
        units: Array.from(unitSet).sort(),
        deptByDiv,
        unitByDept,
      },
      summary: {
        totalDemand,
        totalRecruited,
        totalStillInNeed,
        totalInterview,
        totalBus,
      },
    });
  } catch (error: any) {
    console.error("Error generating recruiting report:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate recruiting report" },
      { status: 500 }
    );
  }
}
