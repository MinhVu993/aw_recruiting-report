const test = require("node:test");
const assert = require("node:assert/strict");
const { parseInsertTuples, sanitizeDateVal, sanitizeJsonVal } = require("../scripts/sql-dump-parser");

test("sanitizeDateVal converts MariaDB zero dates and invalid flags to null", () => {
  assert.equal(sanitizeDateVal("0000-00-00 00:00:00"), null);
  assert.equal(sanitizeDateVal("0000-00-00"), null);
  assert.equal(sanitizeDateVal("no"), null);
  assert.equal(sanitizeDateVal(null), null);
  assert.equal(sanitizeDateVal("2026-03-11 13:47:05"), "2026-03-11 13:47:05");
  assert.equal(sanitizeDateVal("2025-01-02"), "2025-01-02");
});

test("sanitizeJsonVal parses escaped JSON strings into JS objects/arrays", () => {
  const raw = '{"vi":"PHÒNG Y TẾ","en":"Medical\'s Office","cn":"醫務課"}';
  const parsed = sanitizeJsonVal(raw, {});
  assert.deepEqual(parsed, {
    vi: "PHÒNG Y TẾ",
    en: "Medical's Office",
    cn: "醫務課",
  });
  assert.deepEqual(sanitizeJsonVal("invalid-json", []), []);
});

test("parseInsertTuples parses single and multi-line MariaDB INSERT values with commas and quotes", () => {
  const line =
    "INSERT INTO `aw_dept` VALUES\n(1,'TAC000AW',NULL,'TAC000AW','TAC000AW','{\"vi\":\"A, B\",\"en\":\"C\\'s\"}',NULL,NULL,'0000-00-00 00:00:00','2026-03-11 13:47:05'),\n(2,'VAW',NULL,'VAW','VAW01','{}',NULL,NULL,'2025-01-01 00:00:00',NULL);";
  const result = parseInsertTuples(line);
  assert.equal(result.table, "aw_dept");
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0][0], 1);
  assert.equal(result.rows[0][2], null);
  assert.equal(result.rows[0][5], '{"vi":"A, B","en":"C\'s"}');
  assert.equal(result.rows[1][0], 2);
});
