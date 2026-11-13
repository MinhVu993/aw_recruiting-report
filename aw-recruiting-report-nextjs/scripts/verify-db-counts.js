const path = require("path");
const { Client } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function checkCounts() {
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not set. Please configure .env or pass DATABASE_URL before running verify-db-counts.js.");
    process.exit(1);
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const tables = [
      "aw_dept",
      "aw_dept_code",
      "demand_data",
      "employee_info",
      "intern_data",
      "resign_data",
      "job_level_tbl",
      "birth_province",
      "duty_hrm",
      "edu_hrm",
      "nation_hrm",
      "reason_resign",
      "source_recruit",
    ];
    console.log("=== TABLE COUNTS (10.1.16.89:5432/aw_recruiting_report) ===");
    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) AS cnt FROM "${t}"`);
      console.log(`${t.padEnd(16)} : ${res.rows[0].cnt}`);
    }
  } finally {
    await client.end().catch(() => {});
  }
}

checkCounts().catch(console.error);
