/** Validates upload is CSV (Excel users: Save As → CSV in Excel/Google Sheets). */
export async function spreadsheetFileToCsvFile(file: File): Promise<File> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) {
    return file;
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    throw new Error(
      "Excel files are not supported directly. In Excel or Google Sheets, use File → Save As / Download → CSV, then upload the .csv file.",
    );
  }
  throw new Error("Use a .csv file (export from Excel as CSV if needed)");
}
