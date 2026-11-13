import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapAwDeptRecord } from "./dept-mapper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const div = searchParams.get("div");
    const search = searchParams.get("search");
    const all = searchParams.get("all") === "true";

    const where: Record<string, unknown> = {};

    if (div) {
      where.department = div;
    }

    if (search) {
      where.OR = [
        { department: { contains: search, mode: "insensitive" } },
        { subDepartment: { contains: search, mode: "insensitive" } },
        { subDivision: { contains: search, mode: "insensitive" } },
      ];
    }

    const depts = await prisma.awDept.findMany({
      where,
      orderBy: [{ department: "asc" }, { subDepartment: "asc" }, { subDivision: "asc" }],
    });

    // Check if we need fallback names from aw_dept_code
    const deptCodes = await prisma.awDeptCode.findMany();
    const deptCodeMap = new Map<string, unknown>();
    for (const code of deptCodes) {
      deptCodeMap.set(code.deptCode, code.name);
    }

    const mapped = depts.map((d) => {
      let recordName: unknown = d.name;
      // If deptCode name is empty/missing in aw_dept.name, fallback from aw_dept_code
      const isEmptyName =
        !recordName ||
        (typeof recordName === "object" && Object.keys(recordName as object).length === 0) ||
        recordName === "{}" ||
        recordName === "";

      if (isEmptyName && deptCodeMap.has(d.subDivision)) {
        recordName = deptCodeMap.get(d.subDivision);
      }

      return mapAwDeptRecord({
        id: d.id,
        department: d.department,
        mainGroup: d.mainGroup,
        subDepartment: d.subDepartment,
        subDivision: d.subDivision,
        startDate: d.startDate,
        endDate: d.endDate,
        name: recordName,
      });
    });

    const filtered = all ? mapped : mapped.filter((d) => d.active);

    if (type === "divs") {
      const divMap = new Map<string, { id: number; code: string; name: string }>();
      for (const item of filtered) {
        if (item.div && !divMap.has(item.div)) {
          divMap.set(item.div, {
            id: item.id,
            code: item.div,
            name: item.div,
          });
        }
      }
      return NextResponse.json({
        success: true,
        data: Array.from(divMap.values()),
      });
    }

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch departments",
      },
      { status: 500 }
    );
  }
}
