export interface AwCandidateCalcInput {
  empDemandid?: string | null;
  actEnDate?: string | null;
  exEnDate?: string | null;
  hrIvDate?: string | null;
  hrAcDate?: string | null;
  dpAcDate?: string | null;
  hrAcQu?: string | null;
  dpAcQu?: string | null;
  reg?: string | null;
  brouComBus?: string | null;
  regedForBus?: string | null;
}

export interface AwRecruitReportInput {
  demId: string;
  demNote?: string | null;
  demDept: string;
  demSubDepartment?: string | null;
  demUnit?: string | null;
  position: string;
  demandAmount: number;
  fromdate: string;
  todate: string;
  keyInDate: string;
  empnoInfos: AwCandidateCalcInput[];
}

function isValidDateInRange(val: string | null | undefined, from: string, to: string): boolean {
  if (!val || val === "no" || val === "null") return false;
  const clean = val.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return false;
  const cleanFrom = from ? from.trim().slice(0, 10) : "";
  const cleanTo = to ? to.trim().slice(0, 10) : "";
  if (cleanFrom && clean < cleanFrom) return false;
  if (cleanTo && clean > cleanTo) return false;
  return true;
}

export function calculateAwRecruitReportRow(input: AwRecruitReportInput) {
  const { empnoInfos, fromdate, todate, keyInDate, demandAmount } = input;

  const actualInRange = empnoInfos.filter((item) =>
    isValidDateInRange(item.actEnDate, fromdate, todate)
  ).length;

  const totalRecruitedUntilToday = empnoInfos.filter(
    (item) => isValidDateInRange(item.actEnDate, fromdate, todate) && item.reg === "yes"
  ).length;

  return {
    dem_id: input.demId,
    dem_note: input.demNote || "",
    dem_dept: input.demDept,
    dem_sub_department: input.demSubDepartment || "",
    dem_unit: input.demUnit || "",
    position: input.position,
    demand: demandAmount,
    totalRecruitedUntilToday,
    stillInNeedUntilToday: Math.max(0, demandAmount - actualInRange),
    actualVacancies: Math.max(0, demandAmount - actualInRange),
    comeToInterview: empnoInfos.filter((info) => isValidDateInRange(info.hrIvDate, fromdate, todate)).length,
    comeByBus: empnoInfos.filter(
      (info) => info.brouComBus === "yes" && isValidDateInRange(info.hrIvDate, fromdate, todate)
    ).length,
    accByHR: empnoInfos.filter(
      (info) => info.hrAcQu === "yes" && isValidDateInRange(info.hrAcDate, fromdate, todate)
    ).length,
    accByDept: empnoInfos.filter(
      (info) => info.dpAcQu === "yes" && isValidDateInRange(info.dpAcDate, fromdate, todate)
    ).length,
    expectedEnrollDate: empnoInfos.filter(
      (info) =>
        isValidDateInRange(info.exEnDate, fromdate, todate) &&
        info.hrAcQu === "yes" &&
        info.dpAcQu === "yes"
    ).length,
    actualEnrollDate: actualInRange,
    totalRecruitedByBusToday: empnoInfos.filter(
      (info) =>
        info.brouComBus === "yes" &&
        info.actEnDate &&
        info.actEnDate !== "no" &&
        (!keyInDate || info.actEnDate.slice(0, 10) <= keyInDate.slice(0, 10))
    ).length,
    totalRegForBusToday: empnoInfos.filter((info) => info.regedForBus === "yes").length,
  };
}

export interface AwResignCalcInput {
  erAddress: string;
  erAge: number;
  erSeniority: number;
  erBus: string;
  erGender: string;
  erReason: string;
}

export function calculateAwResignReportRow(deptId: string, records: AwResignCalcInput[]) {
  const countReason = (code: string) => records.filter((r) => String(r.erReason).trim() === code).length;

  return {
    dept: deptId,
    totalResign: records.length,
    tayNinh: records.filter((r) => (r.erAddress || "").includes("Tây Ninh")).length,
    notTayNinh: records.filter((r) => !(r.erAddress || "").includes("Tây Ninh")).length,
    age18to30: records.filter((r) => r.erAge >= 18 && r.erAge <= 30).length,
    age31to45: records.filter((r) => r.erAge >= 31 && r.erAge <= 45).length,
    age46up: records.filter((r) => r.erAge > 45).length,
    seniorityLessThan1: records.filter((r) => r.erSeniority < 1).length,
    seniority1: records.filter((r) => r.erSeniority === 1).length,
    seniority2: records.filter((r) => r.erSeniority === 2).length,
    seniority3up: records.filter((r) => r.erSeniority > 2).length,
    bus: records.filter((r) => (r.erBus || "").includes("Xe đưa rước")).length,
    genderMale: records.filter((r) => r.erGender === "Nam").length,
    genderFemale: records.filter((r) => r.erGender === "Nữ").length,
    reasonHometown: countReason("1"),
    reasonStudy: countReason("2"),
    reasonWorkIsUnsuitable: countReason("3"),
    reasonOther: countReason("4"),
    reasonAbsenteeismForFiveDays: countReason("5"),
    reasonReturnHomeToTakeCareOfChildren: countReason("6"),
    reasonPersonalReasons: countReason("7"),
    reasonHealthIsNotSufficientToContinueWorking: countReason("8"),
    reasonFamilyMatters: countReason("9"),
    reasonMisconductDismissedByTheCompany: countReason("10"),
    reasonContractExpired: countReason("11"),
    reasonFoundANewJob: countReason("12"),
    reasonFailedProbationPeriod: countReason("13"),
  };
}
