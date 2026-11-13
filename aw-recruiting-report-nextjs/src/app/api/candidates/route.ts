import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileAwDemandByDemId } from "@/lib/aw-demand-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id")?.trim();
    if (idParam) {
      const numId = parseInt(idParam, 10);
      if (isNaN(numId)) {
        return NextResponse.json({ success: false, error: "Invalid candidate ID" }, { status: 400 });
      }
      const candidate = await prisma.employeeInfo.findUnique({
        where: { id: numId },
      });
      return NextResponse.json({
        success: true,
        candidate,
        data: candidate ? [candidate] : [],
      });
    }

    const search = searchParams.get("search")?.trim() || "";
    const demandId = searchParams.get("demand_id")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "1";
    const fromDate = searchParams.get("fromDate")?.trim() || "";
    const toDate = searchParams.get("toDate")?.trim() || "";
    // Single factory mode: always 'aw'
    const loc = "aw";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const isAll = searchParams.get("limit") === "all";
    const limit = isAll ? undefined : Math.max(1, Math.min(1000, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = isAll ? undefined : (page - 1) * (limit || 50);

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
        page: isAll ? 1 : page,
        limit: isAll ? total : limit,
        totalPages: isAll ? 1 : Math.ceil(total / (limit || 50)),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

function mapCandidateBodyToPrisma(body: Record<string, any>) {
  const strOrNull = (val: unknown) => {
    if (val === undefined || val === null) return undefined;
    const s = String(val).trim();
    return s === "" ? null : s;
  };
  const dateOrNo = (val: unknown) => {
    if (val === undefined) return undefined;
    if (val === null) return "no";
    const s = String(val).trim();
    return s === "" ? "no" : s;
  };

  const data: Record<string, any> = {
    loc: "aw",
    status: body.status !== undefined && body.status !== null ? String(body.status) : "1",
  };

  const candidateName = strOrNull(body.candidateName ?? body.name);
  if (candidateName !== undefined) data.candidateName = candidateName ? candidateName.toUpperCase() : null;
  if (body.dateOfBirth !== undefined || body.dateBirth !== undefined) {
    data.dateOfBirth = strOrNull(body.dateOfBirth ?? body.dateBirth) ?? null;
  }
  if (body.gender !== undefined) {
    const g = String(body.gender).trim();
    data.gender = g === "Nữ" || g === "1" ? "1" : "0";
  }
  if (body.empId !== undefined || body.cccd !== undefined) {
    data.empId = strOrNull(body.empId ?? body.cccd) ?? null;
  }
  if (body.datecccd !== undefined || body.selectedDatecccd !== undefined) {
    data.datecccd = strOrNull(body.datecccd ?? body.selectedDatecccd) ?? null;
  }
  if (body.email !== undefined) data.email = strOrNull(body.email) ?? null;
  if (body.regTel !== undefined || body.tel !== undefined) data.regTel = strOrNull(body.regTel ?? body.tel) ?? null;
  if (body.commTel !== undefined || body.sub_tel !== undefined) data.commTel = strOrNull(body.commTel ?? body.sub_tel) ?? null;
  if (body.regAddress !== undefined || body.address !== undefined) data.regAddress = strOrNull(body.regAddress ?? body.address) ?? null;
  if (body.commAddress !== undefined || body.sub_address !== undefined) data.commAddress = strOrNull(body.commAddress ?? body.sub_address) ?? null;

  if (body.empDemandid !== undefined || body.dm_id !== undefined) data.empDemandid = strOrNull(body.empDemandid ?? body.dm_id) ?? null;
  if (body.subPosition !== undefined || body.dm_Subpos !== undefined) data.subPosition = strOrNull(body.subPosition ?? body.dm_Subpos) ?? null;
  if (body.position !== undefined || body.loc_apply !== undefined) {
    data.position = strOrNull(body.loc_apply ?? body.position) ?? null;
  }
  if (body.applyDp !== undefined || body.dept_apply !== undefined) data.applyDp = strOrNull(body.applyDp ?? body.dept_apply) ?? null;

  if (body.recruSource !== undefined || body.source_recruit !== undefined) {
    data.recruSource = strOrNull(body.recruSource ?? body.source_recruit) ?? "no";
  }
  if (body.cvReceivedAt !== undefined || body.date_cv !== undefined) data.cvReceivedAt = strOrNull(body.cvReceivedAt ?? body.date_cv) ?? null;
  if (body.salarySignedAt !== undefined || body.date_salary !== undefined) data.salarySignedAt = strOrNull(body.salarySignedAt ?? body.date_salary) ?? null;
  if (body.vgWorkTimes !== undefined || body.inVG !== undefined) data.vgWorkTimes = strOrNull(body.vgWorkTimes ?? body.inVG) ?? "0";
  if (body.oldEmpno !== undefined || body.empno_old !== undefined) data.oldEmpno = strOrNull(body.oldEmpno ?? body.empno_old) ?? null;
  if (body.reVgFrom !== undefined || body.comp_return !== undefined) data.reVgFrom = strOrNull(body.reVgFrom ?? body.comp_return) ?? null;
  if (body.note !== undefined || body.remark !== undefined) data.note = strOrNull(body.note ?? body.remark) ?? null;

  if (body.hrIvDate !== undefined || body.date_hr_inter !== undefined) data.hrIvDate = strOrNull(body.hrIvDate ?? body.date_hr_inter) ?? null;
  if (body.hrAcDate !== undefined || body.date_hr_review !== undefined) data.hrAcDate = strOrNull(body.hrAcDate ?? body.date_hr_review) ?? null;
  if (body.dpIvDate !== undefined || body.date_dept_inter !== undefined) data.dpIvDate = strOrNull(body.dpIvDate ?? body.date_dept_inter) ?? null;
  if (body.dpAcDate !== undefined || body.date_dept_review !== undefined) data.dpAcDate = strOrNull(body.dpAcDate ?? body.date_dept_review) ?? null;
  if (body.hrAcQu !== undefined || body.hrAcc !== undefined) data.hrAcQu = (body.hrAcQu ?? body.hrAcc) === "yes" ? "yes" : "no";
  if (body.dpAcQu !== undefined || body.deptACC !== undefined) data.dpAcQu = (body.dpAcQu ?? body.deptACC) === "yes" ? "yes" : "no";
  if (body.reg !== undefined || body.inWorker !== undefined) data.reg = (body.reg ?? body.inWorker) === "yes" ? "yes" : "no";
  if (body.exEnDate !== undefined || body.inDateWork !== undefined) data.exEnDate = dateOrNo(body.exEnDate ?? body.inDateWork);
  if (body.actEnDate !== undefined || body.inDateAccWork !== undefined) data.actEnDate = dateOrNo(body.actEnDate ?? body.inDateAccWork);
  if (body.changeEnDate !== undefined || body.change_date !== undefined) data.changeEnDate = strOrNull(body.changeEnDate ?? body.change_date) ?? null;

  if (body.national !== undefined || body.nation !== undefined) data.national = strOrNull(body.national ?? body.nation) ?? null;
  if (body.countryid !== undefined || body.nationality !== undefined) data.countryid = strOrNull(body.countryid ?? body.nationality) ?? null;
  if (body.newEmpno !== undefined || body.empno_hrm !== undefined) data.newEmpno = strOrNull(body.newEmpno ?? body.empno_hrm) ?? null;
  if (body.tmpDepartid !== undefined || body.newDept !== undefined) data.tmpDepartid = strOrNull(body.tmpDepartid ?? body.newDept) ?? null;
  if (body.tmpDutyid !== undefined || body.position_hrm !== undefined) {
    data.tmpDutyid = strOrNull(body.tmpDutyid ?? body.position_hrm) ?? null;
  }
  if (body.probation !== undefined || body.time_trial !== undefined) data.probation = strOrNull(body.probation ?? body.time_trial) ?? null;
  if (body.tmpIdyclass !== undefined || body.parameters !== undefined) data.tmpIdyclass = strOrNull(body.tmpIdyclass ?? body.parameters) ?? null;
  if (body.ethnic !== undefined || body.dantoc !== undefined) data.ethnic = strOrNull(body.ethnic ?? body.dantoc) ?? null;
  if (body.tmpRankid !== undefined || body.deputy !== undefined) data.tmpRankid = strOrNull(body.tmpRankid ?? body.deputy) ?? null;
  if (body.tmpLevelid !== undefined || body.level !== undefined) data.tmpLevelid = strOrNull(body.tmpLevelid ?? body.level) ?? null;
  if (body.tmpSiteid !== undefined || body.code_mc !== undefined) data.tmpSiteid = strOrNull(body.tmpSiteid ?? body.code_mc) ?? null;
  if (body.tmpWorkareaid !== undefined || body.loc_work !== undefined) data.tmpWorkareaid = strOrNull(body.tmpWorkareaid ?? body.loc_work) ?? null;
  if (body.isdirect !== undefined || body.direct !== undefined) data.isdirect = strOrNull(body.isdirect ?? body.direct) ?? null;
  if (body.marrage !== undefined || body.married !== undefined) data.marrage = strOrNull(body.marrage ?? body.married) ?? null;
  if (body.edu !== undefined) data.edu = strOrNull(body.edu) ?? null;
  if (body.birthProvince !== undefined || body.birth_province !== undefined) data.birthProvince = strOrNull(body.birthProvince ?? body.birth_province) ?? null;
  if (body.province !== undefined) data.province = strOrNull(body.province) ?? null;
  if (body.tmpCategoryid !== undefined || body.tmp_categoryid !== undefined) data.tmpCategoryid = strOrNull(body.tmpCategoryid ?? body.tmp_categoryid) ?? null;
  if (body.school !== undefined || body.school_gra !== undefined) data.school = strOrNull(body.school ?? body.school_gra) ?? null;

  if (body.userInput !== undefined) data.userInput = strOrNull(body.userInput) ?? null;
  if (body.userUpdate !== undefined) data.userUpdate = strOrNull(body.userUpdate) ?? null;
  if (body.keyInDate !== undefined) data.keyInDate = strOrNull(body.keyInDate) ?? null;

  return data;
}

async function saveCandidate(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const data = mapCandidateBodyToPrisma(body);

    let savedCandidate;

    if (id) {
      const numId = parseInt(String(id), 10);
      delete data.keyInDate;
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

export async function POST(request: NextRequest) {
  return saveCandidate(request);
}

export async function PUT(request: NextRequest) {
  return saveCandidate(request);
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
