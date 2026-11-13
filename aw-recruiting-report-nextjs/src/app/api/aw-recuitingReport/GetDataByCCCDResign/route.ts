import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCccd } from "@/lib/cccd-normalizer";

async function queryResignHistory(empIdRaw: string) {
  const cleanId = (empIdRaw || "").trim();
  const normalized = normalizeCccd(cleanId);

  return prisma.resignData.findMany({
    where: {
      OR: [
        { erNumberid: cleanId },
        ...(normalized && normalized !== cleanId ? [{ erNumberid: normalized }] : []),
      ],
    },
    orderBy: { id: "desc" },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get("emp_id") || searchParams.get("empId") || searchParams.get("cccd") || "";
    if (!empId) {
      return NextResponse.json([]);
    }
    const data = await queryResignHistory(empId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch resign history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const empId = body.emp_id || body.empId || body.cccd || "";
    if (!empId) {
      return NextResponse.json([]);
    }
    const data = await queryResignHistory(empId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch resign history" },
      { status: 500 }
    );
  }
}
