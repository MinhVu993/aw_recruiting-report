import test from "node:test";
import assert from "node:assert/strict";
import { formatNextEmpno } from "../src/app/api/candidates/set-empno/empno-utils";

test("formatNextEmpno generates 6-digit zero-padded string starting with 0", () => {
  assert.equal(formatNextEmpno("014537"), "014538");
  assert.equal(formatNextEmpno("000009"), "000010");
  assert.equal(formatNextEmpno(""), "000001");
  assert.equal(formatNextEmpno(null), "000001");
  assert.equal(formatNextEmpno("invalid"), "000001");
});
