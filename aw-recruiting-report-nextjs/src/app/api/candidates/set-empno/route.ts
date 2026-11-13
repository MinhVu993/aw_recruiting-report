import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileAwDemandByDemId } from "@/lib/aw-demand-utils";
import { formatNextEmpno } from "./empno-utils";

export async function GET() {
  try {
    // 1. Find max newEmpno matching 6 digits ^0[0-9]{5}$ using raw SQL regex query
    const result = await prisma.$queryRaw<[{ max_empno: string | null }]>`
      SELECT MAX("newEmpno") as max_empno
      FROM employee_info
      WHERE "newEmpno" ~ '^0[0-9]{5}$'
    `;
    const maxEmpnoStr = result[0]?.max_empno || null;
    const nextEmpno = formatNextEmpno(maxEmpnoStr);

    // 2. Find eligible candidates: status = '1', reg = 'yes', actEnDate != null && actEnDate != 'no', newEmpno == null || newEmpno == ''
    const candidates = await prisma.employeeInfo.findMany({
      where: {
        loc: "aw",
        status: "1",
        reg: "yes",
        AND: [
          { actEnDate: { not: null } },
          { actEnDate: { not: "no" } },
          { actEnDate: { not: "" } },
        ],
        OR: [
          { newEmpno: null },
          { newEmpno: "" },
          { newEmpno: "-" },
        ],
      },
      orderBy: [{ actEnDate: "asc" }, { tmpDepartid: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({
      success: true,
      nextEmpno,
      eligibleCount: candidates.length,
      candidates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get empno state" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateIds, newEmpno: startEmpnoInput, act_en_date, actEnDate, tmp_departid, tmpDepartid } = body;

    let targetCandidates: { id: number; empDemandid: string | null }[] = [];

    const effectiveActDate = act_en_date || actEnDate;
    const effectiveDeptId = tmp_departid || tmpDepartid;

    if (Array.isArray(candidateIds) && candidateIds.length > 0) {
      const ids = candidateIds.map((id: any) => parseInt(String(id), 10)).filter((id: number) => !isNaN(id));
      targetCandidates = await prisma.employeeInfo.findMany({
        where: { id: { in: ids } },
        select: { id: true, empDemandid: true },
        orderBy: [{ actEnDate: "asc" }, { tmpDepartid: "asc" }, { id: "asc" }],
      });
    } else if (effectiveActDate) {
      const where: any = {
        loc: "aw",
        status: "1",
        reg: "yes",
        actEnDate: effectiveActDate,
      };
      if (effectiveDeptId) {
        where.tmpDepartid = effectiveDeptId;
      }
      targetCandidates = await prisma.employeeInfo.findMany({
        where,
        select: { id: true, empDemandid: true },
        orderBy: [{ tmpDepartid: "asc" }, { id: "asc" }],
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Either candidateIds or act_en_date is required" },
        { status: 400 }
      );
    }

    if (targetCandidates.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        assigned: [],
        message: "No candidates found to update",
      });
    }

    // Determine starting empno
    let currentNumber: number;
    if (startEmpnoInput !== undefined && startEmpnoInput !== null && String(startEmpnoInput).trim() !== "") {
      const parsed = parseInt(String(startEmpnoInput).trim(), 10);
      currentNumber = isNaN(parsed) ? 1 : parsed + 1;
    } else {
      // Find highest existing in database
      const result = await prisma.$queryRaw<[{ max_empno: string | null }]>`
        SELECT MAX("newEmpno") as max_empno
        FROM employee_info
        WHERE "newEmpno" ~ '^0[0-9]{5}$'
      `;
      const maxEmpnoStr = result[0]?.max_empno || null;
      if (maxEmpnoStr && /^\d+$/.test(maxEmpnoStr.trim())) {
        currentNumber = parseInt(maxEmpnoStr.trim(), 10) + 1;
      } else {
        currentNumber = 1;
      }
    }

    const assigned: { id: number; newEmpno: string }[] = [];
    const affectedDemandIds = new Set<string>();

    for (const cand of targetCandidates) {
      const formatted = String(currentNumber).padStart(6, "0");
      currentNumber++;
      assigned.push({ id: cand.id, newEmpno: formatted });
      if (cand.empDemandid) {
        affectedDemandIds.add(cand.empDemandid);
      }
    }

    // Wrap candidate updates in a transaction to prevent race conditions and ensure atomicity
    await prisma.$transaction(
      assigned.map((item) =>
        prisma.employeeInfo.update({
          where: { id: item.id },
          data: {
            newEmpno: item.newEmpno,
            reg: "yes",
          },
        })
      )
    );

    // Reconcile affected demands
    for (const demId of affectedDemandIds) {
      try {
        await reconcileAwDemandByDemId(demId, prisma);
      } catch (e) {
        console.error(`Reconcile error for demand ${demId}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "EMPNO has been updated successfully.",
      count: assigned.length,
      assigned,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to set empno" },
      { status: 500 }
    );
  }
}
