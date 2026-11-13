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
    const positions = dutyHrms.map((d) => {
      const j = (d.dutyName && typeof d.dutyName === "object" ? d.dutyName : {}) as Record<string, string>;
      return {
        code: d.dutyNo,
        name: j.vi || j.en || j.cn || d.dutyNo,
        name_vi: j.vi || "",
        name_en: j.en || "",
        name_cn: j.cn || "",
      };
    });
    const edus = eduHrms.map((e) => ({ code: e.eduNo, name: e.eduName }));
    const dantocs = nationHrms.map((n) => ({
      code: n.nationCode,
      name: n.nationName || n.nationCode,
    }));
    const provinces = birthProvinces.map((p) => ({
      code: p.provinceNo,
      name: p.provinceName,
    }));
    const levels = jobLevels.map((l) => l.jobCode).filter(Boolean);
    const sources = sourceRecruits.map((s) => {
      const src = (s.source && typeof s.source === "object" ? s.source : {}) as Record<string, string>;
      const code = String(s.id);
      return {
        code,
        name: src.vi || src.en || src.cn || code,
        name_vi: src.vi || "",
        name_en: src.en || "",
        name_cn: src.cn || "",
      };
    });

    const formattedData = {
      birthProvinces,
      dutyHrms,
      eduHrms,
      nationHrms,
      jobLevels,
      departments,
      sourceRecruits,
      positions,
      edus,
      dantocs,
      provinces,
      levels,
      sources,
      ranks: [] as string[],
      parameters: [] as string[],
      trials: [] as number[],
      religious: [] as Array<{ code: string; name: string }>,
      married: [] as Array<{ code: string; name: string }>,
      nations: [] as string[],
      nationalities: [] as string[],
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
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
