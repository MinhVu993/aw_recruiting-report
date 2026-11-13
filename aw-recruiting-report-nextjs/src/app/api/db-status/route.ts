import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const [employeeInfoCount, demandDataCount, awDeptCount, resignDataCount] =
      await Promise.all([
        prisma.employeeInfo.count(),
        prisma.demandData.count(),
        prisma.awDept.count(),
        prisma.resignData.count(),
      ]);

    return NextResponse.json({
      status: "connected",
      counts: {
        employeeInfo: employeeInfoCount,
        demandData: demandDataCount,
        awDept: awDeptCount,
        resignData: resignDataCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unreachable",
        error: error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
