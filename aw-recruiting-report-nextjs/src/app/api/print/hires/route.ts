import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim() || searchParams.get("ex_en_date")?.trim() || "";

    if (!date) {
      return NextResponse.json(
        { success: false, message: "Missing date parameter" },
        { status: 400 }
      );
    }

    const employees = await prisma.employeeInfo.findMany({
      where: {
        exEnDate: date,
        status: "1",
      },
      orderBy: {
        tmpDepartid: "asc",
      },
    });

    const deptCodes = Array.from(
      new Set(
        employees
          .map((e) => e.tmpDepartid)
          .filter((id): id is string => Boolean(id && id.trim()))
      )
    );

    const dutyCodes = Array.from(
      new Set(
        employees
          .map((e) => e.tmpDutyid)
          .filter((id): id is string => Boolean(id && id.trim()))
      )
    );

    const [depts, duties] = await Promise.all([
      deptCodes.length > 0
        ? prisma.awDept.findMany({
            where: { subDivision: { in: deptCodes } },
            select: { subDivision: true, name: true },
          })
        : Promise.resolve([]),
      dutyCodes.length > 0
        ? prisma.dutyHrm.findMany({
            where: { dutyNo: { in: dutyCodes } },
            select: { dutyNo: true, dutyName: true },
          })
        : Promise.resolve([]),
    ]);

    const deptMap = new Map<string, any>();
    for (const d of depts) {
      deptMap.set(d.subDivision, d.name);
    }

    const dutyMap = new Map<string, any>();
    for (const d of duties) {
      dutyMap.set(d.dutyNo, d.dutyName);
    }

    const results = employees.map((item) => ({
      ex_en_date: item.exEnDate,
      candidate_name: item.candidateName,
      tmp_departid: item.tmpDepartid,
      tmp_dutyid: item.tmpDutyid,
      name: item.tmpDepartid ? deptMap.get(item.tmpDepartid) || null : null,
      duty_name: item.tmpDutyid ? dutyMap.get(item.tmpDutyid) || null : null,
      reg: item.reg,
      reason: item.reason,
      change_en_date: item.changeEnDate,
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error in printHires:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch hires print data" },
      { status: 500 }
    );
  }
}
