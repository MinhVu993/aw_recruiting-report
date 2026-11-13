import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapAwDeptRecord } from "../../depts/dept-mapper";

export async function GET() {
  try {
    const [
      birthProvinces,
      dutyHrms,
      eduHrms,
      nationHrms,
      jobLevels,
      rawDepts,
      sourceRecruits,
    ] = await Promise.all([
      prisma.birthProvince.findMany({ orderBy: { provinceNo: "asc" } }),
      prisma.dutyHrm.findMany({ orderBy: { dutyNo: "asc" } }),
      prisma.eduHrm.findMany({ orderBy: { eduNo: "asc" } }),
      prisma.nationHrm.findMany({ orderBy: { nationCode: "asc" } }),
      prisma.jobLevelTbl.findMany({ orderBy: { jobCode: "asc" } }),
      prisma.awDept.findMany({
        orderBy: [{ department: "asc" }, { subDepartment: "asc" }, { subDivision: "asc" }],
      }),
      prisma.sourceRecruit.findMany({ orderBy: { id: "asc" } }),
    ]);

    const departments = rawDepts.map((d) => mapAwDeptRecord(d));

    return NextResponse.json({
      success: true,
      data: {
        birthProvinces,
        dutyHrms,
        eduHrms,
        nationHrms,
        jobLevels,
        departments,
        sourceRecruits,
      },
      // Convenience top-level mappings for compatibility
      birthProvinces,
      dutyHrms,
      eduHrms,
      nationHrms,
      jobLevels,
      departments,
      sourceRecruits,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load HRM options",
      },
      { status: 500 }
    );
  }
}
