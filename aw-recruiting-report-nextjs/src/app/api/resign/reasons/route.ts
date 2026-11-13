import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reasons = await prisma.reasonResign.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: reasons,
    });
  } catch (error: any) {
    console.error("Error fetching resignation reasons:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch resignation reasons" },
      { status: 500 }
    );
  }
}
