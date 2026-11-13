import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exportCandidatesToBuffer } from "@/lib/excel-export";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const demandId = searchParams.get("demand_id")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "1";
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";
    const loc = searchParams.get("loc")?.trim() || "aw";

    const where: any = {
      loc,
    };

    if (status !== "all") {
      where.status = status;
    }

    if (demandId) {
      where.empDemandid = demandId;
    }

    if (fromDate || toDate) {
      where.keyInDate = {};
      if (fromDate) {
        where.keyInDate.gte = fromDate;
      }
      if (toDate) {
        where.keyInDate.lte = toDate;
      }
    }

    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: "insensitive" } },
        { empId: { contains: search, mode: "insensitive" } },
        { newEmpno: { contains: search, mode: "insensitive" } },
        { oldEmpno: { contains: search, mode: "insensitive" } },
      ];
    }

    const candidates = await prisma.employeeInfo.findMany({
      where,
      orderBy: { id: "desc" },
    });

    const buffer = exportCandidatesToBuffer(candidates);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="candidates_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export candidates" },
      { status: 500 }
    );
  }
}
