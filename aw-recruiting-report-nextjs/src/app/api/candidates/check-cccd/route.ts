import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCccd } from "@/lib/cccd-normalizer";

async function handleCheckCccd(cccdRaw: string) {
  const cleanCccd = cccdRaw.trim();
  const normalized = normalizeCccd(cleanCccd);

  // Check in employee_info
  const currentEmployees = await prisma.employeeInfo.findMany({
    where: {
      OR: [
        { empId: cleanCccd },
        ...(normalized && normalized !== cleanCccd ? [{ empId: normalized }] : []),
      ],
    },
    orderBy: { id: "desc" },
  });

  // Check in resign_data
  const resignHistory = await prisma.resignData.findMany({
    where: {
      OR: [
        { erNumberid: cleanCccd },
        ...(normalized && normalized !== cleanCccd ? [{ erNumberid: normalized }] : []),
      ],
    },
    orderBy: { erResigndate: "desc" },
  });

  const totalCount = currentEmployees.length + resignHistory.length;
  const currentEmployee = currentEmployees[0] || null;
  const exists = totalCount > 0;

  return {
    exists,
    workTimes: totalCount,
    count: totalCount,
    currentEmployee,
    currentEmployees,
    resignHistory,
    empno: currentEmployee?.newEmpno || currentEmployee?.oldEmpno || resignHistory[0]?.erEmpid || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cccd = searchParams.get("cccd") || searchParams.get("empId") || searchParams.get("emp_id") || "";
    if (!cccd) {
      return NextResponse.json({ exists: false, workTimes: 0, count: 0, currentEmployee: null, resignHistory: [] });
    }
    const result = await handleCheckCccd(cccd);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check CCCD" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cccd = body.cccd || body.empId || body.emp_id || "";
    if (!cccd) {
      return NextResponse.json({ exists: false, workTimes: 0, count: 0, currentEmployee: null, resignHistory: [] });
    }
    const result = await handleCheckCccd(cccd);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check CCCD" },
      { status: 500 }
    );
  }
}
