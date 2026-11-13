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
