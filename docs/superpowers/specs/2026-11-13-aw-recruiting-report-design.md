# Design Specification: aw-recruiting-report (Next.js 15 + PostgreSQL)

**Tác giả**: Antigravity  
**Ngày tạo**: 2026-11-13  
**Trạng thái**: Chờ người dùng phê duyệt (Pending User Review)  
**Tài liệu tham khảo**:
- Mã nguồn tham chiếu UI & kiến trúc: `D:\source\recruiting-report_ori_new\recruiting-report-nextjs`
- Mã nguồn và nghiệp vụ gốc AW: `d:\source\aw-recruiting-report` (`api.php`, `pages/*.vue`)
- File dump CSDL MySQL/MariaDB: `12h20m01s_aw-recruiting-report.sql`
- Tiêu chuẩn thiết kế CSDL: `/postgresql-table-design`

---

## 1. Tổng Quan & Mục Tiêu Dự Án (Overview & Goals)

### 1.1 Bối cảnh
Hệ thống quản lý báo cáo tuyển dụng của nhà máy AW (`aw-recruiting-report`) hiện đang chạy trên nền tảng cũ (Nuxt 2 / Vue 2 + Laravel API + MariaDB). Cần nâng cấp và tái cấu trúc sang kiến trúc hiện đại **Next.js 15 + PostgreSQL**, kế thừa toàn bộ trải nghiệm người dùng hiện đại của ứng dụng chuẩn `recruiting-report-nextjs` (VG version).

### 1.2 Yêu cầu cốt lõi
1. **Vị trí thư mục**: Đặt tại thư mục con `d:\source\aw-recruiting-report\aw-recruiting-report-nextjs`.
2. **Giao diện người dùng (UI/UX)**: Giống 100% ứng dụng `recruiting-report-nextjs` (Tailwind CSS, Lucide Icons, Framer Motion, App Router, hệ thống Dashboard PowerBI cross-filtering, bộ lọc đa chiều, in ấn biểu mẫu).
3. **Bảo toàn 100% nghiệp vụ AW**: Đảm bảo chính xác toàn bộ logic nghiệp vụ thực tế bóc tách từ `api.php` của AW:
   - Cơ cấu cây phòng ban riêng của AW (`aw_dept`, `aw_dept_code`).
   - Khóa định danh nhu cầu tuyển dụng `dem_id` và cơ chế tính toán tự động `dem_recruited`, `dem_fulfilled`.
   - Phễu thống kê tuyển dụng `recruitReport` và thống kê thôi việc `resignReport` (đặc thù Tây Ninh, 13 nhóm lý do).
   - Kiểm tra CCCD / Tái tuyển dụng (`checkCccd`).
   - Báo cáo in ấn chuyên biệt (`printUnswiped`, `printHires`).
4. **Cơ sở dữ liệu PostgreSQL**: Kết nối máy chủ `10.1.16.89:5432` (`postgres`/`postgres`, DB `aw_recruiting_report`), tuân thủ nghiêm ngặt quy chuẩn `/postgresql-table-design` (`TIMESTAMPTZ`, khóa tự tăng `IDENTITY`, `JSONB`, đánh index đầy đủ các cột FK và filter).
5. **Cổng chạy (Ports)**:
   - Dev cục bộ: Cổng ngẫu nhiên / linh hoạt (`npm run dev -- -p <port>`).
   - Docker Compose: Cổng công khai **`7307`** qua Nginx reverse proxy.
6. **Công cụ chuyển đổi dữ liệu**: Script tự động trích xuất, làm sạch và nạp dữ liệu từ file dump `12h20m01s_aw-recruiting-report.sql` vào PostgreSQL.

---

## 2. Kiến Trúc Kỹ Thuật (Architecture & Tech Stack)

```
+-----------------------------------------------------------------------+
|                Trình Duyệt Người Dùng (Client Browser)                |
+-----------------------------------------------------------------------+
                                    |
          HTTP/HTTPS (Port 7307 trên Docker / Dynamic Port trên Dev)
                                    v
+-----------------------------------------------------------------------+
|                    Nginx Reverse Proxy Container                      |
+-----------------------------------------------------------------------+
                                    | Port 3002 (Internal)
                                    v
+-----------------------------------------------------------------------+
|                    Ứng Dụng Next.js 15 (Node.js 20+)                 |
|  - React 19 + Tailwind CSS + Lucide React + Framer Motion             |
|  - App Router (Server Components & Client Interactivity)              |
|  - Server-side REST API Routes (/src/app/api/*)                       |
|  - Xuất báo cáo PDF & Excel (jspdf, html2canvas, xlsx)                |
+-----------------------------------------------------------------------+
                                    | Prisma Client (ORM)
                                    v
+-----------------------------------------------------------------------+
|                   PostgreSQL 16 (10.1.16.89:5432)                     |
|  Database: aw_recruiting_report                                       |
|  - Bảng chính: employee_info, demand_data, resign_data, aw_dept...     |
|  - Chuẩn hóa: TIMESTAMPTZ, JSONB, GIN & B-Tree Indexes                 |
+-----------------------------------------------------------------------+
```

