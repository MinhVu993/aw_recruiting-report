import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return NextResponse.json(
        { success: false, error: "Invalid candidate ID" },
        { status: 400 }
      );
    }

    const candidate = await prisma.employeeInfo.findUnique({
      where: { id: numId },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get candidate by ID" },
      { status: 500 }
    );
  }
}
