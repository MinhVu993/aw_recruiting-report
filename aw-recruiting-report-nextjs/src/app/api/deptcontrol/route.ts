import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapAwDeptRecord } from "../depts/dept-mapper";

export async function GET() {
  try {
    const rawDepts = await prisma.awDept.findMany({
      orderBy: { id: "desc" },
    });

    const mapped = rawDepts.map((d) => {
      const mappedRecord = mapAwDeptRecord(d);
      return {
        ...mappedRecord,
        main_group: d.mainGroup,
        sub_department: d.subDepartment,
        sub_division: d.subDivision,
        department: d.department,
        name: mappedRecord.nameObj,
        start_date: mappedRecord.startDate,
        end_date: mappedRecord.endDate,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: mapped,
      dataDeptCode: mapped,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch department control records",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid or empty request body" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed JSON request body" },
      { status: 400 }
    );
  }

  try {
    const {
      id,
      department,
      main_group,
      sub_department,
      sub_division,
      name,
      start_date,
      end_date,
    } = body;

    let parsedName = name;
    if (typeof name === "string") {
      try {
        parsedName = JSON.parse(name);
      } catch {
        parsedName = { vi: name, en: name, cn: name };
      }
    }

    const parseDate = (d: unknown): Date | null => {
      if (!d || typeof d !== "string" && typeof d !== "number" && !(d instanceof Date)) {
        return null;
      }
      const parsed = new Date(d as string | number | Date);
      return !isNaN(parsed.getTime()) ? parsed : null;
    };

    const startDate = parseDate(start_date);
    const endDate = parseDate(end_date);

    const data = {
      department: department ? String(department).trim() : "",
      mainGroup: main_group ? String(main_group).trim() : null,
      subDepartment: sub_department ? String(sub_department).trim() : "",
      subDivision: sub_division ? String(sub_division).trim() : "",
      name: (parsedName as object) || {},
      startDate,
      endDate,
    };

    let result;
    if (id) {
      result = await prisma.awDept.update({
        where: { id: Number(id) },
        data,
      });
    } else {
      result = await prisma.awDept.create({
        data,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Saved successfully",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save department code",
      },
      { status: 500 }
    );
  }
}
