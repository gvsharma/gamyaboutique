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
        <h1 className="font-display text-3xl text-burgundy">Categories</h1>
        <p className="text-sm text-stone">Catalog taxonomy stored in RDS</p>
      </div>

      <CategoryForm categories={data ?? []} onCreated={() => refetch()} />

      {isLoading && <p className="text-sm text-stone">Loading categories…</p>}
      {isError && <p className="text-sm text-burgundy">Failed to load categories.</p>}

      <div className="overflow-x-auto rounded-sm border border-burgundy/10 bg-cream">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-burgundy/10 text-xs uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Order</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((cat) => {
              const parent = data.find((p) => p.id === cat.parentId);
              return (
                <tr key={cat.id} className="border-b border-burgundy/5">
                  <td className="px-4 py-3">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3">{parent?.name ?? "—"}</td>
                  <td className="px-4 py-3">{cat.displayOrder}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
