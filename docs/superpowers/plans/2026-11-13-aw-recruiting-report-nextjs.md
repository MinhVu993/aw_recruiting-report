# AW Recruiting Report (Next.js 15 + PostgreSQL) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng `aw-recruiting-report-nextjs` tại `d:\source\aw-recruiting-report\aw-recruiting-report-nextjs` sử dụng Next.js 15 + PostgreSQL (tại `10.1.16.89:5432`), giữ nguyên 100% giao diện hiện đại của `D:\source\recruiting-report_ori_new\recruiting-report-nextjs` đồng thời bảo toàn 100% nghiệp vụ gốc của AW (`api.php` và các trang Vue cũ), hỗ trợ chạy Docker trên cổng `7307`.

**Architecture:** Ứng dụng sử dụng Next.js 15 App Router (TypeScript, React 19, Tailwind CSS, Framer Motion) làm frontend và API routes (`/src/app/api/*`) làm backend giao tiếp qua Prisma ORM 5.22 với cơ sở dữ liệu PostgreSQL 16 (`aw_recruiting_report` tại `10.1.16.89`). Toàn bộ dữ liệu lịch sử được chuyển đổi tự động từ file dump MariaDB `12h20m01s_aw-recruiting-report.sql` thông qua script Node.js có cơ chế làm sạch ngày tháng (`0000-00-00` -> `NULL`), chuyển đổi JSON đa ngôn ngữ sang `JSONB` và đồng bộ sequence. Triển khai production qua Docker Compose + Nginx SSL proxy cổng `7307`.

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Client & Proxy Layer"
        Browser["Client Browser (Desktop / Mobile / WebSerial Scanner)"]
        Nginx["Nginx SSL Proxy (Port 7307 -> 3002)"]
        Browser -->|HTTPS :7307 / Dev Dynamic Port| Nginx
    end

    subgraph "Next.js 15 App (aw-recruiting-report-nextjs)"
        Nginx --> AppRouter["App Router Pages (/, /candidates, /demand, /deptcontrol, /recruiting-report, /resign, /intern, /print)"]
        AppRouter --> API["REST API Routes (/api/*)"]
        API --> DomainCalc["AW Domain Logic (aw-report-calc, aw-demand-utils, cccd-normalizer)"]
        DomainCalc --> Prisma["Prisma Client ORM"]
    end

    subgraph "PostgreSQL 16 (10.1.16.89:5432)"
        Prisma --> DB[("aw_recruiting_report\naw_dept, aw_dept_code, demand_data,\nemployee_info, resign_data, intern_data,\nmaster tables")]
        Migration["scripts/migrate-aw-from-dump.js"] -->|Parse, Sanitize & Batch Insert| DB
        Dump[("12h20m01s_aw-recruiting-report.sql")] --> Migration
    end
```

**Tech Stack:** Next.js 15.0.3, React 19, TypeScript 5.6, Tailwind CSS 3.4, Framer Motion 11, Lucide React, Prisma 5.22, PostgreSQL 16, `pg`, `xlsx`, `jspdf`, `html2canvas`, Docker & Nginx.

## Global Constraints

- Thư mục gốc dự án mới: `d:\source\aw-recruiting-report\aw-recruiting-report-nextjs` (tuyệt đối không sửa đè code Nuxt cũ ở thư mục cha).
- PostgreSQL target: `postgresql://postgres:postgres@10.1.16.89:5432/aw_recruiting_report?schema=public`.
- Tuân thủ `/postgresql-table-design`: sử dụng `TIMESTAMPTZ` cho `created_at`/`updated_at`, `TEXT` thay vì `VARCHAR(n)` tùy tiện, `JSONB` cho trường JSON (`name`, `dem_candidates`, `duty_name`, `reason`, `source`), khóa chính tự tăng (`IDENTITY`), đánh index đầy đủ cho các cột khóa liên kết và cột lọc thường xuyên.
- Môi trường Dev cục bộ chạy cổng ngẫu nhiên/linh hoạt (`npm run dev`); Docker Compose mở cổng `7307`.
- Bảo toàn 100% logic AW từ `api.php`: `aw_dept` (`department`, `sub_department`, `sub_division`, `start_date`, `end_date`), `dem_id` trong `demand_data`, `loc = 'aw'` trong `employee_info`, `newEmpno` dạng 6 chữ số đệm `0` (`0xxxxx`), công thức `recruitReport`, `resignReport` (Tây Ninh & 13 lý do), `printUnswiped`, `printHires`, `syncAllDemandData`.
- Giao diện UI giống `D:\source\recruiting-report_ori_new\recruiting-report-nextjs`, đổi nhận diện SSO app key sang `"aw-recruiting-report"` và nhãn hiển thị AW.

---

### Task 1: Project Scaffold, Config & Docker Infrastructure

**Files:**
- Create: `aw-recruiting-report-nextjs/package.json`
- Create: `aw-recruiting-report-nextjs/tsconfig.json`
- Create: `aw-recruiting-report-nextjs/next.config.mjs`
- Create: `aw-recruiting-report-nextjs/tailwind.config.ts`
- Create: `aw-recruiting-report-nextjs/postcss.config.mjs`
- Create: `aw-recruiting-report-nextjs/.env.example`
- Create: `aw-recruiting-report-nextjs/.env`
- Create: `aw-recruiting-report-nextjs/.gitignore`
- Create: `aw-recruiting-report-nextjs/.npmrc`
- Create: `aw-recruiting-report-nextjs/Dockerfile`
- Create: `aw-recruiting-report-nextjs/docker-compose.yml`
- Create: `aw-recruiting-report-nextjs/nginx.conf`
- Create: `aw-recruiting-report-nextjs/generate-ssl.bat`
- Create: `aw-recruiting-report-nextjs/generate-ssl.sh`
- Create: `aw-recruiting-report-nextjs/src/app/globals.css`
- Create: `aw-recruiting-report-nextjs/public/logo.png` (copy từ reference)

**Interfaces:**
- Consumes: Không có.
- Produces: Môi trường Next.js 15 + TypeScript + Tailwind CSS + Docker Compose cổng `7307` + biến môi trường `DATABASE_URL` trỏ `10.1.16.89`.

- [ ] **Step 1: Khởi tạo `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.npmrc`, `.gitignore`**

