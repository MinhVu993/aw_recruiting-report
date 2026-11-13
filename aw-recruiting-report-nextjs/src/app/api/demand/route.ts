import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseMultilangName } from "@/app/api/depts/dept-mapper";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const position = searchParams.get("position")?.trim() || "";
    const checkId = searchParams.get("checkId")?.trim() || searchParams.get("dem_id")?.trim() || "";

    // Parity with legacy checkDemandId
    if (checkId) {
      const exists = await prisma.demandData.findFirst({
        where: { demId: checkId },
        select: { id: true },
      });
      return NextResponse.json({ exists: Boolean(exists) });
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.max(1, Math.min(1000, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (position) {
      where.demPosition = position;
    }

    if (search) {
      where.OR = [
        { demId: { contains: search, mode: "insensitive" } },
        { demDept: { contains: search, mode: "insensitive" } },
        { demPosition: { contains: search, mode: "insensitive" } },
        { demUnit: { contains: search, mode: "insensitive" } },
        { demSubDepartment: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, demands] = await Promise.all([
      prisma.demandData.count({ where }),
      prisma.demandData.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
    ]);

    // Attach dept multilang details from awDept
    const deptCodes = Array.from(
      new Set(
        demands
          .map((d) => d.demUnit || d.demSubDepartment || d.demDept)
          .filter((c): c is string => Boolean(c && c.trim()))
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

    const data = demands.map((d) => {
      const unitCode = d.demUnit || d.demSubDepartment || d.demDept;
      const awDept = deptMap.get(unitCode) || null;
      const parsedName = awDept ? parseMultilangName(awDept.name, unitCode) : null;
      return {
        ...d,
        awDept,
        multilangName: parsedName,
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
      { success: false, error: error.message || "Failed to fetch demands" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, dem_id, demId, ...rest } = body;

    const targetDemId = (demId || dem_id || "").trim();

    // Look for existing by id or demId
    let existingDemand = null;
    if (id) {
      const numId = parseInt(String(id), 10);
      if (!isNaN(numId)) {
        existingDemand = await prisma.demandData.findUnique({ where: { id: numId } });
      }
    }
    if (!existingDemand && targetDemId) {
      existingDemand = await prisma.demandData.findFirst({ where: { demId: targetDemId } });
    }

    const demAmount = Number(body.dem_amount ?? body.demAmount ?? existingDemand?.demAmount ?? 0);
    const recruited = Number(body.dem_recruited ?? body.demRecruited ?? existingDemand?.demRecruited ?? 0);
    const stocknumber = Math.max(0, demAmount - recruited);
    const isFulfilled = stocknumber === 0;

    const dataToSave: any = {
      demDept: body.dem_dept ?? body.demDept ?? existingDemand?.demDept ?? "",
      demSubDepartment: body.dem_sub_department ?? body.demSubDepartment ?? existingDemand?.demSubDepartment ?? null,
      demUnit: body.dem_unit ?? body.demUnit ?? existingDemand?.demUnit ?? null,
      demPosition: body.dem_position ?? body.demPosition ?? existingDemand?.demPosition ?? "",
      demSubPosition: body.dem_sub_position ?? body.demSubPosition ?? existingDemand?.demSubPosition ?? null,
      demAmount,
      demInputdate: body.dem_inputdate ?? body.demInputdate ?? existingDemand?.demInputdate ?? new Date().toISOString().slice(0, 10),
      demRecruited: recruited,
      demFulfilled: isFulfilled ? "yes" : "no",
      demFullfilldate: isFulfilled ? (body.dem_fullfilldate ?? body.demFullfilldate ?? new Date().toISOString().slice(0, 10)) : null,
      stocknumber,
      demNote: body.dem_note ?? body.demNote ?? existingDemand?.demNote ?? null,
      demPauseStartAt: body.dem_pause_start_at ?? body.demPauseStartAt ?? existingDemand?.demPauseStartAt ?? null,
      demPauseEndAt: body.dem_pause_end_at ?? body.demPauseEndAt ?? existingDemand?.demPauseEndAt ?? null,
      demCancelDate: body.dem_cancel_date ?? body.demCancelDate ?? existingDemand?.demCancelDate ?? null,
      userInput: body.user_input ?? body.userInput ?? existingDemand?.userInput ?? null,
      userUpdate: body.user_update ?? body.userUpdate ?? existingDemand?.userUpdate ?? null,
    };

    if (body.dem_candidates !== undefined || body.demCandidates !== undefined) {
      dataToSave.demCandidates = body.dem_candidates ?? body.demCandidates;
    }

    let savedDemand;
    if (existingDemand) {
      if (targetDemId) {
        dataToSave.demId = targetDemId;
      }
      savedDemand = await prisma.demandData.update({
        where: { id: existingDemand.id },
        data: dataToSave,
      });
    } else {
      if (!targetDemId) {
        return NextResponse.json(
          { success: false, error: "demId is required when creating a new demand" },
          { status: 400 }
        );
      }
      // Check duplicate
      const duplicate = await prisma.demandData.findFirst({ where: { demId: targetDemId } });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Demand ID '${targetDemId}' already exists` },
          { status: 400 }
        );
      }
      dataToSave.demId = targetDemId;
      savedDemand = await prisma.demandData.create({
        data: dataToSave,
      });
    }

    return NextResponse.json({
      success: true,
      data: savedDemand,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save demand" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let idParam = searchParams.get("id");
    let demIdParam = searchParams.get("dem_id") || searchParams.get("demId");

    if (!idParam && !demIdParam) {
      try {
        const body = await request.json();
        if (body) {
          idParam = body.id ? String(body.id) : null;
          demIdParam = body.dem_id || body.demId;
        }
      } catch {
        // Body optional
      }
    }

    if (!idParam && !demIdParam) {
      return NextResponse.json(
        { success: false, error: "id or demId is required to delete demand" },
        { status: 400 }
      );
    }

    let deleted;
    if (idParam) {
      const numId = parseInt(idParam, 10);
      deleted = await prisma.demandData.delete({ where: { id: numId } });
    } else if (demIdParam) {
      deleted = await prisma.demandData.delete({ where: { demId: demIdParam } });
    }

    return NextResponse.json({
      success: true,
      message: "Demand deleted successfully",
      data: deleted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete demand" },
      { status: 500 }
    );
  }
}
