import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCccd } from "@/lib/cccd-normalizer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cccd: string }> }
) {
  try {
    const { cccd } = await params;
    const cleanCccd = (cccd || "").trim();
    const normalized = normalizeCccd(cleanCccd);

    // Parity with legacy checkCccd: find first employee by empId/cccd
    const employee = await prisma.employeeInfo.findFirst({
      where: {
        OR: [
          { empId: cleanCccd },
          ...(normalized && normalized !== cleanCccd ? [{ empId: normalized }] : []),
        ],
      },
      orderBy: { id: "desc" },
    });

    if (employee) {
      const count = await prisma.employeeInfo.count({
        where: {
          OR: [
            { empId: cleanCccd },
            ...(normalized && normalized !== cleanCccd ? [{ empId: normalized }] : []),
          ],
        },
      });

      return NextResponse.json({
        EMPNO: employee.newEmpno || employee.oldEmpno || null,
        count,
      });
    }

    // Check resign_data
    const resign = await prisma.resignData.findFirst({
      where: {
        OR: [
          { erNumberid: cleanCccd },
          ...(normalized && normalized !== cleanCccd ? [{ erNumberid: normalized }] : []),
        ],
      },
      orderBy: { erResigndate: "desc" },
    });

    if (resign) {
      const count = await prisma.resignData.count({
        where: {
          OR: [
            { erNumberid: cleanCccd },
            ...(normalized && normalized !== cleanCccd ? [{ erNumberid: normalized }] : []),
          ],
        },
      });

      return NextResponse.json({
        EMPNO: resign.erEmpid || null,
        count,
      });
    }

    return NextResponse.json({
      EMPNO: null,
      count: 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { EMPNO: null, count: 0, error: error.message },
      { status: 500 }
    );
  }
}
