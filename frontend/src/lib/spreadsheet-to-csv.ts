function escapeCsvCell(value: unknown): string {
  if (value == null) {
    return "";
  }
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowsToCsv(rows: unknown[][]): string {
  return rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
}

/** Converts the first worksheet of an Excel file into a CSV File for bulk import. */
export async function spreadsheetFileToCsvFile(file: File): Promise<File> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) {
    return file;
  }
  if (!lower.endsWith(".xlsx")) {
    throw new Error("Use a .csv or .xlsx file");
  }

  const readXlsxFile = (await import("read-excel-file/browser")).default;
  const sheets = await readXlsxFile(file);
  const rows = sheets[0]?.data;
  if (!rows?.length) {
    throw new Error("Spreadsheet is empty");
  }
  const csv = rowsToCsv(rows);
  if (!csv.trim()) {
    throw new Error("Spreadsheet is empty");
  }
  const baseName = file.name.replace(/\.xlsx$/i, "");
  return new File([csv], `${baseName}.csv`, { type: "text/csv" });
}
