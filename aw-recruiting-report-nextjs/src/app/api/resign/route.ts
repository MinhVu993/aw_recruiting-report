import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const deptId = searchParams.get("deptId")?.trim() || "";
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (deptId) {
      where.erDeptid = deptId;
    }

    if (fromDate || toDate) {
      where.erResigndate = {};
      if (fromDate) where.erResigndate.gte = new Date(fromDate);
      if (toDate) where.erResigndate.lte = new Date(toDate);
    }

    if (search) {
      where.OR = [
        { erName: { contains: search, mode: "insensitive" } },
        { erEmpid: { contains: search, mode: "insensitive" } },
        { erNumberid: { contains: search, mode: "insensitive" } },
        { erDeptname: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.resignData.count({ where }),
      prisma.resignData.findMany({
        where,
        skip,
        take: limit,
        orderBy: { erResigndate: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching resign data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch resign data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      erEmpid,
      erIndate,
      erNumberid,
      erName,
      erDeptid,
      erDeptname,
      erJoblevel,
      erAge,
      erSeniority,
      erBus,
      erGender,
      erHometown,
      erAddress,
      erReason,
      erNote,
      erKeyindate,
      erResigndate,
    } = body;

    if (!erEmpid || !erName || !erDeptid) {
      return NextResponse.json(
        { success: false, message: "erEmpid, erName and erDeptid are required" },
        { status: 400 }
      );
    }

    const payload = {
      erEmpid: String(erEmpid),
      erIndate: erIndate ? new Date(erIndate) : new Date(),
      erNumberid: String(erNumberid || ""),
      erName: String(erName),
      erDeptid: String(erDeptid),
      erDeptname: String(erDeptname || ""),
      erJoblevel: String(erJoblevel || ""),
      erAge: Number(erAge) || 0,
      erSeniority: Number(erSeniority) || 0,
      erBus: String(erBus || ""),
      erGender: String(erGender || ""),
      erHometown: String(erHometown || ""),
      erAddress: String(erAddress || ""),
      erReason: String(erReason || ""),
      erNote: erNote !== undefined ? erNote : null,
      erKeyindate: erKeyindate ? new Date(erKeyindate) : new Date(),
      erResigndate: erResigndate ? new Date(erResigndate) : new Date(),
    };

    let result;
    if (id) {
      result = await prisma.resignData.update({
        where: { id: Number(id) },
        data: payload,
      });
    } else {
      result = await prisma.resignData.create({
        data: payload,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error saving resign data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save resign data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: "Missing id query parameter" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid id format" },
        { status: 400 }
      );
    }

    await prisma.resignData.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted resign record ${id}`,
    });
  } catch (error: any) {
    console.error("Error deleting resign record:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete resign record" },
      { status: 500 }
    );
  }
}
