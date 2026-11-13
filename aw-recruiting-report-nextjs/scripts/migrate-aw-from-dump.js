const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");
const { Client } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { parseInsertTuples, sanitizeDateVal, sanitizeJsonVal } = require("./sql-dump-parser");

const DUMP_PATH = path.resolve(__dirname, "../../12h20m01s_aw-recruiting-report.sql");

const TABLE_SCHEMAS = {
  aw_dept: {
    cols: ["id", "department", "main_group", "sub_department", "sub_division", "name", "start_date", "end_date", "created_at", "updated_at"],
    transform: (r) => [r[0], r[1], r[2], r[3], r[4], JSON.stringify(sanitizeJsonVal(r[5], {})), sanitizeDateVal(r[6]), sanitizeDateVal(r[7]), sanitizeDateVal(r[8]) || new Date().toISOString(), sanitizeDateVal(r[9])],
  },
  aw_dept_code: {
    cols: ["id", "dept_code", "name", "created_at", "updated_at"],
    transform: (r) => [r[0], r[1] || "", JSON.stringify(sanitizeJsonVal(r[2], {})), sanitizeDateVal(r[3]) || new Date().toISOString(), sanitizeDateVal(r[4])],
  },
  birth_province: {
    cols: ["id", "province_no", "province_name"],
    transform: (r) => [r[0], r[1], r[2]],
  },
  duty_hrm: {
    cols: ["id", "duty_no", "duty_name"],
    transform: (r) => [r[0], r[1], JSON.stringify(sanitizeJsonVal(r[2], {}))],
  },
  edu_hrm: {
    cols: ["id", "edu_no", "edu_name"],
    transform: (r) => [r[0], r[1], r[2]],
  },
  nation_hrm: {
    cols: ["id", "nation_code", "nation_name"],
    transform: (r) => [r[0], r[1], r[2]],
  },
  reason_resign: {
    cols: ["id", "reason"],
    transform: (r) => [r[0], JSON.stringify(sanitizeJsonVal(r[1], {}))],
  },
  source_recruit: {
    cols: ["id", "source", "created_at", "updated_at"],
    transform: (r) => [r[0], JSON.stringify(sanitizeJsonVal(r[1], {})), sanitizeDateVal(r[2]) || new Date().toISOString(), sanitizeDateVal(r[3])],
  },
  job_level_tbl: {
    cols: ["id", "job_code"],
    transform: (r) => [r[0], r[1]],
  },
  demand_data: {
    cols: ["id", "dem_id", "dem_dept", "dem_sub_department", "dem_unit", "dem_position", "dem_sub_position", "dem_amount", "dem_inputdate", "dem_recruited", "dem_fulfilled", "dem_fullfilldate", "stocknumber", "dem_note", "dem_candidates", "dem_pause_start_at", "dem_pause_end_at", "user_input", "user_update", "created_at", "updated_at", "dem_cancel_date"],
    transform: (r) => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7] ?? 0, r[8] || "", r[9] ?? 0, r[10] || "no", r[11], r[12] ?? 0, r[13], JSON.stringify(sanitizeJsonVal(r[14], [])), r[15], r[16], r[17], r[18], sanitizeDateVal(r[19]) || new Date().toISOString(), sanitizeDateVal(r[20]), r[21]],
  },
  employee_info: {
    cols: ["id", "key_in_date", "candidate_name", "dateofbirth", "gender", "emp_id", "email", "position", "sub_position", "apply_dp", "hr_iv_date", "hr_ac_date", "dp_iv_date", "dp_ac_date", "hr_ac_qu", "dp_ac_qu", "reg", "ex_en_date", "act_en_date", "recru_source", "job_content", "brou_com_bus", "regedForBus", "vg_work_times", "old_empno", "re_vg_from", "cv_received_at", "salary_signed_at", "note", "school", "emp_demandid", "user_input", "user_update", "regTel", "regAddress", "commTel", "commAddress", "national", "newEmpno", "tmp_idyclass", "tmp_departid", "tmp_dutyid", "ethnic", "tmp_categoryid", "tmp_levelid", "tmp_rankid", "tmp_siteid", "tmp_workareaid", "isdirect", "countryid", "marrage", "birth_province", "province", "edu", "probation", "bus_info", "datecccd", "reason", "change_en_date", "created_at", "updated_at", "status", "loc"],
    transform: (r) => {
      const out = r.slice(0, 63);
      out[59] = sanitizeDateVal(r[59]) || new Date().toISOString();
      out[60] = sanitizeDateVal(r[60]);
      out[61] = r[61] ?? "1";
      out[62] = r[62] || "aw";
      return out;
    },
  },
  intern_data: {
    cols: ["id", "in_empid", "in_name", "in_deptcode", "in_school", "in_edulv", "in_major", "in_startdate", "in_enddate", "in_allowance", "in_bus", "in_rectype", "in_workingtime", "in_note", "in_photo", "created_at", "updated_at"],
    transform: (r) => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], sanitizeDateVal(r[7]), sanitizeDateVal(r[8]), r[9], r[10], r[11], r[12], r[13], r[14], sanitizeDateVal(r[15]) || new Date().toISOString(), sanitizeDateVal(r[16])],
  },
  resign_data: {
    cols: ["id", "er_empid", "er_indate", "er_numberid", "er_name", "er_deptid", "er_deptname", "er_joblevel", "er_age", "er_seniority", "er_bus", "er_gender", "er_hometown", "er_address", "er_reason", "er_note", "er_keyindate", "er_resigndate", "created_at", "updated_at"],
    transform: (r) => [r[0], r[1], sanitizeDateVal(r[2]), r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14], r[15], sanitizeDateVal(r[16]), sanitizeDateVal(r[17]), sanitizeDateVal(r[18]) || new Date().toISOString(), sanitizeDateVal(r[19])],
  },
};

