"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { completeAuthSession, login } from "@/lib/api/services/auth.service";
import { isAdmin } from "@/lib/auth/admin";
import { queryKeys } from "@/lib/query/query-keys";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? ROUTES.home;
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { rememberMe: false } });

  const onSubmit = async (values: FormValues) => {
    try {
      await login({
        identifier: values.identifier.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      });
      const user = await completeAuthSession();
      setUser(user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      router.push(isAdmin(user) ? ROUTES.admin.home : returnUrl);
    } catch {
      setError("root", { message: "Invalid credentials. Please try again." });
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle={
        <>
          New here? <AuthLink href={ROUTES.register}>Create an account</AuthLink>
        </>
      }
    >
      {process.env.NODE_ENV === "development" && (
        <p className="mb-6 rounded-xl bg-ivory/80 px-4 py-3 text-xs text-stone">
          Dev admin: <code>admin@gamyacouture.com</code> / <code>Admin@123</code>
        </p>
      )}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email or phone"
          type="text"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register("identifier")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="h-4 w-4 rounded border-charcoal/20 text-maroon focus:ring-maroon/20"
            />
            Remember me
          </label>
          <AuthLink href={ROUTES.forgotPassword}>Forgot password?</AuthLink>
        </div>
        {errors.root && <p className="text-sm text-red-600/80">{errors.root.message}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
