"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitConsultation } from "@/lib/api/services/consultation.service";

const OCCASIONS = [
  { value: "", label: "Select occasion (optional)" },
  { value: "wedding", label: "Wedding / bridal" },
  { value: "festive", label: "Festive celebration" },
  { value: "party", label: "Party / reception" },
  { value: "casual", label: "Everyday / casual" },
  { value: "custom", label: "Custom stitching" },
] as const;

const BUDGET_BANDS = [
  { value: "", label: "Budget range (optional)" },
  { value: "under-15000", label: "Under ₹15,000" },
  { value: "15000-30000", label: "₹15,000 – ₹30,000" },
  { value: "30000-50000", label: "₹30,000 – ₹50,000" },
  { value: "above-50000", label: "Above ₹50,000" },
] as const;

const TIMELINES = [
  { value: "", label: "When do you need it? (optional)" },
  { value: "urgent", label: "Within 2 weeks" },
  { value: "month", label: "Within a month" },
  { value: "flexible", label: "Flexible / browsing" },
] as const;

const schema = z.object({
  name: z.string().min(2, "Enter your name").max(200),
  email: z.string().email("Enter a valid email").max(255).optional().or(z.literal("")),
  phone: z.string().min(10, "Enter a valid phone number").max(30),
  occasion: z.string().optional(),
  budgetBand: z.string().optional(),
  timeline: z.string().optional(),
  serviceType: z.string().optional(),
  message: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ConsultationFormProps {
  productId?: string;
  defaultServiceType?: string;
  title?: string;
  description?: string;
}

export function ConsultationForm({
  productId,
  defaultServiceType,
  title = "Book a consultation",
  description = "Share a few details — our stylist will reply on WhatsApp within 24 hours.",
}: ConsultationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { serviceType: defaultServiceType ?? "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      submitConsultation({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone,
        occasion: values.occasion || undefined,
        budgetBand: values.budgetBand || undefined,
        timeline: values.timeline || undefined,
        serviceType: values.serviceType || undefined,
        message: values.message || undefined,
        productId,
      }),
    onSuccess: () => reset(),
  });

  return (
    <div className="rounded-2xl border border-charcoal/8 bg-pearl p-6 sm:p-8">
      <p className="text-eyebrow text-maroon">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-stone">{description}</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Input label="Your name" error={errors.name?.message} {...register("name")} />
        <Input label="Phone / WhatsApp" type="tel" error={errors.phone?.message} {...register("phone")} />
        <Input label="Email (optional)" type="email" error={errors.email?.message} {...register("email")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-eyebrow text-stone">Occasion</label>
            <select className="admin-input" {...register("occasion")}>
              {OCCASIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-eyebrow text-stone">Budget</label>
            <select className="admin-input" {...register("budgetBand")}>
              {BUDGET_BANDS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-eyebrow text-stone">Timeline</label>
          <select className="admin-input" {...register("timeline")}>
            {TIMELINES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <input type="hidden" {...register("serviceType")} />
        <Textarea
          label="Tell us what you're looking for"
          rows={4}
          placeholder="Occasion, fabric preferences, custom measurements…"
          {...register("message")}
        />
        <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
          {mutation.isPending ? "Sending…" : "Request consultation"}
        </Button>
        {mutation.isSuccess && (
          <p className="text-sm text-success">
            Thank you — our stylist will reach out on WhatsApp shortly.
          </p>
        )}
        {mutation.isError && (
          <p className="text-sm text-maroon">Something went wrong. Please try again or message us on WhatsApp.</p>
        )}
      </form>
    </div>
  );
}
