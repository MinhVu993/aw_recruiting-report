<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\awrecruitingreportEmployeeMdl as EmpnoInfo;
use App\awrecruitingreportDeptMdl as DeptCode;
use App\awrecruitingreportBrithProvinceMdl as BirthProvince;
use App\vgRecruitingReportDeptHrmMdl as DeptHrm;
use App\awrecruitingreportDutyMdl as DutyHrm;
use App\awrecruitingreportNationMdl as NationHrm;
use App\awrecruitingreportEduMdl as Edu;
use App\vgRecruitingReportMarrageMdl as Marrage;
use App\vgRecruitingRepoDirectMdl as Direct;
use App\awrecruitingreportSourceRecruitingMdl as SourceRecruit;
use App\awrecruitingreportDemandMdl as Demand;
use App\awrecruitingreportResignMdl as ResignData;
use App\awrecruitingreportInternMdl as Intern;
use App\awrecruitingtreportJobLevelMdl as JobLevel;
use App\eAWHrmMdl as awHrmMdl;
use App\eAWMdl as awMdl;
use App\awrecruitingreportReasonResignMdl as ReasonResign;
use App\photoHrmMdl as photoHrmMdl;
use Intervention\Image\Facades\Image;

class awRecruitingReportCtrl extends Controller
{
    public function getDataEmpnoInfo()
    {
        return [
            "dataEmpnoInfo" => EmpnoInfo::where("status", 1)
                ->orderBy("id", "desc")
                ->get(),
        ];
    }
    public function changeStatus($id = "")
    {
        try {
            $record = EmpnoInfo::findOrFail($id);
            $record->status = false;
            $record->save();

            return response()->json([
                "success" => true,
                "message" => "Status updated successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "message" => $e->getMessage(),
                ],
                500
            );
        }
    }
    public function getDataDeptFromDemand(Request $req)
    {
        $emp_demandid = $req->emp_demandid;
        $reg = $req->reg;
        // $act_en_date = $req->act_en_date;
        $data = EmpnoInfo::where("emp_demandid", $emp_demandid)
            ->where("reg", $reg)
            ->orderBy("emp_demandid", "asc")
            ->get();
        return $data;
    }
    public function getDataDeptCode()
    {
        return ["dataDeptCode" => DeptCode::orderBy("id", "desc")->get()];
    }
    public function getDataBirthProvince()
    {
        return [
            "dataBirthProvince" => BirthProvince::orderBy("id", "desc")->get(),
        ];
    }
    public function getDataDeptHrm()
    {
        return ["dataDeptHrm" => DeptCode::orderBy("id", "asc")->get()];
    }
    public function getDataDutyHrm()
    {
        return ["dataDutyHrm" => DutyHrm::orderBy("id", "asc")->get()];
    }
    public function getDataNationHrm()
    {
        return ["dataNationHrm" => NationHrm::orderBy("id", "asc")->get()];
    }
    public function getDataEdu()
    {
        return ["dataEdu" => Edu::orderBy("id", "asc")->get()];
    }
    public function getDataMarrage()
    {
        return ["dataMarrage" => Marrage::orderBy("id", "asc")->get()];
    }
    public function getDataDirect()
    {
        return ["dataDirect" => Direct::orderBy("id", "asc")->get()];
    }
    public function getDataReasonResign()
    {
        return [
            "dataReasonResign" => ReasonResign::orderBy("id", "asc")->get(),
        ];
    }
    public function getJobLevel()
    {
        return ["dataJobLevel" => JobLevel::orderBy("id", "asc")->get()];
    }
    public function savedb(Request $req)
    {
        $data = [
            "candidate_name" => $req->candidate_name,
            "dateofbirth" => $req->dateofbirth,
            "gender" => $req->gender,
            "position" => $req->position,
            "apply_dp" => $req->apply_dp,
            "hr_iv_date" => $req->hr_iv_date,
            "hr_ac_date" => $req->hr_ac_date,
            "dp_iv_date" => $req->dp_iv_date,
            "dp_ac_date" => $req->dp_ac_date,
            "hr_ac_qu" => $req->hr_ac_qu,
            "dp_ac_qu" => $req->dp_ac_qu,
            "emp_id" => $req->emp_id,
            "reg" => $req->reg,
            "ex_en_date" => $req->ex_en_date,
            "act_en_date" => $req->act_en_date,
            "recru_source" => $req->recru_source,
            "brou_com_bus" => $req->brou_com_bus,
            "regedForBus" => $req->regedForBus,
            "vg_work_times" => $req->vg_work_times,
            "old_empno" => $req->old_empno,
            "re_vg_from" => $req->re_vg_from,
            "cv_received_at" => $req->cv_received_at,
            "salary_signed_at" => $req->salary_signed_at,
            "note" => $req->note,
            "school" => $req->school,
            "sub_position" => $req->sub_position,
            "emp_demandid" => $req->emp_demandid,
            "user_input" => $req->user_input,
            "user_update" => $req->user_update,
            "regTel" => $req->regTel,
            "regAddress" => $req->regAddress,
            "commTel" => $req->commTel,
            "commAddress" => $req->commAddress,
            "national" => $req->national,
            "newEmpno" => $req->newEmpno,
            "tmp_idyclass" => $req->tmp_idyclass,
            "tmp_departid" => $req->tmp_departid,
            "tmp_dutyid" => $req->tmp_dutyid,
            "ethnic" => $req->ethnic,
            "tmp_categoryid" => $req->tmp_categoryid,
            "tmp_levelid" => $req->tmp_levelid,
            "tmp_rankid" => $req->tmp_rankid,
            "tmp_siteid" => $req->tmp_siteid,
            "tmp_workareaid" => $req->tmp_workareaid,
            "isdirect" => $req->isdirect,
            "countryid" => $req->countryid,
            "marrage" => $req->marrage,
            "birth_province" => $req->birth_province,
            "province" => $req->province,
            "edu" => $req->edu,
            "probation" => $req->probation,
            "bus_info" => $req->bus_info,
            "datecccd" => $req->datecccd,
            "reason" => $req->reason,
            "change_en_date" => $req->change_en_date,
        ];

        // Kiểm tra nếu id không tồn tại thì thêm key_in_date
        if (!EmpnoInfo::where("id", $req->id)->exists()) {
            $data["key_in_date"] = $req->key_in_date;
        }

        EmpnoInfo::updateOrCreate(["id" => $req->id], $data);
    }
    public function getDataById($id = "")
    {
        return EmpnoInfo::orderBy("id", "desc")
            ->find($id)
            ->toJson();
    }
    public function checkCccd($cccd = "")
    {
        $result = awHrmMdl::where("IC_NO", $cccd)->first();

        if ($result) {
            // Nếu tìm thấy, trả về EMPNO và số lần xuất hiện
            $count = awHrmMdl::where("IC_NO", $cccd)->count();
            return [
                "EMPNO" => $result->EMPNO,
                "count" => $count,
            ];
        } else {
            $result = awMdl::where("IC_NO", $cccd)->first();

            if ($result) {
                $count = awMdl::where("IC_NO", $cccd)->count();
                return [
                    "EMPNO" => $result->EMPNO,
                    "count" => $count,
                ];
            } else {
                return [
                    "EMPNO" => null,
                    "count" => 0,
                ];
            }
        }
    }
    public function saveSourceRecruiting(Request $req)
    {
        SourceRecruit::updateOrCreate(
            ["id" => $req->id],
            [
                "source" => json_encode($req->source),
            ]
        );
    }
    public function getSourceRecruiting()
    {
        return SourceRecruit::orderBy("id", "asc")->get();
    }
    public function getlastEmpno_dmc()
    {
        $lastEmployee = EmpnoInfo::whereNotNull("newEmpno")
            ->orderBy("newEmpno", "desc")
            ->first(["newEmpno"]);
        $empNo = $lastEmployee->newEmpno;
        return response()->json($empNo);
    }
    public function setNewEmpno(Request $req)
    {
        $req->validate([
            "newEmpno" => "required|integer",
            "act_en_date" => "required|date",
        ]);
        $newEmpno = $req->input("newEmpno");
        $actEnDate = $req->input("act_en_date");
        $tmp_departid = $req->input("tmp_departid");
        $currentEmpno = $newEmpno + 1;

        $data = EmpnoInfo::where("act_en_date", $actEnDate)
            ->where("reg", "yes")
            ->where("tmp_departid", $tmp_departid)
            ->orderBy("tmp_departid")
            ->get();

        $groupedData = $data->groupBy("tmp_departid");
        foreach ($groupedData as $tmpDepartId => $items) {
            foreach ($items as $item) {
                $formattedEmpno = str_pad(
                    (string) $currentEmpno,
                    6,
                    "0",
                    STR_PAD_LEFT
                );
                $item->newEmpno = $formattedEmpno;
                $item->save();
                $currentEmpno++;
            }
        }

        // Return the updated records
        $updatedData = EmpnoInfo::where("act_en_date", $actEnDate)
            ->where("reg", "yes")
            ->where("tmp_departid", $tmp_departid)
            ->orderBy("tmp_departid")
            ->get();

        return response()->json(
            [
                "success" => true,
                "message" => "EMPNO has been updated successfully.",
                "data" => $updatedData,
            ],
            200
        );
    }