### Chi tiết Stack công nghệ:
- **Framework**: Next.js 15.0.3 (App Router, Standalone output).
- **Ngôn ngữ**: TypeScript 5.6.
- **Thư viện UI**: React 19, Tailwind CSS 3.4, Lucide React, Framer Motion.
- **ORM & Database**: Prisma 5.22 kết nối PostgreSQL 16.
- **Tiện ích xuất dữ liệu**: `xlsx`, `jspdf`, `html2canvas`.
- **Triển khai**: Dockerfile đa tầng (Multi-stage build) + `docker-compose.yml` (Port 7307).

---

## 3. Thiết Kế Cơ Sở Dữ Liệu PostgreSQL (Database Schema)

Tuân thủ quy chuẩn `/postgresql-table-design`:
- Kiểu khóa chính: `Int @id @default(autoincrement())` (PostgreSQL `BIGINT GENERATED ALWAYS AS IDENTITY`).
- Kiểu thời gian: `TIMESTAMPTZ` cho các mốc thời gian hệ thống (`createdAt`, `updatedAt`).
- Kiểu chuỗi: Dùng `TEXT` thay vì `VARCHAR(n)` tùy tiện.
- Cột cấu trúc / Đa ngôn ngữ: Dùng `JSONB` cho dữ liệu đa ngôn ngữ (`name`, `duty_name`, `reason`, `source`) và mảng đối tượng (`dem_candidates`).
- Đánh chỉ mục: Đánh index B-tree cho tất cả cột tham chiếu Foreign Key và các cột hay lọc (`WHERE`).

