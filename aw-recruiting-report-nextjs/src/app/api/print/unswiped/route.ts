import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim() || searchParams.get("act_en_date")?.trim() || "";

    if (!date) {
      return NextResponse.json(
        { success: false, message: "Missing date parameter" },
        { status: 400 }
      );
    }

    const employees = await prisma.employeeInfo.findMany({
      where: {
        actEnDate: date,
        reg: "yes",
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
      newEmpno: item.newEmpno,
      candidate_name: item.candidateName,
      tmp_departid: item.tmpDepartid,
      tmp_dutyid: item.tmpDutyid,
      name: item.tmpDepartid ? deptMap.get(item.tmpDepartid) || null : null,
      duty_name: item.tmpDutyid ? dutyMap.get(item.tmpDutyid) || null : null,
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error in printUnswiped:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch unswiped print data" },
      { status: 500 }
    );
  }
}