    public function saveDeptCode(Request $req)
    {
        DeptCode::updateOrCreate(
            ["id" => $req->id],
            [
                "department" => $req->department,
                "sub_department" => $req->sub_department,
                "sub_division" => $req->sub_division,
                "name" => $req->name,
                "start_date" => $req->start_date,
                "end_date" => $req->end_date,
            ]
        );
    }
    public function getAllDemandData()
    {
        return Demand::orderBy("id", "asc")->get();
    }
    public function addDemand(Request $req)
    {
        $existingDemand = Demand::find($req->id);
        $dem_recruited = $existingDemand ? $existingDemand->dem_recruited : 0;
        $stocknumber = $req->dem_amount - $dem_recruited;

        Demand::updateOrCreate(
            ["dem_id" => $req->dem_id],
            [
                // 'dem_id' => $req->dem_id,
                "dem_dept" => $req->dem_dept,
                "dem_sub_department" => $req->dem_sub_department,
                "dem_unit" => $req->dem_unit,
                "dem_position" => $req->dem_position,
                "dem_sub_position" => $req->dem_sub_position,
                "dem_amount" => $req->dem_amount,
                "stocknumber" => $stocknumber,
                "dem_fulfilled" => $stocknumber === 0 ? "yes" : "no",
                "dem_inputdate" => $req->dem_inputdate,
                "dem_pause_start_at" => $req->dem_pause_start_at,
                "dem_pause_end_at" => $req->dem_pause_end_at,
                "dem_fullfilldate" => $req->dem_fullfilldate,
                "dem_note" => $req->dem_note,
            ]
        );
    }
    public function getDemandByDept(Request $req)
    {
        $demands = Demand::where("dem_dept", $req->dem_dept)
            ->orderBy("id", "asc")
            ->get();
        $filteredDemands = $demands
            ->map(function ($demand) {
                $empCount = EmpnoInfo::where("emp_demandid", $demand->dem_id)
                    ->where("reg", "yes")
                    ->count();
                if ($empCount < $demand->dem_amount) {
                    $demand->hired = $empCount;
                    return $demand;
                }
            })
            ->filter();
        return $filteredDemands->values();
    }
    public function updateReg(Request $req)
    {
        EmpnoInfo::where("id", $req->id)->update([
            "reg" => $req->reg,
            "act_en_date" => $req->act_en_date,
        ]);
        return response()->json(["message" => "reg  updated successfully"]);
    }

