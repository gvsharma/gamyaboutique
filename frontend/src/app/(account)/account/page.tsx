"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { changePassword, fetchCustomerProfile, updateCustomerProfile } from "@/lib/api/services/customer.service";
import { logout } from "@/lib/api/services/auth.service";
import { PASSWORD_HINT, PASSWORD_REGEX } from "@/lib/validation/password";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function AccountPage() {
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.logout);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["customerProfile"],
    queryFn: fetchCustomerProfile,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCustomerProfile({
        firstName: firstName || profile?.firstName,
        lastName: lastName || profile?.lastName,
        email: email || profile?.email || undefined,
        phone: phone || profile?.phone || undefined,
      }),
    onSuccess: () => {
      setMessage("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setMessage("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    },
  });

  if (isLoading || !profile) {
    return <p className="text-stone">Loading profile…</p>;
  }

  const handleLogout = async () => {
    await logout();
    clearUser();
    clearWishlist();
    router.push(ROUTES.home);
  };

  return (
    <div className="space-y-10">
      <SectionHeader
        align="left"
        eyebrow="Account"
        title="My profile"
        description={profile.email ?? profile.phone ?? undefined}
      />

      <form
        className="surface-card space-y-5 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
      >
        <h2 className="font-display text-xl text-charcoal">Profile details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" disabled={updateMutation.isPending}>
          Save profile
        </Button>
      </form>

      <form
        className="surface-card space-y-5 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (!PASSWORD_REGEX.test(newPassword)) {
            setMessage(PASSWORD_HINT);
            return;
          }
          passwordMutation.mutate();
        }}
      >
        <h2 className="font-display text-xl text-charcoal">Change password</h2>
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button type="submit" variant="outline" disabled={passwordMutation.isPending}>
          Update password
        </Button>
      </form>

      {message && <p className="text-sm text-stone">{message}</p>}

      <Button variant="outline" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  );
}
