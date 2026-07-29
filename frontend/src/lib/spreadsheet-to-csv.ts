/** Converts the first worksheet of an Excel file into a CSV File for bulk import. */
export async function spreadsheetFileToCsvFile(file: File): Promise<File> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) {
    return file;
  }
  if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
    throw new Error("Use a .csv, .xlsx, or .xls file");
  }

  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Spreadsheet has no worksheets");
  }
  const sheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
  if (!csv.trim()) {
    throw new Error("Spreadsheet is empty");
  }
  const baseName = file.name.replace(/\.(xlsx|xls)$/i, "");
  return new File([csv], `${baseName}.csv`, { type: "text/csv" });
}
