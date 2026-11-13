import test from "node:test";
import assert from "node:assert/strict";
import { mapAwDeptRecord } from "../src/app/api/depts/dept-mapper";

test("mapAwDeptRecord extracts multilingual name and active state from aw_dept", () => {
  const mapped = mapAwDeptRecord(
    {
      id: 10,
      department: "VAW1QC",
      mainGroup: null,
      subDepartment: "VAW1QCQC",
      subDivision: "VAW1QCQC06",
      name: { vi: "QC Đế", en: "QC Sole", cn: "鞋底品管" },
      startDate: new Date("2025-01-01"),
      endDate: null,
    },
    "2026-11-13"
  );

  assert.equal(mapped.div, "VAW1QC");
  assert.equal(mapped.dept, "VAW1QCQC");
  assert.equal(mapped.unit, "VAW1QCQC06");
  assert.equal(mapped.deptCode, "VAW1QCQC06");
  assert.equal(mapped.deptName, "QC Đế");
  assert.equal(mapped.loc, "AW");
  assert.equal(mapped.active, true);
});
