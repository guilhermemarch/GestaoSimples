export function parseCsv(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

export function csvRowsToObjects(
  rows: string[][],
): { headers: string[]; records: Record<string, string>[] } {
  if (rows.length === 0) {
    return { headers: [], records: [] };
  }
  const headers = rows[0].map((h) => h.toLowerCase().trim());
  const records = rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i]?.trim() ?? "";
    });
    return obj;
  });
  return { headers, records };
}