    public function getDemandById($id = "")
    {
        return Demand::where("dem_id", $id)->first();
    }
    public function countDemandById(
        $id = "",
        $act_en_date = "",
        $tmp_departid = ""
    ) {
        // return EmpnoInfo::where('emp_demandid', $id)->where('reg','yes')->where('act_en_date',$act_en_date)->where('tmp_departid',$tmp_departid)->count();

        try {
            // 1. Lấy demand hiện tại để kiểm tra dem_candidates
            $demand = Demand::where("dem_id", $id)->first();

            if (!$demand) {
                return 0;
            }
            // 2. Parse dem_candidates để lấy danh sách empno đã tồn tại
            $existingEmpnos = [];
            if ($demand->dem_candidates) {
                $candidates = json_decode($demand->dem_candidates, true);
                $existingEmpnos = array_map(function ($candidate) {
                    return $candidate["empno"];
                }, $candidates);
            }

            // 3. Đếm số lượng ứng viên mới (không có trong existingEmpnos)
            return EmpnoInfo::where("emp_demandid", $id)
                ->where("reg", "yes")
                ->whereNotIn("newEmpno", $existingEmpnos)
                ->count();
        } catch (\Exception $e) {
            \Log::error("Error in countDemandById: " . $e->getMessage());
            return 0;
        }
    }
    public function saveUpdateDemand(Request $req)
    {
        try {
            $existingDemand = Demand::where("dem_id", $req->id)->first();
            $totalRecruited =
                ($existingDemand ? $existingDemand->dem_recruited : 0) +
                $req->dem_recruited;

            $demFulfilled = $req->dem_amount - $totalRecruited === 0;

            $dem = Demand::updateOrCreate(
                ["dem_id" => $req->id],
                [
                    "dem_fullfilldate" => $demFulfilled
                        ? $req->dem_fullfilldate
                        : null,
                    "dem_recruited" => $totalRecruited,
                    "stocknumber" => $req->dem_amount - $totalRecruited,
                    "dem_fulfilled" => $demFulfilled ? "yes" : "no",
                    "dem_candidates" => json_encode($req->dem_candidates),
                    "updated_at" => now(),
                ]
            );

            return response()->json([
                "status" => "success",
                "message" => "Demand updated successfully",
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "status" => "error",
                    "message" => $e->getMessage(),
                ],
                500
            );
        }
    }
    public function recruitReport(Request $req)
    {
        $key_in_date = $req->key_in_date;
        $dem_depts = $req->dem_dept;
        $fromdate = $req->fromdate;
        $todate = $req->todate;

        // Lấy danh sách emp_demandid từ EmpnoInfo trong khoảng ngày
        $empDemandIds = EmpnoInfo::whereDate("act_en_date", ">=", $fromdate)
            ->whereDate("act_en_date", "<=", $todate)
            ->whereNotNull("emp_demandid")
            ->pluck("emp_demandid")
            ->unique()
            ->toArray();

        $validDepartments = Demand::whereIn("dem_dept", $dem_depts)
            ->where(function($query) use ($fromdate, $todate, $empDemandIds) {
                $query->whereIn("dem_id", $empDemandIds)
                      ->orWhere(function($subQuery) use ($fromdate, $todate) {
                          $subQuery->whereDate("dem_inputdate", ">=", $fromdate)
                                   ->whereDate("dem_inputdate", "<=", $todate);
                      });
            })
            ->select(
                "dem_id",
                "dem_dept",
                "dem_unit",
                "dem_sub_department",
                "dem_position",
                "dem_note"
            )
            ->distinct()
            ->get();

        $filteredResults = [];
        $processedCombinations = [];
        foreach ($validDepartments as $department) {
            $id = $department->dem_id;
            $dem_note = $department->dem_note;
            $dem_dept = $department->dem_dept;
            $dem_unit = $department->dem_unit;
            $position = $department->dem_position;

            $combinationKey =
                $id . "-" . $dem_dept . "_" . $dem_unit . "_" . $position;

            if (in_array($combinationKey, $processedCombinations)) {
                continue;
            }
            $processedCombinations[] = $combinationKey;
            $demand = Demand::where("dem_dept", $dem_dept)
                ->where("dem_id", $id)
           
                ->sum("dem_amount");    
            $empnoInfos = EmpnoInfo::where("apply_dp", $dem_dept)
                ->where("emp_demandid", $id)
                // ->where('position','Worker')
                ->get();

            $totalRecruitedUntilToday = $empnoInfos
                ->filter(function ($info) {
                    return !is_null($info->emp_demandid);
                })
                ->count();

            if ($demand > 0 || $totalRecruitedUntilToday > 0) {
                $filteredResults[] = [
                    "dem_id" => $id,
                    "dem_note" => $dem_note,
                    "dem_dept" => $dem_dept,
                    "dem_sub_department" => $department->dem_sub_department,
                    "dem_unit" => $dem_unit,
                    "position" => $position,
                    "demand" => $demand,
                    "totalRecruitedUntilToday" => $empnoInfos
                        ->filter(function ($item) use ($fromdate, $todate) {
                            return $item->act_en_date >= $fromdate &&
                                $item->act_en_date <= $todate &&
                                $item->reg === "yes";
                        })
                        ->count(),

                    // stillInNeedUntilToday: demand - totalRecruitedByBusToday
                    "stillInNeedUntilToday" => max(
                        0,
                        $demand -
                            $empnoInfos
                                ->filter(function ($item) use (
                                    $fromdate,
                                    $todate
                                ) {
                                    return $item->act_en_date >= $fromdate &&
                                        $item->act_en_date <= $todate;
                                })
                                ->count()
                    ),

                    "actualVacancies" => max(
                        0,
                        $demand -
                            $empnoInfos
                                ->filter(function ($item) use (
                                    $fromdate,
                                    $todate
                                ) {
                                    return $item->act_en_date >= $fromdate &&
                                        $item->act_en_date <= $todate;
                                })
                                ->count()
                    ),

                    "comeToInterview" => $empnoInfos
                        ->filter(function ($info) use ($fromdate, $todate) {
                            return $info->hr_iv_date >= $fromdate &&
                                $info->hr_iv_date <= $todate;
                        })
                        ->count(),

                    "comeByBus" => $empnoInfos
                        ->filter(function ($info) use ($fromdate, $todate) {
                            return $info->brou_com_bus === "yes" &&
                                $info->hr_iv_date >= $fromdate &&
                                $info->hr_iv_date <= $todate;
                        })
                        ->count(),
                    "accByHR" => $empnoInfos
                        ->filter(function ($info) use ($fromdate, $todate) {
                            return $info->hr_ac_qu === "yes" &&
                                $info->hr_ac_date >= $fromdate &&
                                $info->hr_ac_date <= $todate;
                        })
                        ->count(),
                    "accByDept" => $empnoInfos
                        ->filter(function ($info) use ($fromdate, $todate) {
                            return $info->dp_ac_qu === "yes" &&
                                $info->dp_ac_date >= $fromdate &&
                                $info->dp_ac_date <= $todate;
                        })
                        ->count(),

                    "expectedEnrollDate" => $empnoInfos
                        ->filter(function ($info) use ($fromdate, $todate) {
                            return $info->ex_en_date >= $fromdate &&
                                $info->ex_en_date <= $todate &&
                                $info->hr_ac_qu === "yes" &&
                                $info->dp_ac_qu === "yes";
                        })
                        ->count(),

                    "actualEnrollDate" => $empnoInfos
                        ->filter(function ($info) use ($fromdate, $todate) {
                            return $info->act_en_date >= $fromdate &&
                                $info->act_en_date <= $todate;
                        })
                        ->count(),

                    "totalRecruitedByBusToday" => $empnoInfos
                        ->where("brou_com_bus", "yes")
                        ->filter(function ($info) use ($key_in_date) {
                            return $info->act_en_date <= $key_in_date &&
                                $info->brou_com_bus === "yes";
                        })
                        ->count(),

                    "totalRegForBusToday" => $empnoInfos
                        ->where("regedForBus", "yes")
                        ->count(),
                ];
            }
        }
        return response()->json($filteredResults);
    }
    public function postByEmpNoHRM(Request $req)
    {
        $selArr = [
            "EMPNO as empno",
            "NAME_S as name",
            "SEX as sex",
            "DEPT_NO as dept_code",
            "IC_NO as ic_no",
            "DEPT_NAME as dept_name",
            "IN_DATE as in_date",
            "DIMISION_DATE as dismiss",
            "ADDRESS as address",
            "COUNTRY as country",
            "DUTY as duty",
            "BIRTHDAY as birthday",
        ];
        $query = awHrmMdl::select($selArr)->where("EMPNO", $req->empno);
        if ($query->count()) {
            $employee = $query->first();
        } else {
            $query = awMdl::select($selArr)->where("EMPNO", "'" . $req->empno);
            // $query = awMdl::select($selArr)->where('EMPNO', $req->empno);
            if ($query->count()) {
                $employee = $query->first();
            } else {
                return "null";
            }
        }

        // Calculate age
        $birthday = new \DateTime($employee->birthday);
        $currentDate = new \DateTime();
        $age = $currentDate->diff($birthday)->y;
        $employee->age = $age;

        // Calculate seniority
        $inDate = new \DateTime($employee->in_date);
        $seniority = $currentDate->diff($inDate)->y;
        $employee->seniority = $seniority;

        return $employee->toJson();
    }
    public function saveResign(Request $req)
    {
        ResignData::updateOrCreate(
            ["er_empid" => $req->er_empid],
            [
                "er_numberid" => $req->er_numberid,
                "er_name" => $req->er_name,
                "er_indate" => $req->er_indate,
                "er_deptid" => $req->er_deptid,
                "er_deptname" => $req->er_deptname,
                "er_joblevel" => $req->er_joblevel,
                "er_age" => $req->er_age,
                "er_seniority" => $req->er_seniority,
                "er_bus" => $req->er_bus,
                "er_gender" => $req->er_gender,
                "er_hometown" => $req->er_hometown,
                "er_reason" => $req->er_reason,
                "er_note" => $req->er_note,
                "er_resigndate" => $req->er_resigndate,
                "er_keyindate" => $req->er_keyindate,
                "er_address" => $req->er_address,
                "er_type_resign" => json_encode($req->er_type_resign),
            ]
        );
    }
    public function getResignData()
    {
        return ResignData::orderBy("er_resigndate", "desc")->get();
    }
    public function postUploadPhoto(Request $req)
    {
        return $req->file("photo")->store("recruiting-report");
    }
    // get all intern data
    public function getInternData()
    {
        return Intern::orderBy("id", "desc")->get();
    }
    public function postInternData(Request $req)
    {
        Intern::updateOrCreate(
            ["in_empid" => $req->in_empid],
            [
                "in_name" => $req->in_name,
                "in_school" => $req->in_school,
                "in_deptcode" => $req->in_deptcode,
                "in_edulv" => $req->in_edulv,
                "in_major" => $req->in_major,
                "in_startdate" => $req->in_startdate,
                "in_enddate" => $req->in_enddate,
                "in_allowance" => $req->in_allowance,
                "in_bus" => $req->in_bus,
                "in_rectype" => $req->in_rectype,
                "in_workingtime" => $req->in_workingtime,
                "in_photo" => $req->in_photo,
                "in_note" => $req->in_note,
            ]
        );
    }
    public function resignReport(Request $req)
    {
        $from_er_resigndate = $req->from_er_resigndate;
        $to_er_resigndate = $req->to_er_resigndate;
        $er_deptids = $req->er_deptid;

        $results = [];
        $resignData = ResignData::whereBetween("er_resigndate", [
            $from_er_resigndate,
            $to_er_resigndate,
        ])
            ->whereIn("er_deptid", $er_deptids)
            ->get();

        // Get unique departments that actually have resign data
        $existingDepts = $resignData->pluck("er_deptid")->unique();

        foreach ($existingDepts as $deptid) {
            $deptData = $resignData->where("er_deptid", $deptid);
            $results[] = [
                "dept" => $deptid,
                "totalResign" => $deptData->count(),
                "tayNinh" => $deptData
                    ->where("er_address", "like", "%Tây Ninh%")
                    ->count(),
                "notTayNinh" => $deptData
                    ->where("er_address", "not like", "%Tây Ninh%")
                    ->count(),
                "age18to30" => $deptData
                    ->where("er_age", ">=", 18)
                    ->where("er_age", "<=", 30)
                    ->count(),
                "age31to45" => $deptData
                    ->where("er_age", ">=", 31)
                    ->where("er_age", "<=", 45)
                    ->count(),
                "age46up" => $deptData->where("er_age", ">", 45)->count(),
                "seniorityLessThan1" => $deptData
                    ->where("er_seniority", "<", 1)
                    ->count(),
                "seniority1" => $deptData->where("er_seniority", 1)->count(),
                "seniority2" => $deptData->where("er_seniority", 2)->count(),
                "seniority3up" => $deptData
                    ->where("er_seniority", ">", 2)
                    ->count(),
                "bus" => $deptData
                    ->where("er_bus", "like", "%Xe đưa rước%")
                    ->count(),
                "genderMale" => $deptData->where("er_gender", "Nam")->count(),
                "genderFemale" => $deptData->where("er_gender", "Nữ")->count(),

                "reasonHometown" => $deptData->where("er_reason", 1)->count(),
                "reasonStudy" => $deptData->where("er_reason", 2)->count(),
                "reasonWorkIsUnsuitable" => $deptData
                    ->where("er_reason", 3)
                    ->count(),
                "reasonOther" => $deptData->where("er_reason", 4)->count(),
                "reasonAbsenteeismForFiveDays" => $deptData
                    ->where("er_reason", 5)
                    ->count(),
                "reasonReturnHomeToTakeCareOfChildren" => $deptData
                    ->where("er_reason", 6)
                    ->count(),
                "reasonPersonalReasons" => $deptData
                    ->where("er_reason", 7)
                    ->count(),
                "reasonHealthIsNotSufficientToContinueWorking" => $deptData
                    ->where("er_reason", 8)
                    ->count(),
                "reasonFamilyMatters" => $deptData
                    ->where("er_reason", 9)
                    ->count(),
                "reasonMisconductDismissedByTheCompany" => $deptData
                    ->where("er_reason", 10)
                    ->count(),
                "reasonContractExpired" => $deptData
                    ->where("er_reason", 11)
                    ->count(),
                "reasonFoundANewJob" => $deptData
                    ->where("er_reason", 12)
                    ->count(),
                "reasonFailedProbationPeriod" => $deptData
                    ->where("er_reason", 13)
                    ->count(),
            ];
        }
        return response()->json($results);
    }
    public function GetDataByCCCD(Request $req)
    {
        $emp_id = $req->emp_id;
        return EmpnoInfo::where("emp_id", $emp_id)
            ->orderBy("id", "desc")
            ->first();
    }
    public function GetDataByCCCDResign(Request $req)
    {
        $emp_id = $req->emp_id;
        return ResignData::where("er_numberid", $emp_id)
            ->orderBy("id", "desc")
            ->get();
    }
    public function getphoto($appname = null, $photoId = null)
    {
        if ($photoId) {
            $photo = photoHrmMdl::where([["empno", $photoId]])->first();
            $fullPath = storage_path("app/" . $photo->path);
            return Image::make($fullPath)
                ->widen(300)
                ->response("jpg");
        } else {
            $img = Image::canvas(300, 400, "#ff0000");
            $img->text("TOKEN INVALID", 35, 175, function ($font) {
                $font->file(realpath("arial.ttf"));
                $font->size(15);
                $font->color([255, 255, 0, 1]);
                $font->align("left");
                $font->valign("top");
            });
            return $img->response("jpg", 90);
        }
    }
    public function deleteDataById($id = "")
    {
        EmpnoInfo::find($id)->delete();
        return response()->json([
            "success" => "Record has been deleted successfully.",
        ]);
    }
    public function deleteDemandById(Request $req)
    {
        try {
            $demand = Demand::find($req->id);
            if (!$demand) {
                return response()->json(
                    [
                        "success" => false,
                        "message" => "Demand not found",
                    ],
                    404
                );
            }
            $demand->delete();
            return response()->json([
                "success" => true,
                "message" => "Record has been deleted successfully.",
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Error deleting record: " . $e->getMessage(),
                ],
                500
            );
        }
    }
    public function checkDemandId(Request $req)
    {
        $exists = Demand::where("dem_id", $req->dem_id)->exists();
        return response()->json(["exists" => $exists]);
    }
    public function printUnswiped(Request $req)
    {
        $act_en_date = $req->act_en_date;
        $data = EmpnoInfo::where("act_en_date", $act_en_date)
            ->where("reg", "yes")
            ->orderBy("tmp_departid", "asc")
            ->get();
        $groupedData = $data->groupBy("tmp_departid");
        $results = [];
        foreach ($groupedData as $tmpDepartId => $items) {
            foreach ($items as $item) {
                $deptCode = DeptCode::where(
                    "sub_division",
                    $item->tmp_departid
                )->first();
                $dutyHrm = DutyHrm::where(
                    "duty_no",
                    $item->tmp_dutyid
                )->first();

                $results[] = [
                    "newEmpno" => $item->newEmpno,
                    "candidate_name" => $item->candidate_name,
                    "tmp_departid" => $item->tmp_departid,
                    "tmp_dutyid" => $item->tmp_dutyid,
                    "name" => $deptCode ? $deptCode->name : null,
                    "duty_name" => $dutyHrm ? $dutyHrm->duty_name : null,
                ];
            }
        }
        return response()->json($results);
    }
    public function printHires(Request $req)
    {
        $ex_en_date = $req->ex_en_date;
        $data = EmpnoInfo::where("ex_en_date", $ex_en_date)->get();
        $groupedData = $data->groupBy("tmp_departid");
        $results = [];
        foreach ($groupedData as $tmpDepartId => $items) {
            foreach ($items as $item) {
                $deptCode = DeptCode::where(
                    "sub_division",
                    $item->tmp_departid
                )->first();
                $dutyHrm = DutyHrm::where(
                    "duty_no",
                    $item->tmp_dutyid
                )->first();
                $results[] = [
                    "ex_en_date" => $item->ex_en_date,
                    "candidate_name" => $item->candidate_name,
                    "tmp_departid" => $item->tmp_departid,
                    "tmp_dutyid" => $item->tmp_dutyid,
                    "name" => $deptCode ? $deptCode->name : null,
                    "duty_name" => $dutyHrm ? $dutyHrm->duty_name : null,
                    "reg" => $item->reg,
                    "reason" => $item->reason,
                    "change_en_date" => $item->change_en_date,
                ];
            }
        }
        return response()->json($results);
    }
    public function syncAllDemandData()
    {
        $updatedCount = 0;

        Demand::chunk(100, function ($demands) use (&$updatedCount) {
            foreach ($demands as $demand) {
                $employees = EmpnoInfo::where("emp_demandid", $demand->dem_id)
                    ->whereNotNull("newEmpno")
                    ->where("newEmpno", "!=", "")
                    ->where("reg", "yes")
                    ->get();

                // Bỏ qua nếu không có ứng viên nào hợp lệ
                if ($employees->isEmpty()) {
                    continue;
                }
                // 2. Chuyển đổi JSON hiện tại thành mảng
                $existingCandidates =
                    json_decode($demand->dem_candidates, true) ?? [];
                $existingEmpnos = array_column($existingCandidates, "empno");

                $isUpdated = false;
                $latestActEnDate = null;

                // 3. Duyệt qua danh sách nhân sự hợp lệ
                foreach ($employees as $emp) {
                    // Tìm ngày nhận việc lớn nhất (mới nhất)
                    if (
                        is_null($latestActEnDate) ||
                        $emp->act_en_date > $latestActEnDate
                    ) {
                        $latestActEnDate = $emp->act_en_date;
                    }

                    // Kiểm tra xem empno đã tồn tại trong mảng JSON chưa
                    if (!in_array($emp->newEmpno, $existingEmpnos)) {
                        $existingCandidates[] = [
                            "empno" => $emp->newEmpno,
                            "date" => $emp->act_en_date,
                            "name" => $emp->candidate_name,
                        ];

                        $existingEmpnos[] = $emp->newEmpno;
                        $isUpdated = true;
                    }
                }

                // 4. Nếu phát hiện có dữ liệu mới thì cập nhật và lưu DB
                if ($isUpdated) {
                    $dem_recruited = count($existingCandidates);
                    $stocknumber = $demand->dem_amount - $dem_recruited;

                    $demand->dem_candidates = json_encode(
                        $existingCandidates,
                        JSON_UNESCAPED_UNICODE
                    );
                    $demand->dem_recruited = $dem_recruited;
                    $demand->stocknumber = $stocknumber < 0 ? 0 : $stocknumber;

                    // Kiểm tra xem đã hoàn thành chỉ tiêu tuyển dụng chưa
                    if ($demand->stocknumber == 0) {
                        $demand->dem_fulfilled = "yes";
                        $demand->dem_fullfilldate = $latestActEnDate;
                    } else {
                        $demand->dem_fulfilled = "no";
                        $demand->dem_fullfilldate = null;
                    }

                    $demand->save();
                    $updatedCount++;
                }
            }
        });
        return response()->json(
            [
                "status" => "success",
                "message" => "All data has been scanned. Sync completed successfully {$updatedCount} recruitment requests.",
                "updated_demands_count" => $updatedCount,
            ],
            200
        );
    }
}
