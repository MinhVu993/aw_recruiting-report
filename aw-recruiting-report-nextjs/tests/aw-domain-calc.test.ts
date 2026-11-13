import test from "node:test";
import assert from "node:assert/strict";
import { calculateAwRecruitReportRow, calculateAwResignReportRow } from "../src/lib/aw-report-calc";
import { buildDemandSyncPayload } from "../src/lib/aw-demand-utils";
import { normalizeCccd, isValidCccd } from "../src/lib/cccd-normalizer";
import { parseSeniorityYears, matchesSeniorityRange } from "../src/lib/seniority-utils";
import { formatExcelDate } from "../src/lib/excel-export";
import { buildDrillThroughTarget } from "../src/lib/drillthrough";

test("calculateAwRecruitReportRow matches legacy api.php::recruitReport formulas", () => {
  const result = calculateAwRecruitReportRow({
    demId: "540",
    demNote: "Test note",
    demDept: "VAW1QC",
    demSubDepartment: "VAW1QCQC",
    demUnit: "VAW1QCQC06",
    position: "Worker",
    demandAmount: 5,
    fromdate: "2025-01-01",
    todate: "2025-01-31",
    keyInDate: "2025-01-15",
    empnoInfos: [
      {
        empDemandid: "540",
        actEnDate: "2025-01-10",
        exEnDate: "2025-01-09",
        hrIvDate: "2025-01-05",
        hrAcDate: "2025-01-05",
        dpAcDate: "2025-01-06",
        hrAcQu: "yes",
        dpAcQu: "yes",
        reg: "yes",
        brouComBus: "yes",
        regedForBus: "yes",
      },
      {
        empDemandid: "540",
        actEnDate: "no",
        exEnDate: "2025-01-20",
        hrIvDate: "2025-01-12",
        hrAcDate: "2025-01-12",
        dpAcDate: "no",
        hrAcQu: "yes",
        dpAcQu: "no",
        reg: "no",
        brouComBus: "no",
        regedForBus: "no",
      },
    ],
  });

  assert.equal(result.dem_id, "540");
  assert.equal(result.demand, 5);
  assert.equal(result.totalRecruitedUntilToday, 1);
  assert.equal(result.stillInNeedUntilToday, 4);
  assert.equal(result.comeToInterview, 2);
  assert.equal(result.comeByBus, 1);
  assert.equal(result.accByHR, 2);
  assert.equal(result.accByDept, 1);
  assert.equal(result.expectedEnrollDate, 1);
  assert.equal(result.actualEnrollDate, 1);
  assert.equal(result.totalRecruitedByBusToday, 1);
  assert.equal(result.totalRegForBusToday, 1);
});

test("calculateAwResignReportRow matches legacy api.php::resignReport including Tay Ninh & 13 reasons", () => {
  const row = calculateAwResignReportRow("VAW1QC", [
    {
      erAddress: "Huyện Trảng Bàng, Tây Ninh",
      erAge: 25,
      erSeniority: 0,
      erBus: "Xe đưa rước số 1",
      erGender: "Nam",
      erReason: "1",
    },
    {
      erAddress: "Củ Chi, TP.HCM",
      erAge: 35,
      erSeniority: 2,
      erBus: "Tự túc",
      erGender: "Nữ",
      erReason: "5",
    },
  ]);

  assert.equal(row.dept, "VAW1QC");
  assert.equal(row.totalResign, 2);
  assert.equal(row.tayNinh, 1);
  assert.equal(row.notTayNinh, 1);
  assert.equal(row.age18to30, 1);
  assert.equal(row.age31to45, 1);
  assert.equal(row.seniorityLessThan1, 1);
  assert.equal(row.seniority2, 1);
  assert.equal(row.bus, 1);
  assert.equal(row.genderMale, 1);
  assert.equal(row.genderFemale, 1);
  assert.equal(row.reasonHometown, 1);
  assert.equal(row.reasonAbsenteeismForFiveDays, 1);
});

test("buildDemandSyncPayload merges valid employees into dem_candidates and marks fulfilled", () => {
  const sync = buildDemandSyncPayload({
    demAmount: 2,
    existingCandidates: [{ empno: "014537", date: "2025-01-03", name: "NGUYỄN A" }],
    employees: [
      { newEmpno: "014537", actEnDate: "2025-01-03", candidateName: "NGUYỄN A" },
      { newEmpno: "014538", actEnDate: "2025-01-09", candidateName: "TRẦN B" },
    ],
  });

  assert.equal(sync.demRecruited, 2);
  assert.equal(sync.stocknumber, 0);
  assert.equal(sync.demFulfilled, "yes");
  assert.equal(sync.demFullfilldate, "2025-01-09");
  assert.equal(sync.demCandidates.length, 2);

  // Test case where existingCandidates already has entries not present in current employees
  const syncWithPreexisting = buildDemandSyncPayload({
    demAmount: 5,
    existingCandidates: [{ empno: "000001", date: "2024-12-01", name: "CŨ" }],
    employees: [
      { newEmpno: "014537", actEnDate: "2025-01-03", candidateName: "NGUYỄN A" },
    ],
  });

  assert.equal(syncWithPreexisting.demCandidates.length, 2);
  assert.equal(syncWithPreexisting.demRecruited, 2);
  assert.equal(syncWithPreexisting.stocknumber, 3);
  assert.equal(syncWithPreexisting.demFulfilled, "no");
});

test("normalizeCccd, seniority-utils, formatExcelDate, and drillthrough functions behave correctly", () => {
  assert.equal(normalizeCccd("079201004523"), "79201004523");
  assert.equal(isValidCccd("079201004523"), true);
  assert.equal(isValidCccd("123"), false);

  assert.equal(parseSeniorityYears("2 năm"), 2);
  assert.equal(matchesSeniorityRange(0.5, "< 1 năm"), true);
  assert.equal(matchesSeniorityRange(2, "1 - 3 năm"), true);

  assert.equal(formatExcelDate("2025-01-15"), new Date("2025-01-15").toLocaleDateString("vi-VN"));

  const drillResign = buildDrillThroughTarget({
    perspective: "turnover",
    filters: { resignReason: "1", div: "VAW1QC" },
    globalSlicers: { loc: "aw" },
  });
  assert.equal(drillResign?.pageName, "resign");
  assert.equal(drillResign?.url.includes("reason=1"), true);
});
