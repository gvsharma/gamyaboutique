"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { importBulkProducts, previewBulkProductImport } from "@/lib/api/services/admin.service";
import { spreadsheetFileToCsvFile } from "@/lib/spreadsheet-to-csv";
import { formatPrice } from "@/lib/utils";
import type { BulkProductPreviewResponse, BulkProductRowPreview } from "@/types/admin";

export default function AdminProductImportPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<BulkProductPreviewResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const validRows = useMemo(
    () => preview?.rows.filter((row) => row.valid) ?? [],
    [preview],
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setImportSummary(null);
    setPreview(null);
    setSelectedRows(new Set());
    setFileName(file.name);
    setLoadingPreview(true);

    try {
      const csvFile = await spreadsheetFileToCsvFile(file);
      const result = await previewBulkProductImport(csvFile);
      setPreview(result);
      setSelectedRows(new Set(result.rows.filter((row) => row.valid).map((row) => row.rowNumber)));
      toast(`Parsed ${result.totalRows} rows (${result.validRows} valid)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse file";
      setError(message);
      toast(message, "error");
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleRow = (rowNumber: number, valid: boolean) => {
    if (!valid) return;
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  };

  const toggleAllValid = () => {
    if (!preview) return;
    const validNumbers = preview.rows.filter((row) => row.valid).map((row) => row.rowNumber);
    setSelectedRows((current) =>
      current.size === validNumbers.length ? new Set() : new Set(validNumbers),
    );
  };

  const handleImport = async () => {
    if (!preview) return;

    const products = preview.rows
      .filter((row) => row.valid && selectedRows.has(row.rowNumber) && row.product)
      .map((row) => row.product!);

    if (products.length === 0) {
      setError("Select at least one valid row to import.");
      return;
    }

    setImporting(true);
    setError(null);
    setImportSummary(null);

    try {
      const result = await importBulkProducts(products);
      setImportSummary(
        `Imported ${result.created} of ${result.requested} products` +
          (result.failed > 0 ? ` (${result.failed} failed)` : ""),
      );
      toast(`Imported ${result.created} products`);
      if (result.failed > 0) {
        setError(
          result.failures.map((failure) => `${failure.sku}: ${failure.message}`).join("\n"),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      setError(message);
      toast(message, "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-eyebrow">Catalog</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">
            Import products (CSV or Excel)
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Upload a spreadsheet with name, product type, description, and price. SKUs are generated
            automatically. Add photos and videos later by editing each product.
          </p>
        </div>
        <Link href={ROUTES.admin.products}>
          <Button variant="outline">Back to products</Button>
        </Link>
      </div>

      <div className="admin-card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loadingPreview || importing}
          >
            {loadingPreview ? "Parsing file…" : "Choose CSV or Excel file"}
          </Button>
          <a
            href="/templates/products-import-simple-template.csv"
            download
            className="link-subtle text-sm"
          >
            Simple template (4 columns)
          </a>
          <a
            href="/templates/products-import-template.csv"
            download
            className="link-subtle text-sm"
          >
            Full template
          </a>
          {fileName && <span className="text-sm text-stone">{fileName}</span>}
        </div>

        <div className="rounded-xl bg-ivory/80 p-4 text-sm text-stone">
          <p className="font-medium text-charcoal">Minimum columns</p>
          <p className="mt-1 font-mono text-xs">name, product_type, price</p>
          <p className="mt-1">Optional: <span className="font-mono text-xs">description</span></p>
          <p className="mt-3 font-medium text-charcoal">Product type values</p>
          <p className="mt-1 font-mono text-xs">
            sarees, kurtas, lehengas, blouses, girls-kurtas, girls-lehengas
          </p>
          <p className="mt-3 font-medium text-charcoal">Advanced optional columns</p>
          <p className="mt-1 font-mono text-xs">
            sku, category_slug, compare_at_price, status, fabric_slug, print_slug, sizes, colors,
            image_urls, video_url
          </p>
          <p className="mt-3">
            Excel (.xlsx) is converted automatically. After import, open each product to upload
            images and video.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-maroon/20 bg-maroon/5 p-4 text-sm text-maroon whitespace-pre-wrap">
          {error}
        </div>
      )}

      {importSummary && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          {importSummary}
        </div>
      )}

      {preview && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-stone">
              {preview.validRows} valid · {preview.invalidRows} with errors · {selectedRows.size}{" "}
              selected
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={toggleAllValid}>
                {selectedRows.size === validRows.length ? "Deselect all" : "Select all valid"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleImport}
                disabled={importing || selectedRows.size === 0}
              >
                {importing ? "Importing…" : `Import ${selectedRows.size} products`}
              </Button>
            </div>
          </div>

          <div className="admin-card overflow-x-auto !p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
                <tr>
                  <th className="px-4 py-3">Import</th>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Validation</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <PreviewRow
                    key={row.rowNumber}
                    row={row}
                    selected={selectedRows.has(row.rowNumber)}
                    onToggle={() => toggleRow(row.rowNumber, row.valid)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewRow({
  row,
  selected,
  onToggle,
}: {
  row: BulkProductRowPreview;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className="border-b border-charcoal/5 align-top last:border-0">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          disabled={!row.valid}
          onChange={onToggle}
          aria-label={`Import row ${row.rowNumber}`}
        />
      </td>
      <td className="px-4 py-3 text-stone">{row.rowNumber}</td>
      <td className="px-4 py-3 font-mono text-xs">{row.sku || "—"}</td>
      <td className="px-4 py-3 text-charcoal">{row.name || "—"}</td>
      <td className="px-4 py-3 text-stone">{row.categorySlug || "—"}</td>
      <td className="px-4 py-3 text-maroon">
        {row.price != null ? formatPrice(row.price, row.currency) : "—"}
      </td>
      <td className="px-4 py-3">
        <span className="chip">{row.status}</span>
      </td>
      <td className="px-4 py-3">
        {row.valid ? (
          <span className="text-emerald-700">Ready</span>
        ) : (
          <ul className="list-disc space-y-1 pl-4 text-maroon">
            {row.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </td>
    </tr>
  );
}
