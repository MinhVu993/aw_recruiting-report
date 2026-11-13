export interface ResignRecord {
  id: number;
  er_empid: string;
  er_name: string;
  er_indate: string;
  er_resigndate: string;
  er_numberid: string;
  er_deptid: string;
  er_deptname: string;
  er_joblevel: string;
  er_age: number;
  er_seniority: string | number;
  er_bus: string;
  er_gender: string;
  er_hometown: string;
  er_reason: string;
  er_type_resign: string;
  er_note: string;
  loc: string;
}

export interface ReasonBreakdownItem {
  reason: string;
  count: number;
  pct: number;
}
