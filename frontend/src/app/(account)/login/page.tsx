"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { login, fetchMe } from "@/lib/api/services/auth.service";
import { tokenStorage } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const token = await login(values.email, values.password);
      tokenStorage.set(token.accessToken);
      const user = await fetchMe();
      setUser(user);
      router.push(ROUTES.home);
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-burgundy">Sign in</h1>
      <p className="mt-2 text-sm text-stone">
        Staff and customer accounts. Dev: <code className="text-xs">admin@gamyacouture.com</code> /{" "}
        <code className="text-xs">Admin@123</code>
      </p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-xs uppercase tracking-wider text-stone">Email</label>
          <input
            {...register("email")}
            type="email"
            className="mt-1 w-full rounded-sm border border-burgundy/20 bg-white px-3 py-2.5 text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-burgundy">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-stone">Password</label>
          <input
            {...register("password")}
            type="password"
            className="mt-1 w-full rounded-sm border border-burgundy/20 bg-white px-3 py-2.5 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-burgundy">{errors.password.message}</p>
          )}
        </div>
        {errors.root && (
          <p className="text-sm text-burgundy">{errors.root.message}</p>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