async function ensureDatabaseExists(dbUrl) {
  const parsed = new URL(dbUrl);
  const dbName = parsed.pathname.replace(/^\//, "");
  parsed.pathname = "/postgres";
  const adminClient = new Client({ connectionString: parsed.toString() });
  await adminClient.connect();
  const res = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (res.rowCount === 0) {
    console.log(`Creating database "${dbName}"...`);
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
  }
  await adminClient.end();
}

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not configured in .env");
  if (!fs.existsSync(DUMP_PATH)) throw new Error(`Dump file not found: ${DUMP_PATH}`);

  await ensureDatabaseExists(dbUrl);
  console.log("Pushing Prisma schema to PostgreSQL...");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit", cwd: path.resolve(__dirname, "..") });

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const tables = Object.keys(TABLE_SCHEMAS);
  await client.query(`TRUNCATE TABLE ${tables.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`);

  const counts = {};
  const rl = readline.createInterface({ input: fs.createReadStream(DUMP_PATH, "utf8"), crlfDelay: Infinity });
  let buffer = "";

  for await (const line of rl) {
    if (!buffer && !line.startsWith("INSERT INTO `")) continue;
    buffer += (buffer ? "\n" : "") + line;
    if (!line.trimEnd().endsWith(";")) continue;

    const parsed = parseInsertTuples(buffer);
    buffer = "";
    if (!parsed || !TABLE_SCHEMAS[parsed.table]) continue;

    const spec = TABLE_SCHEMAS[parsed.table];
    const colSql = spec.cols.map((c) => `"${c}"`).join(", ");
    const placeholders = spec.cols.map((_, idx) => `$${idx + 1}`).join(", ");
    const sql = `INSERT INTO "${parsed.table}" (${colSql}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;

    for (const rawRow of parsed.rows) {
      await client.query(sql, spec.transform(rawRow));
    }
    counts[parsed.table] = (counts[parsed.table] || 0) + parsed.rows.length;
  }

  for (const t of tables) {
    await client.query(`SELECT setval(pg_get_serial_sequence('"${t}"', 'id'), COALESCE((SELECT MAX(id) FROM "${t}"), 1));`);
  }

  console.log("Migration Summary:", counts);
  await client.end();
}

if (require.main === module) {
  run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}

module.exports = { run, ensureDatabaseExists, TABLE_SCHEMAS };
