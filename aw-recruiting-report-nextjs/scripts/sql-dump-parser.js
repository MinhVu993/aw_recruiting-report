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
      while (i < len && (valuesPart[i] === " " || valuesPart[i] === "\t" || valuesPart[i] === "\r" || valuesPart[i] === "\n")) i++;
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

      while (i < len && (valuesPart[i] === " " || valuesPart[i] === "\t" || valuesPart[i] === "\r" || valuesPart[i] === "\n")) i++;
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
