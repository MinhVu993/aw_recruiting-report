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
      ranks: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09"],
      parameters: ["A01", "A02", "CN01", "CN02", "CN03", "TW-VN"],
      trials: [6, 30, 60],
      married: [
        { code: "0", name: "Độc thân", name_vi: "Độc thân", name_en: "Single", name_cn: "未婚" },
        { code: "1", name: "Đã kết hôn", name_vi: "Đã kết hôn", name_en: "Married", name_cn: "已婚" },
      ],
      directs: [
        { code: "0", name: "Trực tiếp", name_vi: "Trực tiếp", name_en: "Direct", name_cn: "直接" },
        { code: "1", name: "Gián tiếp", name_vi: "Gián tiếp", name_en: "Indirect", name_cn: "間接" },
        { code: "3", name: "Bán trực tiếp", name_vi: "Bán trực tiếp", name_en: "Semi-direct", name_cn: "半直接" },
      ],
      nations: ["CA", "CN", "DE", "ES", "FR", "IN", "JP", "KH", "MA", "MM", "PH", "SG", "TW", "US", "VN"],
      nationalities: [
        "Việt Nam",
        "Canada",
        "China",
        "Germany",
        "Spain",
        "France",
        "India",
        "Japan",
        "Cambodia",
        "Morocco",
        "Myanmar",
        "Philippines",
        "Singapore",
        "Taiwan",
        "United States",
        "Vietnam",
      ],
      codeMcs: ["SCS006"],
      locWorks: ["AW"],
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