### 3.1 Schema Prisma Đầy Đủ (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. BẢNG ỨNG VIÊN & NHÂN VIÊN
model EmployeeInfo {
  id              Int       @id @default(autoincrement())
  keyInDate       String?   @map("key_in_date") @db.Text
  candidateName   String?   @map("candidate_name") @db.Text
  dateOfBirth     String?   @map("dateofbirth") @db.Text
  gender          String?   @db.Text
  empId           String?   @map("emp_id") @db.Text // Số CCCD / CMND
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
  empDemandid     String?   @map("emp_demandid") @db.Text // Khóa trỏ đến demand_data.dem_id
  userInput       String?   @map("user_input") @db.Text
  userUpdate      String?   @map("user_update") @db.Text
  regTel          String?   @map("regTel") @db.Text
  regAddress      String?   @map("regAddress") @db.Text
  commTel         String?   @map("commTel") @db.Text
  commAddress     String?   @map("commAddress") @db.Text
  national        String?   @db.Text
  newEmpno        String?   @map("newEmpno") @db.Text // Mã thẻ nhân viên
  tmpIdyclass     String?   @map("tmp_idyclass") @db.Text
  tmpDepartid     String?   @map("tmp_departid") @db.Text // Trỏ đến aw_dept.sub_division
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

// 2. BẢNG NHU CẦU TUYỂN DỤNG
model DemandData {
  id               Int       @id @default(autoincrement())
  demId            String?   @unique @map("dem_id") @db.Text // Mã nhu cầu AW (540, 541...)
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

// 3. BẢNG PHÒNG BAN ĐẶC THÙ AW
model AwDept {
  id            Int       @id @default(autoincrement())
  department    String    @db.Text
  mainGroup     String?   @map("main_group") @db.Text
  subDepartment String    @map("sub_department") @db.Text
  subDivision   String    @map("sub_division") @db.Text
  name          Json      @default("{}") // JSON: {"vi":"...", "en":"...", "cn":"..."}
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

// 4. BẢNG NHÂN VIÊN THÔI VIỆC
model ResignData {
  id            Int       @id @default(autoincrement())
  erEmpid       String    @map("er_empid") @db.Text
  erIndate      DateTime  @map("er_indate") @db.Date
  erNumberid    String    @map("er_numberid") @db.Text // Số CCCD
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

// 5. BẢNG THỰC TẬP SINH
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

// 6. CÁC BẢNG MASTER DATA
model BirthProvince {
  id           Int    @id @default(autoincrement())
  provinceNo   String @map("province_no") @db.Text
  provinceName String @map("province_name") @db.Text

  @@map("birth_province")
}

model DutyHrm {
  id       Int    @id @default(autoincrement())
  dutyNo   String @map("duty_no") @db.Text
  dutyName Json?  @map("duty_name") // JSON: {"vi":"...", "en":"...", "cn":"..."}

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
  reason Json // JSON: {"vi":"...", "en":"...", "cn":"..."}

  @@map("reason_resign")
}

model SourceRecruit {
  id        Int       @id @default(autoincrement())
  source    Json // JSON: {"vi":"...", "en":"...", "cn":"..."}
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

---

## 4. Đặc Tả Nghiệp Vụ & API Routes Chi Tiết (Business Logic & APIs)

Mọi API route được triển khai trong `src/app/api/` phải đảm bảo phản hồi tương thích 100% với logic gốc:

### 4.1 Quản lý Ứng viên (`/api/candidates`)
- **GET `/api/candidates`**: Trả về danh sách ứng viên có `status = '1'` và `loc = 'aw'`, sắp xếp giảm dần theo `id`. Hỗ trợ các query params lọc: `department`, `position`, `dateRange`, `search`.
- **POST `/api/candidates`**: Lưu hoặc cập nhật ứng viên (`EmployeeInfo.upsert`).
- **GET `/api/candidates/check-cccd?cccd=...`**: Kiểm tra trùng CCCD, tiền sử làm việc và cảnh báo số lần vào công ty (`vg_work_times`).
- **POST `/api/candidates/set-empno`**: Gán mã thẻ mới (`newEmpno`), cập nhật ngày nhận việc thực tế (`act_en_date`) và kích hoạt đồng bộ vào `demand_data`.
- **GET `/api/candidates/export`**: Xuất file Excel danh sách ứng viên chuẩn cấu trúc theo yêu cầu phòng nhân sự.

### 4.2 Nhu cầu Tuyển dụng (`/api/demand`)
- **GET `/api/demand`**: Lấy danh sách nhu cầu, tự động kèm số lượng đã tuyển thực tế (`dem_recruited`) và trạng thái hoàn thành (`dem_fulfilled`).
- **POST `/api/demand`**: Thêm mới hoặc sửa nhu cầu dựa trên khóa `dem_id`.
- **POST `/api/demand/sync-all`**: Triển khai chính xác logic của `syncAllDemandData` trong `api.php`:
  1. Quét các ứng viên có `emp_demandid == dem_id`, `newEmpno != null`, `reg == 'yes'`.
  2. Cập nhật mảng JSON `dem_candidates: [{"empno": "...", "date": "...", "name": "..."}]`.
  3. Cập nhật `dem_recruited = count`.
  4. Nếu `dem_recruited >= dem_amount`: cập nhật `dem_fulfilled = 'yes'`, gán `dem_fullfilldate = max(act_en_date)`.

### 4.3 Phòng Ban & Cơ Cấu Tổ Chức (`/api/deptcontrol` & `/api/depts`)
- **GET `/api/depts`**: Trả về danh sách phòng ban từ `aw_dept` phục vụ dropdown và chọn phòng ban trong các form.
- **POST `/api/deptcontrol`**: Thêm/sửa cơ cấu tổ chức AW (`department`, `sub_department`, `sub_division`, `name` JSON, `start_date`, `end_date`).

### 4.4 Báo cáo Phễu Tuyển dụng (`/api/recruiting-report`)
- Tiếp nhận các tham số: `key_in_date`, `dem_dept` (mảng mã phòng ban), `fromdate`, `todate`.
- Triển khai chính xác công thức từ `recruitReport` trong `api.php`:
  - `totalRecruitedUntilToday`: `act_en_date >= fromdate && act_en_date <= todate && reg === 'yes'`.
  - `stillInNeedUntilToday` & `actualVacancies`: `max(0, demand - totalRecruited)`.
  - `comeToInterview`: `hr_iv_date` nằm trong khoảng ngày.
  - `comeByBus`: ứng viên đi xe đưa rước phỏng vấn (`brou_com_bus === 'yes'`).
  - `accByHR` & `accByDept`: kết quả đạt HR / Bộ phận (`hr_ac_qu === 'yes'`, `dp_ac_qu === 'yes'`).
  - `expectedEnrollDate`: `ex_en_date` trong khoảng ngày và cả 2 bên đạt.
  - `actualEnrollDate`: `act_en_date` trong khoảng ngày.
  - `totalRegForBusToday`: đăng ký xe buýt (`regedForBus === 'yes'`).

### 4.5 Phân Tích & Báo Cáo Thôi Việc (`/api/resign/analytics`)
- Tiếp nhận: `from_er_resigndate`, `to_er_resigndate`, `er_deptid` (danh sách phòng ban).
- Phân tích chi tiết:
  - Phân vùng địa lý: Tây Ninh (`er_address LIKE '%Tây Ninh%'`) vs Ngoài Tây Ninh.
  - Phân nhóm độ tuổi: 18-30, 31-45, >45.
  - Thâm niên làm việc: <1 năm, 1 năm, 2 năm, >2 năm.
  - Phương tiện: Xe đưa rước (`er_bus`).
  - Tỷ lệ giới tính: Nam / Nữ.
  - Bảng thống kê theo 13 lý do nghỉ việc chuẩn của AW (`reasonHometown`, `reasonStudy`, `reasonWorkIsUnsuitable`, `reasonAbsenteeismForFiveDays`, v.v.).

### 4.6 In Ấn Chuyên Biểu (`/api/print/unswiped` & `/api/print/hires`)
- **Unswiped (`printUnswiped`)**: Lọc ứng viên có `act_en_date` và `reg == 'yes'`, nhóm theo `tmp_departid`, join lấy tên tổ/ngành từ `aw_dept.sub_division` và chức vụ từ `duty_hrm`.
- **Hires (`printHires`)**: Lọc ứng viên theo `ex_en_date`, nhóm theo `tmp_departid`, hỗ trợ xem lý do thay đổi ngày nhận việc (`change_en_date`, `reason`).

---

## 5. Kế Hoạch Chuyển Đổi & Nạp Dữ Liệu (Data Migration Strategy)

### 5.1 Script `scripts/migrate-aw-from-dump.js`
Script chuyên dụng Node.js sử dụng stream đọc file `12h20m01s_aw-recruiting-report.sql`:
1. **Làm sạch ngày giờ**:
   - `0000-00-00 00:00:00` và `0000-00-00` -> `NULL`.
   - Chuỗi giá trị `"no"`, `"null"` ở cột date -> `NULL`.
2. **Làm sạch ký tự**:
   - Thay thế cú pháp MariaDB `\'` -> `''`.
   - Bỏ backticks `` `cột` `` -> `cột`.
3. **Thực thi tuần tự**:
   - Khởi tạo bảng qua `npx prisma db push`.
   - Nạp các bảng Master Data: `birth_province`, `duty_hrm`, `edu_hrm`, `nation_hrm`, `reason_resign`, `source_recruit`, `job_level_tbl`.
   - Nạp các bảng cơ cấu: `aw_dept`, `aw_dept_code`.
   - Nạp bảng nghiệp vụ: `demand_data`, `employee_info`, `intern_data`, `resign_data`.
4. **Đồng bộ Sequence**:
   - Chạy lệnh `SELECT setval(pg_get_serial_sequence('...', 'id'), coalesce(max(id), 1)) FROM ...;` cho tất cả các bảng để tránh lỗi khóa chính trùng lặp khi thêm bản ghi mới.
5. **Kiểm tra đối soát (Audit Count)**:
   - In bảng đối chiếu số lượng bản ghi giữa dump gốc và PostgreSQL mới.

---

## 6. Môi Trường Triển Khai & Docker (Port 7307)

### 6.1 `docker-compose.yml`
```yaml
version: '3.8'

services:
  aw-recruiting-app:
    container_name: aw-recruiting-report-app
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    expose:
      - "3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - HOSTNAME=0.0.0.0
      - DATABASE_URL=postgresql://postgres:postgres@10.1.16.89:5432/aw_recruiting_report?schema=public
    networks:
      - aw-network

  aw-nginx-proxy:
    image: nginx:alpine
    container_name: aw-recruiting-report-nginx
    ports:
      - "7307:7307"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - aw-recruiting-app
    restart: unless-stopped
    networks:
      - aw-network

networks:
  aw-network:
    driver: bridge
```

### 6.2 `nginx.conf`
```nginx
server {
    listen 7307;
    server_name localhost;

    client_max_body_size 50M;

    location / {
        proxy_pass http://aw-recruiting-app:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 7. Kế Hoạch Triển Khai Tiếp Theo (Next Steps)
1. **Người dùng phê duyệt Design Spec này**.
2. **Kích hoạt kỹ năng `writing-plans`** để lập kế hoạch triển khai chi tiết (`implementation plan`) theo từng tác vụ nhỏ (scaffold, prisma schema, script migrate, api routes, UI components, verification).
3. **Thực thi kế hoạch** qua TDD/kiểm thử đối chiếu dữ liệu.
