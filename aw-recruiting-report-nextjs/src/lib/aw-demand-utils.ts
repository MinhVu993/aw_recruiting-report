import { PrismaClient } from "@prisma/client";

export interface DemandCandidateItem {
  empno: string;
  date: string;
  name: string;
}

export function buildDemandSyncPayload(params: {
  demAmount: number;
  existingCandidates: DemandCandidateItem[];
  employees: { newEmpno: string | null; actEnDate: string | null; candidateName: string | null }[];
}) {
  const candidates: DemandCandidateItem[] = Array.isArray(params.existingCandidates)
    ? [...params.existingCandidates]
    : [];
  const existingSet = new Set(candidates.map((c) => c.empno));
  let latestActEnDate: string | null = null;

  for (const emp of params.employees) {
    if (!emp.newEmpno) continue;
    const actDate = emp.actEnDate && emp.actEnDate !== "no" ? emp.actEnDate : "";
    if (actDate && (!latestActEnDate || actDate > latestActEnDate)) {
      latestActEnDate = actDate;
    }
    if (!existingSet.has(emp.newEmpno)) {
      candidates.push({
        empno: emp.newEmpno,
        date: actDate,
        name: emp.candidateName || "",
      });
      existingSet.add(emp.newEmpno);
    }
  }

  const demRecruited = params.employees.length;
  const isFulfilled = demRecruited >= params.demAmount;

  return {
    demCandidates: candidates,
    demRecruited,
    demFulfilled: isFulfilled ? "yes" : "no",
    demFullfilldate: isFulfilled ? latestActEnDate : null,
  };
}

export async function reconcileAwDemandByDemId(demId: string, prisma: PrismaClient) {
  const cleanDemId = demId.trim();
  if (!cleanDemId) return null;

  const demand = await prisma.demandData.findFirst({ where: { demId: cleanDemId } });
  if (!demand) return null;

  const employees = await prisma.employeeInfo.findMany({
    where: {
      empDemandid: cleanDemId,
      reg: "yes",
      status: "1",
      NOT: [{ newEmpno: null }, { newEmpno: "" }, { newEmpno: "-" }],
    },
    select: { newEmpno: true, actEnDate: true, candidateName: true },
  });

  const existingCandidates = Array.isArray(demand.demCandidates)
    ? (demand.demCandidates as unknown as DemandCandidateItem[])
    : [];

  const payload = buildDemandSyncPayload({
    demAmount: demand.demAmount,
    existingCandidates,
    employees,
  });

  return prisma.demandData.update({
    where: { id: demand.id },
    data: {
      demCandidates: payload.demCandidates as any,
      demRecruited: payload.demRecruited,
      demFulfilled: payload.demFulfilled,
      demFullfilldate: payload.demFullfilldate,
    },
  });
}

export function getDemandLoc(): string {
  return "aw";
}
