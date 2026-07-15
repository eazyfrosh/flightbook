"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, User2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { nationalities } from "@/lib/data/nationalities";
import { passengerSchema } from "@/lib/validation/passenger";
import { z } from "zod";
import type { PaymentMethodType, SavedPaymentMethod } from "@/types";

const profileSchema = z.object({
  displayName: z.string().min(2, "Enter your name"),
  phone: z.string().optional(),
  nationality: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const savedPassengerSchema = passengerSchema.omit({ id: true, type: true });
type SavedPassengerValues = z.infer<typeof savedPassengerSchema>;

export default function ProfilePage() {
  const { user, profile, loading, updateUserProfile, addSavedPassenger, removeSavedPassenger, addSavedPaymentMethod, removeSavedPaymentMethod } = useAuth();
  const router = useRouter();
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentMethodType>("credit_card");

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login?next=/dashboard/profile");
  }, [loading, user, router]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile) {
      resetProfile({ displayName: profile.displayName, phone: profile.phone ?? "", nationality: profile.nationality ?? "" });
    }
  }, [profile, resetProfile]);

  const {
    register: registerPassenger,
    handleSubmit: handlePassengerSubmit,
    reset: resetPassengerForm,
    formState: { errors: passengerErrors },
  } = useForm<SavedPassengerValues>({ resolver: zodResolver(savedPassengerSchema) });

  if (loading || !user) return null;

  async function onProfileSubmit(values: ProfileValues) {
    await updateUserProfile(values);
    toast.success("Profile updated");
  }

  async function onPassengerSubmit(values: SavedPassengerValues) {
    await addSavedPassenger({ ...values, id: `sp-${Date.now()}`, type: "adult" });
    toast.success("Passenger saved");
    resetPassengerForm({ firstName: "", lastName: "", dateOfBirth: "", nationality: "", passportNumber: "", gender: "male", email: "", phone: "" });
    setShowPassengerForm(false);
  }

  function onAddPaymentMethod(formData: FormData) {
    const label = String(formData.get("label") || "");
    const last4 = String(formData.get("last4") || "");
    const method: SavedPaymentMethod = {
      id: `pm-${Date.now()}`,
      type: paymentType,
      label: label || (paymentType === "paypal" ? "PayPal account" : paymentType === "apple_pay" ? "Apple Pay" : paymentType === "google_pay" ? "Google Pay" : "Card"),
      last4: last4 || undefined,
    };
    addSavedPaymentMethod(method);
    toast.success("Payment method saved (mock)");
    setShowPaymentForm(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold">Your profile</h1>

      <Card className="mb-6">
        <CardHeader className="flex items-center gap-2 pb-2">
          <User2 size={17} className="text-brand-600 dark:text-brand-400" />
          <h2 className="font-semibold">Account details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input {...registerProfile("displayName")} />
              <FieldError>{profileErrors.displayName?.message}</FieldError>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled className="opacity-60" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input {...registerProfile("phone")} placeholder="+1 555 000 1234" />
              </div>
              <div>
                <Label>Nationality</Label>
                <Select {...registerProfile("nationality")} defaultValue="">
                  <option value="">Select</option>
                  {nationalities.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </div>
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex items-center justify-between pb-2">
          <h2 className="font-semibold">Saved passengers</h2>
          <Button size="sm" variant="outline" onClick={() => setShowPassengerForm((s) => !s)}>
            <Plus size={14} /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {profile?.savedPassengers.length === 0 && !showPassengerForm && (
            <p className="text-sm text-foreground/50">No saved passengers yet.</p>
          )}
          <div className="space-y-2">
            {profile?.savedPassengers.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-black/[0.02] p-3 text-sm dark:bg-white/5">
                <span>{p.firstName} {p.lastName} <span className="text-foreground/40">· {p.nationality}</span></span>
                <button onClick={() => removeSavedPassenger(p.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {showPassengerForm && (
            <form onSubmit={handlePassengerSubmit(onPassengerSubmit)} className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-black/8 p-4 sm:grid-cols-2 dark:border-white/10">
              <div>
                <Input {...registerPassenger("firstName")} placeholder="First name" />
                <FieldError>{passengerErrors.firstName?.message}</FieldError>
              </div>
              <div>
                <Input {...registerPassenger("lastName")} placeholder="Last name" />
                <FieldError>{passengerErrors.lastName?.message}</FieldError>
              </div>
              <div>
                <Input type="date" {...registerPassenger("dateOfBirth")} />
                <FieldError>{passengerErrors.dateOfBirth?.message}</FieldError>
              </div>
              <div>
                <Select {...registerPassenger("nationality")} defaultValue="">
                  <option value="" disabled>Nationality</option>
                  {nationalities.map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
                <FieldError>{passengerErrors.nationality?.message}</FieldError>
              </div>
              <div>
                <Input {...registerPassenger("passportNumber")} placeholder="Passport number" />
                <FieldError>{passengerErrors.passportNumber?.message}</FieldError>
              </div>
              <div>
                <Select {...registerPassenger("gender")}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <Input type="email" {...registerPassenger("email")} placeholder="Email" />
                <FieldError>{passengerErrors.email?.message}</FieldError>
              </div>
              <div>
                <Input {...registerPassenger("phone")} placeholder="Phone" />
                <FieldError>{passengerErrors.phone?.message}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" size="sm">Save passenger</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <h2 className="font-semibold">Saved payment methods</h2>
          <Button size="sm" variant="outline" onClick={() => setShowPaymentForm((s) => !s)}>
            <Plus size={14} /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {profile?.savedPaymentMethods.length === 0 && !showPaymentForm && (
            <p className="text-sm text-foreground/50">No saved payment methods yet (mock only).</p>
          )}
          <div className="space-y-2">
            {profile?.savedPaymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between rounded-xl bg-black/[0.02] p-3 text-sm dark:bg-white/5">
                <span className="flex items-center gap-2">
                  <CreditCard size={15} className="text-foreground/50" />
                  {pm.label} {pm.last4 && <span className="text-foreground/40">•••• {pm.last4}</span>}
                </span>
                <button onClick={() => removeSavedPaymentMethod(pm.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {showPaymentForm && (
            <form action={onAddPaymentMethod} className="mt-4 space-y-3 rounded-xl border border-black/8 p-4 dark:border-white/10">
              <Select value={paymentType} onChange={(e) => setPaymentType(e.target.value as PaymentMethodType)}>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="apple_pay">Apple Pay</option>
                <option value="google_pay">Google Pay</option>
              </Select>
              <Input name="label" placeholder="Label (e.g. Personal Visa)" />
              {(paymentType === "credit_card" || paymentType === "debit_card") && (
                <Input name="last4" placeholder="Last 4 digits" maxLength={4} />
              )}
              <p className="text-xs text-foreground/40">Mock data only — no real card details are stored.</p>
              <Button type="submit" size="sm">Save payment method</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
