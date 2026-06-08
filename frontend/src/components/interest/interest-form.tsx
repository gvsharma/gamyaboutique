"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { submitInterest } from "@/lib/api/services/product.service";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number").max(30),
  message: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function InterestForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => submitInterest(productId, values),
    onSuccess: () => reset(),
  });

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      <input type="hidden" value={productName} readOnly className="hidden" />
      <div>
        <label className="text-xs uppercase tracking-wider text-stone">Email</label>
        <input
          {...register("email")}
          type="email"
          className="mt-1 w-full rounded-sm border border-burgundy/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-burgundy/30"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-burgundy">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-stone">Phone</label>
        <input
          {...register("phone")}
          type="tel"
          className="mt-1 w-full rounded-sm border border-burgundy/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-burgundy/30"
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-burgundy">{errors.phone.message}</p>
        )}
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-stone">Message (optional)</label>
        <textarea
          {...register("message")}
          rows={3}
          className="mt-1 w-full resize-none rounded-sm border border-burgundy/20 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-burgundy/30"
          placeholder="Size, occasion, preferred colours…"
        />
      </div>
      <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
        {mutation.isPending ? "Sending…" : "Submit interest"}
      </Button>
      {mutation.isSuccess && (
        <p className="text-sm text-burgundy">Thank you — we will be in touch shortly.</p>
      )}
      {mutation.isError && (
        <p className="text-sm text-burgundy">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
