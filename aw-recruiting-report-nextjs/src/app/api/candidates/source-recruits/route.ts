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
  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid or empty request body" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed JSON request body" },
      { status: 400 }
    );
  }

  try {
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
