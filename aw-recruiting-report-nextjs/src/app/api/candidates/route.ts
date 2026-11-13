import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileAwDemandByDemId } from "@/lib/aw-demand-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const demandId = searchParams.get("demand_id")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "1";
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";
    const loc = searchParams.get("loc")?.trim() || "aw";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

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
        { regTel: { contains: search, mode: "insensitive" } },
        { commTel: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, candidates] = await Promise.all([
      prisma.employeeInfo.count({ where }),
      prisma.employeeInfo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
    ]);

    // Attach dept details from AwDept if available
    const deptCodes = Array.from(
      new Set(
        candidates
          .map((c) => c.tmpDepartid || c.applyDp)
          .filter((code): code is string => Boolean(code && code.trim()))
      )
    );

    let deptMap = new Map<string, any>();
    if (deptCodes.length > 0) {
      const depts = await prisma.awDept.findMany({
        where: {
          subDivision: { in: deptCodes },
        },
      });
      for (const d of depts) {
        deptMap.set(d.subDivision, d);
      }
    }

    const data = candidates.map((c) => {
      const deptCode = c.tmpDepartid || c.applyDp || "";
      const dept = deptMap.get(deptCode) || null;
      return {
        ...c,
        awDept: dept,
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
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;

    const data: any = { ...rest };

    if (!data.loc) {
      data.loc = "aw";
    }
    if (data.status === undefined || data.status === null) {
      data.status = "1";
    } else {
      data.status = String(data.status);
    }

    let savedCandidate;

    if (id) {
      const numId = parseInt(String(id), 10);
      savedCandidate = await prisma.employeeInfo.update({
        where: { id: numId },
        data,
      });
    } else {
      if (!data.keyInDate) {
        data.keyInDate = new Date().toISOString().slice(0, 10);
      }
      savedCandidate = await prisma.employeeInfo.create({
        data,
      });
    }

    if (savedCandidate.empDemandid) {
      try {
        await reconcileAwDemandByDemId(savedCandidate.empDemandid, prisma);
      } catch (e) {
        console.error("Demand reconciliation error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      data: savedCandidate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save candidate" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let idParam = searchParams.get("id");

    if (!idParam) {
      try {
        const body = await request.json();
        if (body && body.id) {
          idParam = String(body.id);
        }
      } catch {
        // Body optional
      }
    }

    if (!idParam) {
      return NextResponse.json(
        { success: false, error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    const numId = parseInt(idParam, 10);
    const updated = await prisma.employeeInfo.update({
      where: { id: numId },
      data: { status: "0" },
    });

    if (updated.empDemandid) {
      try {
        await reconcileAwDemandByDemId(updated.empDemandid, prisma);
      } catch (e) {
        console.error("Demand reconciliation error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Candidate soft deleted successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete candidate" },
      { status: 500 }
    );
  }
}
