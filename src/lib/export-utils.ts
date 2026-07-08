export function buildCsvContent(rows: Array<Array<string | number>>): string {
  const escape = (value: string | number) => {
    const s = String(value ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  return rows.map((row) => row.map(escape).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  if (typeof window === "undefined") return;
  const content = buildCsvContent(rows);
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
