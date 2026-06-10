"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { addAddress, deleteAddress, fetchAddresses } from "@/lib/api/services/customer.service";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState("");

  const addMutation = useMutation({
    mutationFn: () =>
      addAddress({
        line1,
        city,
        state: state || undefined,
        postalCode: postalCode || undefined,
        isDefault: addresses.length === 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setLine1("");
      setCity("");
      setPostalCode("");
      setState("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });

  if (isLoading) return <p className="text-stone">Loading addresses…</p>;

  return (
    <div className="space-y-8">
      <SectionHeader align="left" eyebrow="Delivery" title="Saved addresses" />

      {addresses.length > 0 && (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="surface-card p-5 text-sm">
              <p className="text-charcoal">{a.line1}</p>
              <p className="mt-1 text-stone">
                {a.city}
                {a.state ? `, ${a.state}` : ""} {a.postalCode}
              </p>
              {a.isDefault && <span className="chip mt-2">Default</span>}
              <button
                type="button"
                onClick={() => deleteMutation.mutate(a.id)}
                className="link-subtle mt-3 block text-xs"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="surface-card space-y-5 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          addMutation.mutate();
        }}
      >
        <h2 className="font-display text-xl text-charcoal">Add address</h2>
        <Input label="Address line" required value={line1} onChange={(e) => setLine1(e.target.value)} />
        <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
        <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
        <Input label="Pincode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
        <Button type="submit" disabled={addMutation.isPending}>
          Add address
        </Button>
      </form>
    </div>
  );
}