Tạo `aw-recruiting-report-nextjs/package.json`:
```json
{
  "name": "aw-recruiting-report-nextjs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node scripts/dev-random-port.js",
    "dev:fixed": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "tsx --test tests/*.test.js tests/*.test.ts",
    "migrate:dump": "node scripts/migrate-aw-from-dump.js",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:seed": "node prisma/seed.js"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "clsx": "^2.1.1",
    "dotenv": "^16.4.5",
    "framer-motion": "^11.11.17",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.2.1",
    "lucide-react": "^0.460.0",
    "motion": "^14.9.0",
    "next": "15.0.3",
    "nextstepjs": "^2.3.0",
    "pg": "^8.13.1",
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106",
    "tailwind-merge": "^2.5.4",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "@types/pg": "^8.11.10",
    "@types/react": "npm:types-react@19.0.0-rc.1",
    "@types/react-dom": "npm:types-react-dom@19.0.0-rc.1",
    "postcss": "^8.4.49",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.15",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3"
  }
}
```

Tạo `aw-recruiting-report-nextjs/scripts/dev-random-port.js` để `npm run dev` luôn chọn một cổng ngẫu nhiên chưa bị chiếm dụng (từ 3100-3999) hoặc nhận tham số `-- -p <port>`:
```javascript
const net = require("net");
const { spawn } = require("child_process");

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(findAvailablePort(startPort + 1)));
    server.listen(startPort, "0.0.0.0", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const hasPortArg = args.includes("-p") || args.includes("--port");
  let spawnArgs = ["next", "dev", ...args];

  if (!hasPortArg) {
    const randomBase = 3100 + Math.floor(Math.random() * 800);
    const port = await findAvailablePort(randomBase);
    console.log(`[AW Recruiting] Starting Next.js dev server on dynamic port ${port}`);
    spawnArgs = ["next", "dev", "-p", String(port), ...args];
  }

  const child = spawn("npx", spawnArgs, {
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Tạo `aw-recruiting-report-nextjs/next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
```

Tạo `aw-recruiting-report-nextjs/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "prisma", "tests", "**/*.test.ts", "src/**/__tests__/*"]
}
```

Tạo `aw-recruiting-report-nextjs/postcss.config.mjs`:
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
```

Tạo `aw-recruiting-report-nextjs/.npmrc`:
```text
legacy-peer-deps=true
```

Tạo `aw-recruiting-report-nextjs/.gitignore`:
```text
node_modules/
.next/
out/
dist/
.env
.env.local
*.log
ssl/*.crt
ssl/*.key
```

- [ ] **Step 2: Tạo `.env.example`, `.env`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`, và SSL script**

Tạo `aw-recruiting-report-nextjs/.env.example` và `aw-recruiting-report-nextjs/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@10.1.16.89:5432/aw_recruiting_report?schema=public"
APP_PORT=7307
NEXT_PUBLIC_APP_SITE="aw"
NEXT_PUBLIC_APP_TITLE="AW Recruiting Command Center"
```

Tạo `aw-recruiting-report-nextjs/docker-compose.yml`:
```yaml
services:
  aw-recruiting-app:
    container_name: aw-recruiting-report-app
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    expose:
      - "3002"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=3002
      - HOSTNAME=0.0.0.0
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./output:/app/output
    networks:
      - aw-recruiting-network

  aw-nginx-proxy:
    image: nginx:alpine
    container_name: aw-recruiting-report-nginx
    ports:
      - "${APP_PORT:-7307}:7307"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - aw-recruiting-app
    restart: unless-stopped
    networks:
      - aw-recruiting-network

networks:
  aw-recruiting-network:
    driver: bridge
