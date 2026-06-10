"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <form className="mt-6 space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <input type="hidden" value={productName} readOnly className="hidden" />
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Input label="Phone" type="tel" error={errors.phone?.message} {...register("phone")} />
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
  );
}
