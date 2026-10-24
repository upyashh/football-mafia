"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

type Status = "idle" | "sending" | "sent" | "verifying" | "error";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // No emailRedirectTo: this sends a 6-digit code instead of a magic link,
    // so signing in doesn't depend on clicking a link from the same device
    // that received the email (links also break if a messaging app's link
    // preview prefetches and burns the one-time link before you click it).
    const { error } = await supabaseBrowser.auth.signInWithOtp({ email });
    setStatus(error ? "error" : "sent");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    const { data, error } = await supabaseBrowser.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error || !data.user) {
      setStatus("error");
      return;
    }

    const { data: existing } = await supabaseBrowser
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!existing) {
      await supabaseBrowser.from("profiles").insert({
        id: data.user.id,
        username: `fan_${randomSuffix()}`,
      });
      router.replace("/onboarding");
      return;
    }

    router.replace("/");
  }

  return (
    <main
      data-theme="dark"
      className="dark mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 bg-surface-page px-5 pt-16 pb-8"
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-text-primary">Sign in</h1>
        <p className="text-sm text-text-secondary">
          We&apos;ll email you a 6-digit code — no password needed.
        </p>
      </div>

      {status === "sent" || status === "verifying" ? (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <p className="text-sm text-text-primary">
            Enter the code sent to{" "}
            <span className="font-medium">{email}</span>.
          </p>
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="submit" disabled={status === "verifying"}>
            {status === "verifying" ? "Verifying…" : "Verify code"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setCode("");
            }}
            className="text-sm text-text-secondary underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        </form>
      ) : (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send sign-in code"}
          </Button>
        </form>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          That didn&apos;t work — check the code and try again.
        </p>
      )}
    </main>
  );
}