```

Tạo `aw-recruiting-report-nextjs/nginx.conf`:
```nginx
server {
    listen 7307 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    client_max_body_size 50M;

    error_page 497 =307 https://$host:$server_port$request_uri;

    location /_next/static/ {
        proxy_pass http://aw-recruiting-app:3002/_next/static/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        expires 365d;
        access_log off;
    }

    location / {
        proxy_pass http://aw-recruiting-app:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Tạo `aw-recruiting-report-nextjs/Dockerfile` và sao chép `tailwind.config.ts`, `src/app/globals.css`, `public/logo.png`, `ssl/*`, `generate-ssl.*` từ `D:\source\recruiting-report_ori_new\recruiting-report-nextjs`, đảm bảo thư mục `output/` tồn tại (`output/.gitkeep`).

- [ ] **Step 3: Cài đặt dependencies và kiểm tra**

Run:
```powershell
cd d:\source\aw-recruiting-report\aw-recruiting-report-nextjs
npm install --legacy-peer-deps
docker compose config -q
```
Expected: `npm install` hoàn tất không lỗi, `docker compose config -q` trả về exit code 0.

- [ ] **Step 4: Commit scaffold**

```bash
git add aw-recruiting-report-nextjs/
git commit -m "chore: scaffold aw-recruiting-report-nextjs with Docker port 7307"
```

---

### Task 2: PostgreSQL Prisma Schema & Client Singleton (`/postgresql-table-design`)

**Files:**
- Create: `aw-recruiting-report-nextjs/prisma/schema.prisma`
- Create: `aw-recruiting-report-nextjs/prisma/seed.js`
- Create: `aw-recruiting-report-nextjs/src/lib/prisma.ts`
- Test: `aw-recruiting-report-nextjs/tests/schema-validation.test.js`

**Interfaces:**
- Consumes: `package.json`, `.env`.
- Produces: `@prisma/client` types (`EmployeeInfo`, `DemandData`, `AwDept`, `AwDeptCode`, `ResignData`, `InternData`, `BirthProvince`, `DutyHrm`, `EduHrm`, `NationHrm`, `ReasonResign`, `SourceRecruit`, `JobLevelTbl`) và `prisma` singleton tại `src/lib/prisma.ts`.

- [ ] **Step 1: Viết failing test kiểm tra cấu trúc Schema Prisma chuẩn `/postgresql-table-design`**

Tạo `aw-recruiting-report-nextjs/tests/schema-validation.test.js`:
```javascript
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
```

- [ ] **Step 2: Chạy test để xác nhận FAIL trước khi tạo schema**

Run: `node --test tests/schema-validation.test.js` (trong `aw-recruiting-report-nextjs`)
Expected: FAIL với `prisma/schema.prisma must exist`.

- [ ] **Step 3: Viết `prisma/schema.prisma`, `prisma/seed.js` và `src/lib/prisma.ts`**

Tạo `aw-recruiting-report-nextjs/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model EmployeeInfo {
  id              Int       @id @default(autoincrement())
  keyInDate       String?   @map("key_in_date") @db.Text
  candidateName   String?   @map("candidate_name") @db.Text
  dateOfBirth     String?   @map("dateofbirth") @db.Text
  gender          String?   @db.Text
  empId           String?   @map("emp_id") @db.Text
  email           String?   @db.Text
  position        String?   @db.Text
  subPosition     String?   @map("sub_position") @db.Text
  applyDp         String?   @map("apply_dp") @db.Text
  hrIvDate        String?   @map("hr_iv_date") @db.Text
  hrAcDate        String?   @map("hr_ac_date") @db.Text
  dpIvDate        String?   @map("dp_iv_date") @db.Text
  dpAcDate        String?   @map("dp_ac_date") @db.Text
  hrAcQu          String?   @default("no") @map("hr_ac_qu") @db.Text
  dpAcQu          String?   @default("no") @map("dp_ac_qu") @db.Text
  reg             String?   @default("no") @db.Text
  exEnDate        String?   @default("no") @map("ex_en_date") @db.Text
  actEnDate       String?   @default("no") @map("act_en_date") @db.Text
  recruSource     String?   @default("no") @map("recru_source") @db.Text
  jobContent      String?   @default("no") @map("job_content") @db.Text
  brouComBus      String?   @default("no") @map("brou_com_bus") @db.Text
  regedForBus     String?   @default("no") @map("regedForBus") @db.Text
  vgWorkTimes     String?   @default("0") @map("vg_work_times") @db.Text
  oldEmpno        String?   @map("old_empno") @db.Text
  reVgFrom        String?   @map("re_vg_from") @db.Text
  cvReceivedAt    String?   @map("cv_received_at") @db.Text
  salarySignedAt  String?   @map("salary_signed_at") @db.Text
  note            String?   @db.Text
  school          String?   @db.Text
  empDemandid     String?   @map("emp_demandid") @db.Text
  userInput       String?   @map("user_input") @db.Text
  userUpdate      String?   @map("user_update") @db.Text
  regTel          String?   @map("regTel") @db.Text
  regAddress      String?   @map("regAddress") @db.Text
  commTel         String?   @map("commTel") @db.Text
  commAddress     String?   @map("commAddress") @db.Text
  national        String?   @db.Text
  newEmpno        String?   @map("newEmpno") @db.Text
  tmpIdyclass     String?   @map("tmp_idyclass") @db.Text
  tmpDepartid     String?   @map("tmp_departid") @db.Text
  tmpDutyid       String?   @map("tmp_dutyid") @db.Text
  ethnic          String?   @db.Text
  tmpCategoryid   String?   @map("tmp_categoryid") @db.Text
  tmpLevelid      String?   @map("tmp_levelid") @db.Text
  tmpRankid       String?   @map("tmp_rankid") @db.Text
  tmpSiteid       String?   @map("tmp_siteid") @db.Text
  tmpWorkareaid   String?   @map("tmp_workareaid") @db.Text
  isdirect        String?   @db.Text
  countryid       String?   @db.Text
  marrage         String?   @db.Text
  birthProvince   String?   @map("birth_province") @db.Text
  province        String?   @db.Text
  edu             String?   @db.Text
  probation       String?   @db.Text
  busInfo         String?   @map("bus_info") @db.Text
  datecccd        String?   @db.Text
  reason          String?   @db.Text
  changeEnDate    String?   @map("change_en_date") @db.Text
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime? @updatedAt @map("updated_at") @db.Timestamptz
  status          String    @default("1") @db.Text
  loc             String    @default("aw") @db.Text

  @@index([empId], name: "idx_employee_info_emp_id")
  @@index([newEmpno], name: "idx_employee_info_new_empno")
  @@index([empDemandid, reg], name: "idx_employee_info_demand_reg")
  @@index([tmpDepartid], name: "idx_employee_info_tmp_departid")
  @@index([loc, status, createdAt], name: "idx_employee_info_loc_status_created")
  @@map("employee_info")
}

model DemandData {
  id               Int       @id @default(autoincrement())
  demId            String?   @unique @map("dem_id") @db.Text
  demDept          String    @map("dem_dept") @db.Text
  demSubDepartment String?   @map("dem_sub_department") @db.Text
  demUnit          String?   @map("dem_unit") @db.Text
  demPosition      String    @map("dem_position") @db.Text
  demSubPosition   String?   @map("dem_sub_position") @db.Text
  demAmount        Int       @default(0) @map("dem_amount")
  demInputdate     String    @map("dem_inputdate") @db.Text
  demRecruited     Int?      @default(0) @map("dem_recruited")
  demFulfilled     String    @default("no") @map("dem_fulfilled") @db.Text
  demFullfilldate  String?   @map("dem_fullfilldate") @db.Text
  stocknumber      Int?      @default(0)
  demNote          String?   @map("dem_note") @db.Text
  demCandidates    Json?     @default("[]") @map("dem_candidates")
  demPauseStartAt  String?   @map("dem_pause_start_at") @db.Text
  demPauseEndAt    String?   @map("dem_pause_end_at") @db.Text
  demCancelDate    String?   @map("dem_cancel_date") @db.Text
  userInput        String?   @map("user_input") @db.Text
  userUpdate       String?   @map("user_update") @db.Text
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime? @updatedAt @map("updated_at") @db.Timestamptz

  @@index([demId], name: "idx_demand_dem_id")
  @@index([demDept], name: "idx_demand_dept")
  @@index([demUnit], name: "idx_demand_unit")
  @@index([demPosition], name: "idx_demand_position")
  @@map("demand_data")
}

model AwDept {
  id            Int       @id @default(autoincrement())
  department    String    @db.Text
  mainGroup     String?   @map("main_group") @db.Text
  subDepartment String    @map("sub_department") @db.Text
  subDivision   String    @map("sub_division") @db.Text
  name          Json      @default("{}")
  startDate     DateTime? @map("start_date") @db.Date
  endDate       DateTime? @map("end_date") @db.Date
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime? @updatedAt @map("updated_at") @db.Timestamptz

  @@index([subDivision], name: "idx_aw_dept_sub_division")
  @@index([department], name: "idx_aw_dept_department")
  @@map("aw_dept")
}

model AwDeptCode {
  id        Int       @id @default(autoincrement())
  deptCode  String    @map("dept_code") @db.Text
  name      Json      @default("{}")
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime? @updatedAt @map("updated_at") @db.Timestamptz

  @@index([deptCode], name: "idx_aw_dept_code_dept_code")
  @@map("aw_dept_code")
}

model ResignData {
  id            Int       @id @default(autoincrement())
  erEmpid       String    @map("er_empid") @db.Text
  erIndate      DateTime  @map("er_indate") @db.Date
  erNumberid    String    @map("er_numberid") @db.Text
  erName        String    @map("er_name") @db.Text
  erDeptid      String    @map("er_deptid") @db.Text
  erDeptname    String    @map("er_deptname") @db.Text
  erJoblevel    String    @map("er_joblevel") @db.Text
  erAge         Int       @map("er_age")
  erSeniority   Int       @map("er_seniority")
  erBus         String    @map("er_bus") @db.Text
  erGender      String    @map("er_gender") @db.Text
  erHometown    String    @map("er_hometown") @db.Text
  erAddress     String    @map("er_address") @db.Text
  erReason      String    @map("er_reason") @db.Text
  erNote        String?   @map("er_note") @db.Text
  erKeyindate   DateTime  @map("er_keyindate") @db.Date
  erResigndate  DateTime  @map("er_resigndate") @db.Date
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime? @updatedAt @map("updated_at") @db.Timestamptz

  @@index([erResigndate], name: "idx_resign_resigndate")
  @@index([erDeptid], name: "idx_resign_deptid")
  @@index([erNumberid], name: "idx_resign_numberid")
  @@map("resign_data")
}

model InternData {
  id             Int       @id @default(autoincrement())
  inEmpid        String    @map("in_empid") @db.Text
  inName         String    @map("in_name") @db.Text
  inDeptcode     Int       @map("in_deptcode")
  inSchool       String    @map("in_school") @db.Text
  inEdulv        String    @map("in_edulv") @db.Text
  inMajor        String    @map("in_major") @db.Text
  inStartdate    DateTime? @map("in_startdate") @db.Date
  inEnddate      DateTime? @map("in_enddate") @db.Date
  inAllowance    String    @map("in_allowance") @db.Text
  inBus          String    @map("in_bus") @db.Text
  inRectype      String    @map("in_rectype") @db.Text
  inWorkingtime  String    @map("in_workingtime") @db.Text
  inNote         String?   @map("in_note") @db.Text
  inPhoto        String?   @map("in_photo") @db.Text
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime? @updatedAt @map("updated_at") @db.Timestamptz

  @@map("intern_data")
}

model BirthProvince {
  id           Int    @id @default(autoincrement())
  provinceNo   String @map("province_no") @db.Text
  provinceName String @map("province_name") @db.Text

  @@map("birth_province")
}

model DutyHrm {
  id       Int    @id @default(autoincrement())
  dutyNo   String @map("duty_no") @db.Text
  dutyName Json?  @map("duty_name")

  @@map("duty_hrm")
}

model EduHrm {
  id      Int    @id @default(autoincrement())
  eduNo   String @map("edu_no") @db.Text
  eduName String @map("edu_name") @db.Text

  @@map("edu_hrm")
}

model NationHrm {
  id         Int     @id @default(autoincrement())
  nationCode String  @map("nation_code") @db.Text
  nationName String? @map("nation_name") @db.Text

  @@map("nation_hrm")
}

model ReasonResign {
  id     Int  @id @default(autoincrement())
  reason Json

  @@map("reason_resign")
}

model SourceRecruit {
  id        Int       @id @default(autoincrement())
  source    Json
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime? @updatedAt @map("updated_at") @db.Timestamptz

  @@map("source_recruit")
}

model JobLevelTbl {
  id      Int    @id @default(autoincrement())
  jobCode String @map("job_code") @db.Text

  @@map("job_level_tbl")
}
```

Tạo `aw-recruiting-report-nextjs/src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Tạo `aw-recruiting-report-nextjs/prisma/seed.js`:
```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seed ready. Use `npm run migrate:dump` to import 12h20m01s_aw-recruiting-report.sql.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 4: Chạy test, validate và generate Prisma Client**

Run:
```powershell
cd d:\source\aw-recruiting-report\aw-recruiting-report-nextjs
node --test tests/schema-validation.test.js
npx prisma validate
npx prisma generate
```
Expected: Test PASS, `prisma validate` thành công, `prisma generate` tạo client thành công.

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/prisma.ts tests/schema-validation.test.js
git commit -m "feat(db): add PostgreSQL Prisma schema following postgresql-table-design"
```

---

### Task 3: MySQL Dump to PostgreSQL Migration Script

**Files:**
- Create: `aw-recruiting-report-nextjs/scripts/sql-dump-parser.js`
- Create: `aw-recruiting-report-nextjs/scripts/migrate-aw-from-dump.js`
- Test: `aw-recruiting-report-nextjs/tests/sql-dump-parser.test.js`

**Interfaces:**
- Consumes: `../12h20m01s_aw-recruiting-report.sql`, `DATABASE_URL`.
- Produces: Hàm `parseInsertLine(line)`, `sanitizeValue(val, colType)` và lệnh CLI `npm run migrate:dump` nạp dữ liệu vào PostgreSQL `10.1.16.89:5432/aw_recruiting_report`.

- [ ] **Step 1: Viết failing unit test cho bộ phân tích câu lệnh INSERT của MariaDB**

Tạo `aw-recruiting-report-nextjs/tests/sql-dump-parser.test.js`:
```javascript
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
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `node --test tests/sql-dump-parser.test.js`
Expected: FAIL với `Cannot find module '../scripts/sql-dump-parser'`.

- [ ] **Step 3: Triển khai `scripts/sql-dump-parser.js` và `scripts/migrate-aw-from-dump.js`**

Tạo `aw-recruiting-report-nextjs/scripts/sql-dump-parser.js`:
```javascript
function sanitizeDateVal(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s || s === "0000-00-00" || s.startsWith("0000-00-00") || s.toLowerCase() === "no" || s.toLowerCase() === "null") {
    return null;
  }
  return s;
}

function sanitizeJsonVal(val, fallback = {}) {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(String(val));
  } catch {
    return fallback;
  }
}

function unescapeMysqlString(raw) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "\\" && i + 1 < raw.length) {
      const next = raw[i + 1];
      if (next === "n") out += "\n";
      else if (next === "r") out += "\r";
      else if (next === "t") out += "\t";
      else if (next === "0") out += "\0";
      else out += next;
      i++;
    } else {
      out += raw[i];
    }
  }
  return out;
}

function parseInsertTuples(line) {
  const match = line.match(/^INSERT INTO `([^`]+)` VALUES\s*(.+);$/s);
  if (!match) return null;
  const table = match[1];
  const valuesPart = match[2];

  const rows = [];
  let i = 0;
  const len = valuesPart.length;

  while (i < len) {
    while (i < len && valuesPart[i] !== "(") i++;
    if (i >= len) break;
    i++; // skip '('

    const row = [];
    while (i < len) {
      while (i < len && (valuesPart[i] === " " || valuesPart[i] === "\t")) i++;
      if (valuesPart[i] === ")") {
        i++;
        break;
      }

      if (valuesPart[i] === "'") {
        i++;
        let str = "";
        while (i < len) {
          if (valuesPart[i] === "\\" && i + 1 < len) {
            str += valuesPart[i] + valuesPart[i + 1];
            i += 2;
          } else if (valuesPart[i] === "'" && valuesPart[i + 1] === "'") {
            str += "''";
            i += 2;
          } else if (valuesPart[i] === "'") {
            i++;
            break;
          } else {
            str += valuesPart[i];
            i++;
          }
        }
        row.push(unescapeMysqlString(str).replace(/''/g, "'"));
      } else {
        let token = "";
        while (i < len && valuesPart[i] !== "," && valuesPart[i] !== ")") {
          token += valuesPart[i];
          i++;
        }
        const trimmed = token.trim();
        if (trimmed.toUpperCase() === "NULL") {
          row.push(null);
        } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          row.push(Number(trimmed));
        } else {
          row.push(trimmed);
        }
      }

      while (i < len && (valuesPart[i] === " " || valuesPart[i] === "\t")) i++;
      if (valuesPart[i] === ",") i++;
    }
    rows.push(row);
  }

  return { table, rows };
}

module.exports = {
  parseInsertTuples,
  sanitizeDateVal,
  sanitizeJsonVal,
};
```

Tạo `aw-recruiting-report-nextjs/scripts/migrate-aw-from-dump.js`:
```javascript
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

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

- [ ] **Step 4: Chạy unit test để xác nhận PASS**

Run: `node --test tests/sql-dump-parser.test.js`
Expected: PASS 3/3 tests.

- [ ] **Step 5: Commit migration parser & script**

```bash
git add scripts/sql-dump-parser.js scripts/migrate-aw-from-dump.js tests/sql-dump-parser.test.js
git commit -m "feat(migration): add MariaDB dump parser and PostgreSQL migration script"
```

---

### Task 4: AW Domain Calculation & Sync Utilities

**Files:**
- Create: `aw-recruiting-report-nextjs/src/lib/cccd-normalizer.ts`
- Create: `aw-recruiting-report-nextjs/src/lib/aw-report-calc.ts`
- Create: `aw-recruiting-report-nextjs/src/lib/aw-demand-utils.ts`
- Create: `aw-recruiting-report-nextjs/src/lib/seniority-utils.ts`
- Create: `aw-recruiting-report-nextjs/src/lib/excel-export.ts`
- Create: `aw-recruiting-report-nextjs/src/lib/drillthrough.ts`
- Test: `aw-recruiting-report-nextjs/tests/aw-domain-calc.test.ts`

**Interfaces:**
- Consumes: `src/lib/prisma.ts`.
- Produces:
  - `calculateAwRecruitReportRow(params)` (khớp 100% logic `api.php::recruitReport`).
  - `calculateAwResignReportRow(deptId, records)` (khớp 100% logic `api.php::resignReport`: Tây Ninh, tuổi, thâm niên, xe, giới tính, 13 lý do).
  - `reconcileAwDemandByDemId(demId, prismaClient)` (khớp 100% logic `api.php::syncAllDemandData`).
  - `normalizeCccd(raw)`, `formatExcelDate`, `parseSeniorityYears`.

- [ ] **Step 1: Viết failing tests cho các hàm tính toán nghiệp vụ AW**

Tạo `aw-recruiting-report-nextjs/tests/aw-domain-calc.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { calculateAwRecruitReportRow, calculateAwResignReportRow } from "../src/lib/aw-report-calc";
import { buildDemandSyncPayload } from "../src/lib/aw-demand-utils";

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
  assert.equal(sync.demFulfilled, "yes");
  assert.equal(sync.demFullfilldate, "2025-01-09");
  assert.equal(sync.demCandidates.length, 2);
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx tsx --test tests/aw-domain-calc.test.ts`
Expected: FAIL với lỗi không tìm thấy module `../src/lib/aw-report-calc`.

- [ ] **Step 3: Viết `src/lib/aw-report-calc.ts`, `src/lib/aw-demand-utils.ts` và copy/chỉnh các helper còn lại**

Tạo `aw-recruiting-report-nextjs/src/lib/aw-report-calc.ts`:
```typescript
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
  if (from && clean < from) return false;
  if (to && clean > to) return false;
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
```

Tạo `aw-recruiting-report-nextjs/src/lib/aw-demand-utils.ts`:
```typescript
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
```

Sao chép và điều chỉnh `cccd-normalizer.ts`, `seniority-utils.ts`, `excel-export.ts`, `drillthrough.ts` từ `D:\source\recruiting-report_ori_new\recruiting-report-nextjs\src\lib\`.

- [ ] **Step 4: Chạy test kiểm chứng**

Run: `npx tsx --test tests/aw-domain-calc.test.ts`
Expected: PASS 3/3 tests.

- [ ] **Step 5: Commit domain logic**

```bash
git add src/lib/ tests/aw-domain-calc.test.ts
git commit -m "feat(domain): add AW recruit/resign calculation & demand reconciliation utils"
```

---

### Task 5: Master Data, Dept Control & Health APIs

**Files:**
- Create: `aw-recruiting-report-nextjs/src/app/api/health/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/db-status/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/depts/dept-mapper.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/depts/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/deptcontrol/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/candidates/hrm-options/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/candidates/source-recruits/route.ts`
- Test: `aw-recruiting-report-nextjs/tests/api-depts.test.ts`

**Interfaces:**
- Consumes: `prisma` (`AwDept`, `AwDeptCode`, `BirthProvince`, `DutyHrm`, `EduHrm`, `NationHrm`, `JobLevelTbl`, `SourceRecruit`).
- Produces: JSON responses tương thích UI `recruiting-report-nextjs` và CRUD cho `aw_dept` khớp 100% `api.php::saveDeptCode`.

- [ ] **Step 1: Viết test kiểm tra logic ánh xạ phòng ban `aw_dept`**

Tạo `aw-recruiting-report-nextjs/tests/api-depts.test.ts`:
```typescript
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
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx tsx --test tests/api-depts.test.ts`
Expected: FAIL với module not found.

- [ ] **Step 3: Implement `dept-mapper.ts` và tất cả API routes của Task 5**

Tạo `aw-recruiting-report-nextjs/src/app/api/depts/dept-mapper.ts`:
```typescript
export interface AwDeptRowInput {
  id: number;
  department: string;
  mainGroup?: string | null;
  subDepartment: string;
  subDivision: string;
  name: unknown;
  startDate?: Date | null;
  endDate?: Date | null;
}

export function parseMultilangName(raw: unknown, fallbackCode: string) {
  let obj: Record<string, string> = {};
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw) || {};
    } catch {
      return { vi: raw || fallbackCode, en: raw || fallbackCode, cn: raw || fallbackCode };
    }
  } else if (raw && typeof raw === "object") {
    obj = raw as Record<string, string>;
  }
  const vi = (obj.vi || obj.en || obj.cn || fallbackCode).trim();
  const en = (obj.en || obj.vi || obj.cn || vi).trim();
  const cn = (obj.cn || obj.vi || obj.en || vi).trim();
  return { vi, en, cn };
}

