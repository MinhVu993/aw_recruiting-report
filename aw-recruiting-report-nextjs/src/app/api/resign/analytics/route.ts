import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAwResignReportRow } from "@/lib/aw-report-calc";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";
    const deptId = searchParams.get("deptId")?.trim() || "";

    const where: any = {};
    if (deptId) {
      where.erDeptid = deptId;
    }
    if (fromDate || toDate) {
      where.erResigndate = {};
      if (fromDate) where.erResigndate.gte = new Date(fromDate);
      if (toDate) where.erResigndate.lte = new Date(toDate);
    }

    const [resignations, awDepts] = await Promise.all([
      prisma.resignData.findMany({
        where,
        select: {
          id: true,
          erDeptid: true,
          erDeptname: true,
          erAddress: true,
          erAge: true,
          erSeniority: true,
          erBus: true,
          erGender: true,
          erReason: true,
          erResigndate: true,
        },
      }),
      prisma.awDept.findMany({
        select: {
          subDivision: true,
          name: true,
        },
      }),
    ]);

    const deptNameMap = new Map<string, any>();
    for (const d of awDepts) {
      if (d.subDivision) {
        deptNameMap.set(d.subDivision, d.name);
      }
    }

    // Group by department
    const grouped = new Map<string, typeof resignations>();
    for (const r of resignations) {
      const dept = r.erDeptid || "Unknown";
      const list = grouped.get(dept) || [];
      list.push(r);
      grouped.set(dept, list);
    }

    const reportRows = Array.from(grouped.entries()).map(([dept, records]) => {
      const row = calculateAwResignReportRow(
        dept,
        records.map((r) => ({
          erAddress: r.erAddress,
          erAge: r.erAge,
          erSeniority: r.erSeniority,
          erBus: r.erBus,
          erGender: r.erGender,
          erReason: r.erReason,
        }))
      );
      return {
        ...row,
        deptName: deptNameMap.get(dept) || records[0]?.erDeptname || dept,
      };
    });

    // Also calculate overall summary
    const overallSummary = calculateAwResignReportRow(
      "TOTAL",
      resignations.map((r) => ({
        erAddress: r.erAddress,
        erAge: r.erAge,
        erSeniority: r.erSeniority,
        erBus: r.erBus,
        erGender: r.erGender,
        erReason: r.erReason,
      }))
    );

    return NextResponse.json({
      success: true,
      data: reportRows,
      summary: overallSummary,
    });
  } catch (error: any) {
    console.error("Error generating resign analytics:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate resign analytics" },
      { status: 500 }
    );
  }
}
