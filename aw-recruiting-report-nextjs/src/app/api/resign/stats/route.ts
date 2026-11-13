import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const [resignations, reasonMasters] = await Promise.all([
      prisma.resignData.findMany({
        where,
        select: {
          id: true,
          erDeptid: true,
          erReason: true,
          erResigndate: true,
          erSeniority: true,
          erAge: true,
        },
      }),
      prisma.reasonResign.findMany({
        select: { id: true, reason: true },
      }),
    ]);

    const totalResignations = resignations.length;

    // Reason name mapping
    const reasonMasterMap = new Map<string, any>();
    for (const rm of reasonMasters) {
      reasonMasterMap.set(String(rm.id), rm.reason);
    }

    // Top reasons
    const reasonCounts = new Map<string, number>();
    for (const r of resignations) {
      const code = String(r.erReason || "").trim() || "Unknown";
      reasonCounts.set(code, (reasonCounts.get(code) || 0) + 1);
    }

    const topReasons = Array.from(reasonCounts.entries())
      .map(([code, count]) => {
        const meta = reasonMasterMap.get(code);
        const name =
          meta && typeof meta === "object"
            ? (meta as any).vn || (meta as any).en || code
            : code;
        const percentage =
          totalResignations > 0
            ? Number(((count / totalResignations) * 100).toFixed(1))
            : 0;
        return {
          reasonCode: code,
          reasonName: name,
          count,
          percentage,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Monthly trend
    const monthlyCounts = new Map<string, number>();
    for (const r of resignations) {
      if (!r.erResigndate) continue;
      const month = new Date(r.erResigndate).toISOString().slice(0, 7);
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);
    }

    const monthlyTrend = Array.from(monthlyCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      success: true,
      data: {
        totalResignations,
        topReasons,
        monthlyTrend,
      },
    });
  } catch (error: any) {
    console.error("Error fetching resign stats:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch resign stats" },
      { status: 500 }
    );
  }
}