export function mapAwDeptRecord(d: AwDeptRowInput, todayStr = new Date().toISOString().slice(0, 10)) {
  const unit = (d.subDivision || d.subDepartment || d.department || "").trim();
  const nameObj = parseMultilangName(d.name, unit);
  const startDate = d.startDate ? d.startDate.toISOString().slice(0, 10) : "";
  const endDate = d.endDate ? d.endDate.toISOString().slice(0, 10) : "";
  const active = !endDate || endDate >= todayStr;

  return {
    id: d.id,
    div: (d.department || "").trim(),
    dept: (d.subDepartment || "").trim(),
    unit,
    deptCode: unit,
    deptName: nameObj.vi,
    name: nameObj.vi,
    nameObj,
    startDate,
    endDate,
    loc: "AW",
    active,
  };
}
```

- `src/app/api/depts/route.ts`: hỗ trợ `?type=divs`, `?search=...`, `?div=...`, trả về danh sách phòng ban từ `aw_dept` qua `mapAwDeptRecord` + fallback tên từ `aw_dept_code`.
- `src/app/api/deptcontrol/route.ts`:
  - `GET`: lấy toàn bộ `aw_dept` theo `id desc` (khớp `getDataDeptCode`).
  - `POST`: `upsert` bản ghi `aw_dept` với `department`, `sub_department`, `sub_division`, `name` (`JSONB`), `start_date`, `end_date` (khớp `saveDeptCode` trong `api.php`).
- `src/app/api/candidates/hrm-options/route.ts`: trả về `birthProvinces`, `dutyHrms`, `eduHrms`, `nationHrms`, `jobLevels`, `departments` (từ `aw_dept`), `sourceRecruits`.
- `src/app/api/candidates/source-recruits/route.ts`: GET & POST `source_recruit`.
- `src/app/api/health/route.ts` & `src/app/api/db-status/route.ts`: kiểm tra `SELECT 1` và số lượng bản ghi các bảng trên `10.1.16.89`.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx tsx --test tests/api-depts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/health src/app/api/db-status src/app/api/depts src/app/api/deptcontrol src/app/api/candidates/hrm-options src/app/api/candidates/source-recruits tests/api-depts.test.ts
git commit -m "feat(api): add AW department control, master options, and health endpoints"
```

