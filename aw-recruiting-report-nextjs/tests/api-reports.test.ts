import test from "node:test";
import assert from "node:assert/strict";
import { calculateAwRecruitReportRow, calculateAwResignReportRow } from "../src/lib/aw-report-calc";

test("report calculation helpers return valid structures expected by report endpoints", () => {
  const recruitRow = calculateAwRecruitReportRow({
    demId: "D001",
    demDept: "VAW",
    demSubDepartment: "VAW01",
    demUnit: "VAW0101",
    position: "Worker",
    demandAmount: 10,
    fromdate: "2026-01-01",
    todate: "2026-01-31",
    keyInDate: "2026-01-10",
    empnoInfos: [],
  });

  assert.equal(recruitRow.dem_id, "D001");
  assert.equal(recruitRow.demand, 10);
  assert.equal(recruitRow.stillInNeedUntilToday, 10);

  const resignRow = calculateAwResignReportRow("VAW01", []);
  assert.equal(resignRow.dept, "VAW01");
  assert.equal(resignRow.totalResign, 0);
  assert.equal(resignRow.tayNinh, 0);
});

test("calculateAwResignReportRow computes age, seniority, bus, gender and 13 reasons correctly", () => {
  const records = [
    {
      erAddress: "Thành phố Tây Ninh, Tỉnh Tây Ninh",
      erAge: 22,
      erSeniority: 0,
      erBus: "Xe đưa rước",
      erGender: "Nam",
      erReason: "1",
    },
    {
      erAddress: "TP Hồ Chí Minh",
      erAge: 35,
      erSeniority: 1,
      erBus: "Tự túc",
      erGender: "Nữ",
      erReason: "13",
    },
  ];

  const row = calculateAwResignReportRow("VAW02", records);
  assert.equal(row.totalResign, 2);
  assert.equal(row.tayNinh, 1);
  assert.equal(row.notTayNinh, 1);
  assert.equal(row.age18to30, 1);
  assert.equal(row.age31to45, 1);
  assert.equal(row.seniorityLessThan1, 1);
  assert.equal(row.seniority1, 1);
  assert.equal(row.bus, 1);
  assert.equal(row.genderMale, 1);
  assert.equal(row.genderFemale, 1);
  assert.equal(row.reasonHometown, 1);
  assert.equal(row.reasonFailedProbationPeriod, 1);
  assert.equal(row.reasonOther, 0);
});
