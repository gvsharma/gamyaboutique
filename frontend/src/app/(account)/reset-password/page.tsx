"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { resetPassword } from "@/lib/api/services/auth.service";
import { PASSWORD_HINT, PASSWORD_REGEX } from "@/lib/validation/password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_HINT);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword({
        token: token || undefined,
        otp: otp || undefined,
        identifier: identifier || undefined,
        newPassword: password,
      });
      router.push(ROUTES.login);
    } catch {
      setError("Reset failed. Check your token or OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Choose a new password">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {!token && (
          <>
            <Input
              label="Email or phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Input label="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </>
        )}
        <div>
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="mt-2 text-xs text-stone">{PASSWORD_HINT}</p>
        </div>
        {error && <p className="text-sm text-red-600/80">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Updating…" : "Update password"}
        </Button>
        <p className="text-center text-sm">
          <AuthLink href={ROUTES.login}>Back to sign in</AuthLink>
        </p>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container-premium py-20 text-center text-stone">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