---

### Task 6: Candidates & Demand Management APIs

**Files:**
- Create: `aw-recruiting-report-nextjs/src/app/api/candidates/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/candidates/check-cccd/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/candidates/set-empno/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/candidates/export/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/demand/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/demand/sync-all/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/aw-recuitingReport/getDataById/[id]/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/aw-recuitingReport/checkCccd/[cccd]/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/aw-recuitingReport/GetDataByCCCDResign/route.ts`

**Interfaces:**
- Consumes: `prisma`, `reconcileAwDemandByDemId`, `normalizeCccd`.
- Produces: Full CRUD API cho `employee_info` (`loc = 'aw'`) và `demand_data` (`dem_id`), gán mã thẻ 6 chữ số `0xxxxx`, kiểm tra CCCD.

- [ ] **Step 1: Viết route `/api/candidates/route.ts`, `check-cccd`, `set-empno`, `export`**
  - `GET /api/candidates`: mặc định `status = '1'`, hỗ trợ lọc `demand_id` qua `demId` và `empDemandid`, tìm kiếm theo tên/CCCD/mã thẻ/bộ phận.
  - `POST /api/candidates`: tạo/sửa ứng viên (nếu chưa có `id` tự gán `keyInDate`), mặc định `loc = 'aw'`, nếu có `empDemandid` + `reg = 'yes'` + `newEmpno` thì gọi `reconcileAwDemandByDemId`.
  - `DELETE /api/candidates?id=...`: xóa mềm `status = '0'` (khớp `changeStatus` trong `api.php`).
  - `GET/POST /api/candidates/set-empno`:
    - `GET`: tìm max `newEmpno` dạng `^0[0-9]{5}$`, gợi ý mã tiếp theo (padding 6 số `0`), liệt kê ứng viên đủ điều kiện (`act_en_date`, `reg = 'yes'`, chưa có `newEmpno`), danh sách bộ phận lấy từ `aw_dept`.
    - `POST`: hỗ trợ cả cấp thẻ theo `candidateIds` từ UI mới VÀ cấp thẻ hàng loạt theo `act_en_date` + `tmp_departid` từ logic `api.php::setNewEmpno`, sau đó đồng bộ `reconcileAwDemandByDemId`.
  - `POST /api/candidates/check-cccd`: tra cứu lịch sử ứng viên theo `empId` trên `employee_info` và `resign_data` (`er_numberid`), trả về số lần từng làm việc (`workTimes`) và danh sách tiền sử nghỉ việc.

