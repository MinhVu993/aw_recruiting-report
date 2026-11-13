import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sources = await prisma.sourceRecruit.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(sources);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch source recruits",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, source } = body;

    let parsedSource = source;
    if (typeof source === "string") {
      try {
        parsedSource = JSON.parse(source);
      } catch {
        parsedSource = { vi: source, en: source, cn: source };
      }
    }

    let result;
    if (id) {
      result = await prisma.sourceRecruit.upsert({
        where: { id: Number(id) },
        update: {
          source: parsedSource || {},
        },
        create: {
          id: Number(id),
          source: parsedSource || {},
        },
      });
    } else {
      result = await prisma.sourceRecruit.create({
        data: {
          source: parsedSource || {},
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Source recruit saved successfully",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save source recruit",
      },
      { status: 500 }
    );
  }
}
