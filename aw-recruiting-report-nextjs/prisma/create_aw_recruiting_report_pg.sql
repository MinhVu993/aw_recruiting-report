-- CreateTable
CREATE TABLE "employee_info" (
    "id" SERIAL NOT NULL,
    "key_in_date" TEXT,
    "candidate_name" TEXT,
    "dateofbirth" TEXT,
    "gender" TEXT,
    "emp_id" TEXT,
    "email" TEXT,
    "position" TEXT,
    "sub_position" TEXT,
    "apply_dp" TEXT,
    "hr_iv_date" TEXT,
    "hr_ac_date" TEXT,
    "dp_iv_date" TEXT,
    "dp_ac_date" TEXT,
    "hr_ac_qu" TEXT DEFAULT 'no',
    "dp_ac_qu" TEXT DEFAULT 'no',
    "reg" TEXT DEFAULT 'no',
    "ex_en_date" TEXT DEFAULT 'no',
    "act_en_date" TEXT DEFAULT 'no',
    "recru_source" TEXT DEFAULT 'no',
    "job_content" TEXT DEFAULT 'no',
    "brou_com_bus" TEXT DEFAULT 'no',
    "regedForBus" TEXT DEFAULT 'no',
    "vg_work_times" TEXT DEFAULT '0',
    "old_empno" TEXT,
    "re_vg_from" TEXT,
    "cv_received_at" TEXT,
    "salary_signed_at" TEXT,
    "note" TEXT,
    "school" TEXT,
    "emp_demandid" TEXT,
    "user_input" TEXT,
    "user_update" TEXT,
    "regTel" TEXT,
    "regAddress" TEXT,
    "commTel" TEXT,
    "commAddress" TEXT,
    "national" TEXT,
    "newEmpno" TEXT,
    "tmp_idyclass" TEXT,
    "tmp_departid" TEXT,
    "tmp_dutyid" TEXT,
    "ethnic" TEXT,
    "tmp_categoryid" TEXT,
    "tmp_levelid" TEXT,
    "tmp_rankid" TEXT,
    "tmp_siteid" TEXT,
    "tmp_workareaid" TEXT,
    "isdirect" TEXT,
    "countryid" TEXT,
    "marrage" TEXT,
    "birth_province" TEXT,
    "province" TEXT,
    "edu" TEXT,
    "probation" TEXT,
    "bus_info" TEXT,
    "datecccd" TEXT,
    "reason" TEXT,
    "change_en_date" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,
    "status" TEXT NOT NULL DEFAULT '1',
    "loc" TEXT NOT NULL DEFAULT 'aw',

    CONSTRAINT "employee_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_data" (
    "id" SERIAL NOT NULL,
    "dem_id" TEXT,
    "dem_dept" TEXT NOT NULL,
    "dem_sub_department" TEXT,
    "dem_unit" TEXT,
    "dem_position" TEXT NOT NULL,
    "dem_sub_position" TEXT,
    "dem_amount" INTEGER NOT NULL DEFAULT 0,
    "dem_inputdate" TEXT NOT NULL,
    "dem_recruited" INTEGER DEFAULT 0,
    "dem_fulfilled" TEXT NOT NULL DEFAULT 'no',
    "dem_fullfilldate" TEXT,
    "stocknumber" INTEGER DEFAULT 0,
    "dem_note" TEXT,
    "dem_candidates" JSONB DEFAULT '[]',
    "dem_pause_start_at" TEXT,
    "dem_pause_end_at" TEXT,
    "dem_cancel_date" TEXT,
    "user_input" TEXT,
    "user_update" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "demand_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aw_dept" (
    "id" SERIAL NOT NULL,
    "department" TEXT NOT NULL,
    "main_group" TEXT,
    "sub_department" TEXT NOT NULL,
    "sub_division" TEXT NOT NULL,
    "name" JSONB NOT NULL DEFAULT '{}',
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "aw_dept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aw_dept_code" (
    "id" SERIAL NOT NULL,
    "dept_code" TEXT NOT NULL,
    "name" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "aw_dept_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resign_data" (
    "id" SERIAL NOT NULL,
    "er_empid" TEXT NOT NULL,
    "er_indate" DATE NOT NULL,
    "er_numberid" TEXT NOT NULL,
    "er_name" TEXT NOT NULL,
    "er_deptid" TEXT NOT NULL,
    "er_deptname" TEXT NOT NULL,
    "er_joblevel" TEXT NOT NULL,
    "er_age" INTEGER NOT NULL,
    "er_seniority" INTEGER NOT NULL,
    "er_bus" TEXT NOT NULL,
    "er_gender" TEXT NOT NULL,
    "er_hometown" TEXT NOT NULL,
    "er_address" TEXT NOT NULL,
    "er_reason" TEXT NOT NULL,
    "er_note" TEXT,
    "er_keyindate" DATE NOT NULL,
    "er_resigndate" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "resign_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intern_data" (
    "id" SERIAL NOT NULL,
    "in_empid" TEXT NOT NULL,
    "in_name" TEXT NOT NULL,
    "in_deptcode" INTEGER NOT NULL,
    "in_school" TEXT NOT NULL,
    "in_edulv" TEXT NOT NULL,
    "in_major" TEXT NOT NULL,
    "in_startdate" DATE,
    "in_enddate" DATE,
    "in_allowance" TEXT NOT NULL,
    "in_bus" TEXT NOT NULL,
    "in_rectype" TEXT NOT NULL,
    "in_workingtime" TEXT NOT NULL,
    "in_note" TEXT,
    "in_photo" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "intern_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "birth_province" (
    "id" SERIAL NOT NULL,
    "province_no" TEXT NOT NULL,
    "province_name" TEXT NOT NULL,

    CONSTRAINT "birth_province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duty_hrm" (
    "id" SERIAL NOT NULL,
    "duty_no" TEXT NOT NULL,
    "duty_name" JSONB,

    CONSTRAINT "duty_hrm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edu_hrm" (
    "id" SERIAL NOT NULL,
    "edu_no" TEXT NOT NULL,
    "edu_name" TEXT NOT NULL,

    CONSTRAINT "edu_hrm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nation_hrm" (
    "id" SERIAL NOT NULL,
    "nation_code" TEXT NOT NULL,
    "nation_name" TEXT,

    CONSTRAINT "nation_hrm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reason_resign" (
    "id" SERIAL NOT NULL,
    "reason" JSONB NOT NULL,

    CONSTRAINT "reason_resign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_recruit" (
    "id" SERIAL NOT NULL,
    "source" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "source_recruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_level_tbl" (
    "id" SERIAL NOT NULL,
    "job_code" TEXT NOT NULL,

    CONSTRAINT "job_level_tbl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_employee_info_emp_id" ON "employee_info"("emp_id");

-- CreateIndex
CREATE INDEX "idx_employee_info_new_empno" ON "employee_info"("newEmpno");

-- CreateIndex
CREATE INDEX "idx_employee_info_demand_reg" ON "employee_info"("emp_demandid", "reg");

-- CreateIndex
CREATE INDEX "idx_employee_info_tmp_departid" ON "employee_info"("tmp_departid");

-- CreateIndex
CREATE INDEX "idx_employee_info_loc_status_created" ON "employee_info"("loc", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "demand_data_dem_id_key" ON "demand_data"("dem_id");

-- CreateIndex
CREATE INDEX "idx_demand_dem_id" ON "demand_data"("dem_id");

-- CreateIndex
CREATE INDEX "idx_demand_dept" ON "demand_data"("dem_dept");

-- CreateIndex
CREATE INDEX "idx_demand_unit" ON "demand_data"("dem_unit");

-- CreateIndex
CREATE INDEX "idx_demand_position" ON "demand_data"("dem_position");

-- CreateIndex
CREATE INDEX "idx_aw_dept_sub_division" ON "aw_dept"("sub_division");

-- CreateIndex
CREATE INDEX "idx_aw_dept_department" ON "aw_dept"("department");

-- CreateIndex
CREATE INDEX "idx_aw_dept_code_dept_code" ON "aw_dept_code"("dept_code");

-- CreateIndex
CREATE INDEX "idx_resign_resigndate" ON "resign_data"("er_resigndate");

-- CreateIndex
CREATE INDEX "idx_resign_deptid" ON "resign_data"("er_deptid");

-- CreateIndex
CREATE INDEX "idx_resign_numberid" ON "resign_data"("er_numberid");