- [ ] **Step 2: Viết route `/api/demand/route.ts` và `/api/demand/sync-all/route.ts`**
  - `GET /api/demand`: lấy `demand_data`, ghép tên 3 ngôn ngữ từ `aw_dept` / `aw_dept_code`, hỗ trợ lọc `position`, `search`, `checkId`.
  - `POST /api/demand`: tạo/cập nhật nhu cầu bằng `demId` (khớp `addDemand` & `saveUpdateDemand` trong `api.php`). Kiểm tra trùng `demId` khi tạo mới (`checkDemandId`).
  - `DELETE /api/demand`: xóa nhu cầu theo `demId` hoặc `id`.
  - `POST /api/demand/sync-all`: chạy `reconcileAwDemandByDemId` cho toàn bộ các nhu cầu (khớp 100% `syncAllDemandData`).

- [ ] **Step 3: Viết các compatibility routes `/api/aw-recuitingReport/*`**
  - Đảm bảo hỗ trợ các URL gọi trực tiếp theo chuẩn route cũ nếu cần (`getDataById/[id]`, `checkCccd/[cccd]`, `GetDataByCCCDResign`).

- [ ] **Step 4: Kiểm tra TypeScript & Commit**

Run: `npx tsc --noEmit`
Expected: Không có lỗi biên dịch ở các API routes vừa tạo.

```bash
git add src/app/api/candidates src/app/api/demand src/app/api/aw-recuitingReport
git commit -m "feat(api): add AW candidates, set-empno, check-cccd, and demand APIs"
```

---

### Task 7: Analytics, Reports, Intern, Resign & Print APIs

