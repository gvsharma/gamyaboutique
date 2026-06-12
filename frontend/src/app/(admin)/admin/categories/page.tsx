"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoryForm } from "@/components/admin/category-form";
import { fetchAdminCategories } from "@/lib/api/services/admin.service";

export default function AdminCategoriesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchAdminCategories,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Catalog</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Categories</h1>
        <p className="mt-1 text-sm text-stone">Catalog taxonomy stored in RDS</p>
      </div>

      <CategoryForm categories={data ?? []} onCreated={() => refetch()} />

      {isLoading && <p className="text-sm text-stone">Loading categories…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load categories.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Slug</th>
              <th className="px-5 py-3.5">Parent</th>
              <th className="px-5 py-3.5">Order</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((cat) => {
              const parent = data.find((p) => p.id === cat.parentId);
              return (
                <tr key={cat.id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-5 py-3.5 text-charcoal">{cat.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-stone">{cat.slug}</td>
                  <td className="px-5 py-3.5 text-stone">{parent?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-stone">{cat.displayOrder}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
