import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileAwDemandByDemId } from "@/lib/aw-demand-utils";

export async function POST() {
  try {
    const demands = await prisma.demandData.findMany({
      where: {
        demId: { not: null },
      },
      select: {
        id: true,
        demId: true,
      },
    });

    let syncedCount = 0;
    const results: { demId: string; success: boolean; error?: string }[] = [];

    for (const d of demands) {
      if (!d.demId) continue;
      try {
        const updated = await reconcileAwDemandByDemId(d.demId, prisma);
        if (updated) {
          syncedCount++;
          results.push({ demId: d.demId, success: true });
        } else {
          results.push({ demId: d.demId, success: false, error: "Demand not found or empty" });
        }
      } catch (err: any) {
        results.push({ demId: d.demId, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      totalDemands: demands.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync all demands" },
      { status: 500 }
    );
  }
}