**Files:**
- Create: `aw-recruiting-report-nextjs/src/app/api/recruiting-report/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/resign/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/resign/analytics/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/resign/reasons/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/resign/stats/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/intern/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/upload/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/print/unswiped/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/print/hires/route.ts`
- Create: `aw-recruiting-report-nextjs/src/app/api/dashboard/analytics/route.ts`

**Interfaces:**
- Consumes: `calculateAwRecruitReportRow`, `calculateAwResignReportRow`, `prisma`.
- Produces: API phục vụ Dashboard PowerBI, Báo cáo tuyển dụng, Báo cáo thôi việc, Quản lý thực tập sinh và In ấn (`printUnswiped`, `printHires`).

- [ ] **Step 1: Triển khai `/api/recruiting-report/route.ts` và `/api/dashboard/analytics/route.ts`**
  - Sử dụng `calculateAwRecruitReportRow` để tính chính xác từng dòng báo cáo dựa trên `dem_id`, `dem_dept`, `fromDate`, `toDate`, gắn tên đa ngôn ngữ từ `aw_dept`.
  - `/api/dashboard/analytics/route.ts`: kế thừa toàn bộ PowerBI Cross-Filtering API của app mẫu nhưng dùng `aw_dept` + `aw_dept_code` làm bộ từ điển đơn vị, `dem_id` cho nhu cầu, và `loc = 'aw'`.

- [ ] **Step 2: Triển khai các API `/api/resign/*` (`route.ts`, `analytics`, `reasons`, `stats`)**
  - CRUD cho `resign_data`.
  - Tích hợp `calculateAwResignReportRow` cho báo cáo theo phòng ban (Tây Ninh vs Ngoài Tây Ninh, độ tuổi, thâm niên, xe, giới tính, 13 lý do).
  - Cung cấp data biểu đồ Pareto lý do, phân bố độ tuổi, thâm niên cho trang `/resign`.

- [ ] **Step 3: Triển khai `/api/intern/route.ts`, `/api/upload/route.ts`, `/api/print/unswiped/route.ts`, `/api/print/hires/route.ts`**
  - `intern/route.ts`: CRUD `intern_data`, join tên bộ phận từ `aw_dept`.
  - `upload/route.ts`: lưu file ảnh upload vào `public/uploads/` an toàn (kiểm tra kích thước/MIME).
  - `print/unswiped/route.ts`: lọc `actEnDate == date` && `reg == 'yes'`, nhóm `tmpDepartid`, join `aw_dept.sub_division` & `duty_hrm.duty_no` (khớp 100% `api.php::printUnswiped`).
  - `print/hires/route.ts`: lọc `exEnDate == date`, nhóm `tmpDepartid`, trả về `reg`, `reason`, `change_en_date` (khớp 100% `api.php::printHires`).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/recruiting-report src/app/api/resign src/app/api/intern src/app/api/upload src/app/api/print src/app/api/dashboard
