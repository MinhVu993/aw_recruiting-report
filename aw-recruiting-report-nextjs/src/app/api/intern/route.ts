import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const deptCode = searchParams.get("deptCode")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (deptCode) {
      where.inDeptcode = parseInt(deptCode, 10) || 0;
    }

    const now = new Date();
    if (status === "active") {
      where.OR = [
        { inEnddate: null },
        { inEnddate: { gte: now } },
      ];
    } else if (status === "completed") {
      where.inEnddate = { lt: now };
    }

    if (search) {
      const searchConditions: any[] = [
        { inName: { contains: search, mode: "insensitive" } },
        { inEmpid: { contains: search, mode: "insensitive" } },
        { inSchool: { contains: search, mode: "insensitive" } },
        { inMajor: { contains: search, mode: "insensitive" } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [total, interns] = await Promise.all([
      prisma.internData.count({ where }),
      prisma.internData.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
    ]);

    // Attach department code name if available
    const deptCodes = Array.from(new Set(interns.map((i) => String(i.inDeptcode))));
    const awDepts = deptCodes.length > 0
      ? await prisma.awDeptCode.findMany({
          where: { deptCode: { in: deptCodes } },
        })
      : [];

    const deptMap = new Map<string, any>();
    for (const d of awDepts) {
      deptMap.set(d.deptCode, d.name);
    }

    const formatDateOnly = (d: Date | string | null | undefined) => {
      if (!d) return "";
      if (d instanceof Date) return d.toISOString().split("T")[0];
      return String(d).split("T")[0];
    };

    const isYesFlag = (v: unknown) => {
      if (v === true || v === 1) return true;
      const s = String(v ?? "").trim().toLowerCase();
      return s === "yes" || s === "true" || s === "1";
    };

    const data = interns.map((item) => {
      const rawDeptName = deptMap.get(String(item.inDeptcode));
      const resolvedDeptName =
        rawDeptName && typeof rawDeptName === "object"
          ? rawDeptName.vi || rawDeptName.en || rawDeptName.cn || String(item.inDeptcode)
          : rawDeptName
          ? String(rawDeptName)
          : String(item.inDeptcode || "");

      const endDateStr = formatDateOnly(item.inEnddate);
      const isCompleted = Boolean(item.inEnddate && item.inEnddate < now);

      return {
        ...item,
        empId: item.inEmpid || "",
        studentName: item.inName || "",
        deptCode: item.inDeptcode ?? null,
        deptName: resolvedDeptName,
        school: item.inSchool || "",
        educationLevel: item.inEdulv || "",
        major: item.inMajor || "",
        startDate: formatDateOnly(item.inStartdate),
        endDate: endDateStr,
        allowance: isYesFlag(item.inAllowance),
        bus: isYesFlag(item.inBus),
        recruitType: item.inRectype || "",
        workingTime: item.inWorkingtime || "",
        notes: item.inNote || "",
        photoUrl: item.inPhoto || null,
        loc: "aw",
        status: isCompleted ? "completed" : "active",
      };
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching intern data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch intern data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      inEmpid,
      inName,
      inDeptcode,
      inSchool,
      inEdulv,
      inMajor,
      inStartdate,
      inEnddate,
      inAllowance,
      inBus,
      inRectype,
      inWorkingtime,
      inNote,
      inPhoto,
    } = body;

    if (!inEmpid || !inName || inDeptcode === undefined) {
      return NextResponse.json(
        { success: false, message: "inEmpid, inName and inDeptcode are required" },
        { status: 400 }
      );
    }

    const payload = {
      inEmpid: String(inEmpid),
      inName: String(inName),
      inDeptcode: Number(inDeptcode) || 0,
      inSchool: String(inSchool || ""),
      inEdulv: String(inEdulv || ""),
      inMajor: String(inMajor || ""),
      inStartdate: inStartdate ? new Date(inStartdate) : null,
      inEnddate: inEnddate ? new Date(inEnddate) : null,
      inAllowance: String(inAllowance || ""),
      inBus: String(inBus || ""),
      inRectype: String(inRectype || ""),
      inWorkingtime: String(inWorkingtime || ""),
      inNote: inNote !== undefined ? inNote : null,
      inPhoto: inPhoto !== undefined ? inPhoto : null,
    };

    let result;
    if (id) {
      result = await prisma.internData.update({
        where: { id: Number(id) },
        data: payload,
      });
    } else {
      result = await prisma.internData.create({
        data: payload,
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error saving intern data:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save intern data" },
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

    await prisma.internData.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted intern record ${id}`,
    });
  } catch (error: any) {
    console.error("Error deleting intern record:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete intern record" },
      { status: 500 }
    );
  }
}
