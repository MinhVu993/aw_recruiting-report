export function formatNextEmpno(lastEmpno?: string | null): string {
  if (!lastEmpno || !/^\d+$/.test(lastEmpno.trim())) {
    return "000001";
  }
  const nextNum = parseInt(lastEmpno.trim(), 10) + 1;
  return String(nextNum).padStart(6, "0");
}