git commit -m "feat(api): add AW recruiting-report, resign analytics, intern, print, and dashboard APIs"
```

---

### Task 8: Frontend Contexts, Locales, Layout & Shared Dashboard Components

**Files:**
- Create: `aw-recruiting-report-nextjs/src/locales/{vi,en,cn,index}.ts`
- Create: `aw-recruiting-report-nextjs/src/context/{SessionContext,ScannerContext,DialogContext}.tsx`
- Create: `aw-recruiting-report-nextjs/src/hooks/{useTranslation,useTableExcelFilter,useWebSerialScanner}.ts`
- Create: `aw-recruiting-report-nextjs/src/config/tour-steps.ts`
- Create: `aw-recruiting-report-nextjs/src/components/layout/{Header,TabNav,MobileBottomNav}.tsx`
- Create: `aw-recruiting-report-nextjs/src/components/auth/RouteGuard.tsx`
- Create: `aw-recruiting-report-nextjs/src/components/ui/AppDialog.tsx`
- Create: `aw-recruiting-report-nextjs/src/components/scanner/ScannerStatusBadge.tsx`
- Create: `aw-recruiting-report-nextjs/src/components/table/ExcelColumnFilter.tsx`
- Create: `aw-recruiting-report-nextjs/src/components/tour/*`
- Create: `aw-recruiting-report-nextjs/src/components/bento/*`
- Create: `aw-recruiting-report-nextjs/src/components/dashboard-powerbi/*`
- Create: `aw-recruiting-report-nextjs/src/app/layout.tsx`

**Interfaces:**
- Consumes: `src/app/api/*`, `public/logo.png`.
- Produces: Toàn bộ khung giao diện (Layout, Navbar, TabNav, PowerBI Charts, Tour, WebSerial CCCD Scanner, Multi-lang VI/EN/CN) giống 100% `recruiting-report-nextjs`.

- [ ] **Step 1: Sao chép các component hiển thị thuần UI từ app mẫu**

Copy toàn bộ `src/components/bento/`, `src/components/dashboard-powerbi/`, `src/components/table/`, `src/components/tour/`, `src/components/ui/`, `src/components/scanner/`, `src/hooks/` từ `D:\source\recruiting-report_ori_new\recruiting-report-nextjs\src` sang `aw-recruiting-report-nextjs\src`.

- [ ] **Step 2: Cấu hình `SessionContext.tsx`, `Header.tsx`, `TabNav.tsx`, `locales` cho AW**
  - Trong `SessionContext.tsx`:
    - Cập nhật SSO app key kiểm tra session thành `"aw-recruiting-report"` (hỗ trợ đọc `vue-session-key["aw-recruiting-report"]` và `localStorage.getItem("aw-recruiting-report-session")`).
    - Cố định nhà máy mặc định `factory: "aw"` (`selectedFactory: "aw"`), tránh tự động ép về `"dmc"`.
    - Cho phép fallback role `"admin"` khi chạy dev cục bộ nếu không có SSO token, giữ nguyên luồng `checkAppAccess` khi có `empno`.
  - Trong `locales/{vi,en,cn}.ts`:
    - Cập nhật `appName`: `"AW-Báo cáo tuyển dụng"` (VI), `"AW-Recruiting-report"` (EN), `"AW-招聘報告"` (CN).
  - Trong `PowerBiSlicersBar.tsx`:
    - Ẩn hoặc giữ slicer nhà máy hiển thị duy nhất `AW` (hoặc lấy động từ `aw_dept`), giữ nguyên style UI thanh lọc PowerBI.

- [ ] **Step 3: Viết `src/app/layout.tsx` và kiểm tra biên dịch TypeScript**

Tạo `src/app/layout.tsx` bọc `SessionProvider`, `ScannerProvider`, `DialogProvider`, `AppTourProvider`, `RouteGuard`, `Header`, `MobileBottomNav` giống hệt app mẫu.

Run: `npx tsc --noEmit` (chỉ kiểm tra lỗi của các files đã tạo trong bước này).

- [ ] **Step 4: Commit**

```bash
git add src/locales src/context src/hooks src/config src/components src/app/layout.tsx
git commit -m "feat(ui): add layout, contexts, locales, and PowerBI components for AW"
```

---

### Task 9: App Pages & Print Templates

**Files:**
- Create: `aw-recruiting-report-nextjs/src/app/page.tsx` (Executive Dashboard)
- Create: `aw-recruiting-report-nextjs/src/app/candidates/page.tsx`
- Create: `aw-recruiting-report-nextjs/src/app/candidates/new/page.tsx`
- Create: `aw-recruiting-report-nextjs/src/app/demand/page.tsx`
- Create: `aw-recruiting-report-nextjs/src/app/deptcontrol/page.tsx`
- Create: `aw-recruiting-report-nextjs/src/app/recruiting-report/page.tsx`
- Create: `aw-recruiting-report-nextjs/src/app/resign/page.tsx` & `src/app/resign/components/*`
- Create: `aw-recruiting-report-nextjs/src/app/intern/page.tsx`
- Create: `aw-recruiting-report-nextjs/src/app/print/*`
- Create: `aw-recruiting-report-nextjs/src/app/template-print/*`

**Interfaces:**
- Consumes: Task 5, 6, 7 APIs và Task 8 Components.
- Produces: Toàn bộ 100% trang tính năng với giao diện y hệt `recruiting-report-nextjs` và nghiệp vụ AW.

- [ ] **Step 1: Sao chép và điều chỉnh các trang Dashboard, Candidates, Demand, Recruiting Report**
  - `src/app/page.tsx`: giữ 100% giao diện PowerBI Command Center, truyền `loc=aw`.
  - `src/app/candidates/page.tsx` & `new/page.tsx`: giữ 100% giao diện bảng ứng viên & form tạo mới đa tab (quét CCCD WebSerial, kiểm tra trùng CCCD, gán mã thẻ 6 chữ số `0xxxxx`, chọn `dem_id` từ `/api/demand`, chọn phòng ban từ `aw_dept`).
  - `src/app/demand/page.tsx`: hiển thị và quản lý nhu cầu theo `dem_id` (thay cho `id_code`), nút đồng bộ `syncAllDemandData` gọi `/api/demand/sync-all`.
  - `src/app/recruiting-report/page.tsx`: hiển thị đầy đủ các cột báo cáo tuyển dụng AW (`dem_id`, `dem_note`, `demand`, `totalRecruitedUntilToday`, `stillInNeedUntilToday`, `comeToInterview`, `comeByBus`, `accByHR`, `accByDept`, `expectedEnrollDate`, `actualEnrollDate`, `totalRecruitedByBusToday`, `totalRegForBusToday`) + xuất Excel.

- [ ] **Step 2: Triển khai `/deptcontrol/page.tsx` khớp bảng `aw_dept` & nghiệp vụ AW**
  - Cho phép tìm kiếm, thêm mới và sửa bản ghi `aw_dept`: `department`, `sub_department`, `sub_division`, `name` (VI/EN/CN), `start_date`, `end_date` (khớp `pages/deptcontrol.vue` cũ trong phong cách UI Tailwind hiện đại của app mẫu).

- [ ] **Step 3: Sao chép và điều chỉnh `/resign`, `/intern`, `/print/*`, `/template-print/*`**
  - `/resign`: tích hợp bảng thống kê lý do & địa phương Tây Ninh + các biểu đồ Donut/Pareto/CrossDimension từ app mẫu.
  - `/intern`: kết nối `/api/intern` & `aw_dept`.
  - `/print/*` & `/template-print/*`: in phiếu tuyển dụng, `print/hires`, `print/bqt`, `print/resign`, và bổ sung trang/tab in danh sách chưa quẹt thẻ (`printUnswiped` gọi `/api/print/unswiped`).

- [ ] **Step 4: Kiểm tra build production toàn bộ dự án Next.js**

Run:
```powershell
cd d:\source\aw-recruiting-report\aw-recruiting-report-nextjs
npx tsc --noEmit
npm run build
```
Expected: `npx tsc --noEmit` 0 errors, `npm run build` hoàn thành sạch (Compiled successfully) và tạo bundle `.next/standalone`.

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat(pages): implement all Next.js App Router pages & print templates for AW"
```

---

### Task 10: Database Migration Verification, Server Start & Visual Browser Testing

**Files:**
- Modify: `d:\source\aw-recruiting-report\.gitignore` (nếu cần)
- Test & Verify: Live PostgreSQL `10.1.16.89:5432/aw_recruiting_report` & Live UI browser verification.

- [ ] **Step 1: Chạy script chuyển đổi dữ liệu từ dump `12h20m01s_aw-recruiting-report.sql` vào PostgreSQL `10.1.16.89`**

Run:
```powershell
cd d:\source\aw-recruiting-report\aw-recruiting-report-nextjs
npm run migrate:dump
```
Expected:
- Tạo DB `aw_recruiting_report` thành công trên `10.1.16.89:5432`.
- `prisma db push` thành công.
- Nạp đầy đủ bản ghi cho `aw_dept` (322), `aw_dept_code` (309), `demand_data`, `employee_info`, `intern_data`, `job_level_tbl` (735), `birth_province` (63), `duty_hrm` (13), `edu_hrm` (14), `nation_hrm` (36), `reason_resign` (19), `source_recruit` (9).
- Đồng bộ sequences thành công.

- [ ] **Step 2: Chạy lại toàn bộ unit tests và kiểm tra API sức khỏe hệ thống**

Run:
```powershell
npm test
```
Expected: 100% tests PASS.

- [ ] **Step 3: Khởi chạy dev server (cổng động) và kiểm tra trực quan trên trình duyệt (`browser-testing`)**
  - Khởi động `npm run dev` (ghi nhận cổng động thực tế được gán).
  - Dùng `browser` subagent kiểm tra trực quan toàn bộ các màn hình: `/`, `/candidates`, `/candidates/new`, `/demand`, `/deptcontrol`, `/recruiting-report`, `/resign`, `/intern`, `/print`.
  - Xác nhận dữ liệu AW thật load từ PostgreSQL `10.1.16.89`, không có lỗi console/network 500, UI khớp thiết kế chuẩn của `recruiting-report-nextjs`.

- [ ] **Step 4: Cập nhật đồ thị tri thức dự án và Commit cuối**

Run:
```powershell
cd d:\source\aw-recruiting-report
graphify update .
git status
```
Expected: Mọi thay đổi sạch sẽ, đã commit đầy đủ.
