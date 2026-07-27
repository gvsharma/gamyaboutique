"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitProductInterest } from "@/lib/api/services/product.service";

const schema = z.object({
  customerName: z.string().min(2, "Enter your name").max(200),
  phone: z.string().min(10, "Enter a valid phone number").max(30),
  whatsapp: z.string().max(30).optional(),
  message: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function InterestForm({
  productId,
  productName,
  selectedSize,
  selectedColor,
}: {
  productId: string;
  productName: string;
  selectedSize?: string | null;
  selectedColor?: string | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      submitProductInterest({
        productId,
        customerName: values.customerName,
        phone: values.phone,
        whatsapp: values.whatsapp || undefined,
        size: selectedSize ?? undefined,
        color: selectedColor ?? undefined,
        message: values.message,
      }),
    onSuccess: () => reset(),
  });

  return (
    <div className="mt-10 rounded-2xl border border-charcoal/8 bg-ivory/40 p-6">
      <p className="text-eyebrow">Express your interest</p>
      <p className="mt-1 text-sm text-stone">
        We&apos;ll reach out about <span className="font-medium text-charcoal">{productName}</span>
        {selectedSize ? ` in size ${selectedSize}` : ""}
        {selectedColor ? `, color ${selectedColor}` : ""}.
      </p>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Input label="Your name" error={errors.customerName?.message} {...register("customerName")} />
        <Input label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
        <Input label="WhatsApp (if different)" type="tel" {...register("whatsapp")} />
        <Textarea label="Message (optional)" rows={3} {...register("message")} />
        <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
          {mutation.isPending ? "Sending…" : "Submit interest"}
        </Button>
        {mutation.isSuccess && (
          <p className="text-sm text-success">Thank you — we will be in touch shortly.</p>
        )}
        {mutation.isError && (
          <p className="text-sm text-red-600/80">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
}
