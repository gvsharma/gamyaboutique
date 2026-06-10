"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { completeAuthSession, register as registerAccount } from "@/lib/api/services/auth.service";
import { PASSWORD_HINT, PASSWORD_REGEX } from "@/lib/validation/password";
import { queryKeys } from "@/lib/query/query-keys";
import { useAuthStore } from "@/stores/auth-store";

const schema = z
  .object({
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_HINT),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  })
  .refine((d) => (d.email && d.email.length > 0) || (d.phone && d.phone.length > 0), {
    message: "Email or phone is required",
    path: ["email"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerAccount({
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      const user = await completeAuthSession();
      setUser(user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      router.push(ROUTES.home);
    } catch {
      setError("root", { message: "Registration failed. Email or phone may already be in use." });
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        <>
          Already have an account? <AuthLink href={ROUTES.login}>Sign in</AuthLink>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="First name" error={errors.firstName?.message} {...register("firstName")} />
          <Input label="Last name" error={errors.lastName?.message} {...register("lastName")} />
        </div>
        <Input label="Email (optional)" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Phone (optional)" type="tel" {...register("phone")} />
        <div>
          <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
          <p className="mt-2 text-xs text-stone">{PASSWORD_HINT}</p>
        </div>
        {errors.root && <p className="text-sm text-red-600/80">{errors.root.message}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
