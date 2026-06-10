"use client";

import { useState } from "react";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { forgotPassword } from "@/lib/api/services/auth.service";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(identifier.trim());
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your email or phone. We'll send reset instructions if an account exists."
    >
      {sent ? (
        <div className="rounded-xl bg-ivory/80 p-5 text-sm text-stone">
          If an account exists, reset instructions have been sent.
          <div className="mt-4">
            <AuthLink href={ROUTES.login}>Back to sign in</AuthLink>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email or phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Sending…" : "Send reset link / OTP"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
