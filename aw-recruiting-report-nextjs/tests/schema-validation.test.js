const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");

test("prisma schema adheres to postgresql-table-design rules for AW", () => {
  assert.ok(fs.existsSync(schemaPath), "prisma/schema.prisma must exist");
  const content = fs.readFileSync(schemaPath, "utf8");

  assert.match(content, /provider\s*=\s*"postgresql"/);
  assert.match(content, /model\s+AwDept\s+\{[\s\S]*@@map\("aw_dept"\)/);
  assert.match(content, /model\s+AwDeptCode\s+\{[\s\S]*@@map\("aw_dept_code"\)/);
  assert.match(content, /model\s+DemandData\s+\{[\s\S]*demId[\s\S]*@map\("dem_id"\)/);
  assert.match(content, /model\s+EmployeeInfo\s+\{[\s\S]*@default\("aw"\)/);

  // Rules: no @db.Timestamp (without tz), no @db.VarChar, use @db.Timestamptz and @db.Text / Json
  assert.doesNotMatch(content, /@db\.Timestamp\b/);
  assert.doesNotMatch(content, /@db\.VarChar\(/);
  assert.match(content, /@db\.Timestamptz/);
  assert.match(content, /@db\.Text/);
});
