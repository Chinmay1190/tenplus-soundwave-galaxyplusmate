import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowRight, Check, Eye, EyeOff, Headphones, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [{ title: "Sign in — PULSE" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: search.redirect ?? "/account" });
  }, [user, loading, navigate, search.redirect]);

  const validate = (): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
    if (mode === "forgot") return null;
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (mode === "signup" && name.trim().length < 2) return "Tell us your name.";
    return null;
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're in.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for a reset link.");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  const titles: Record<Mode, { tag: string; heading: string; sub: string }> = {
    signin: {
      tag: "Sign in",
      heading: "Welcome back.",
      sub: "Sign in for faster checkout, order tracking, returns and reports.",
    },
    signup: {
      tag: "Create account",
      heading: "Join the signal.",
      sub: "Your PULSE account in under a minute. Free returns. Lifetime support.",
    },
    forgot: {
      tag: "Reset",
      heading: "Forgot your password?",
      sub: "Drop us your email — we'll send a secure reset link straight to your inbox.",
    },
  };
  const t = titles[mode];

  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_1fr]">
      {/* LEFT — Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-border/60 bg-surface lg:block">
        <div className="absolute inset-0 dot-grid opacity-40" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-accent/60 bg-accent/10 text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              PULSE<span className="text-accent">.</span>
            </span>
          </Link>

          <div className="max-w-md">
            <div className="mono text-accent">— Sound, by membership</div>
            <h2 className="mt-4 font-display text-5xl font-bold leading-[0.95] tracking-tight xl:text-6xl">
              An account<br />
              <span className="shimmer-text">tuned</span> to you.
            </h2>
            <p className="mt-6 text-base text-muted-foreground">
              Saved addresses. One-tap reorders. Live tracking. Personal analytics across
              every PULSE order, return and warranty claim.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                [Sparkles, "Personal reports", "Daily, monthly & quarterly views of your spend."],
                [ShieldCheck, "2-year warranty", "Auto-registered to every PULSE you buy."],
                [Headphones, "Priority care", "Skip the line. Real humans, in 60 seconds."],
              ].map(([Ico, tt, dd]) => {
                const Icon = Ico as typeof Sparkles;
                return (
                  <li key={tt as string} className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-2 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{tt as string}</div>
                      <div className="text-sm text-muted-foreground">{dd as string}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mono flex items-center justify-between text-[10px] text-muted-foreground">
            <span>© PULSE Audio · 2026</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Encrypted end-to-end
            </span>
          </div>
        </div>
      </aside>

      {/* RIGHT — Form panel */}
      <main className="relative flex items-center justify-center px-4 py-16 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-40 lg:hidden"
          style={{
            background:
              "radial-gradient(800px 400px at 50% 0%, oklch(0.65 0.24 25 / 0.15), transparent 60%)",
          }}
        />
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mono mb-8 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent lg:hidden"
          >
            ← Back to PULSE
          </Link>

          <div className="mono text-accent">— {t.tag}</div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t.heading}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{t.sub}</p>

          {/* Tab switch */}
          {mode !== "forgot" && (
            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1 text-xs">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`mono rounded-full px-4 py-1.5 transition-all ${
                    mode === m
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create"}
                </button>
              ))}
            </div>
          )}

          {mode !== "forgot" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-lg disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C41.8 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <Field
                label="Full name"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Alex Rivera"
                autoComplete="name"
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              icon={Mail}
              required
            />
            {mode !== "forgot" && (
              <Field
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            )}

            {mode === "signin" && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="mono text-[10px] text-muted-foreground hover:text-accent"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-magnetic group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {mode === "signup" && (
            <ul className="mt-5 grid gap-1.5 text-[11px] text-muted-foreground">
              {["Free 30-day returns on every order", "2-year warranty on all PULSE gear", "Personal sales & returns reports"].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-accent" /> {p}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "forgot" ? (
              <>Remembered it?{" "}
                <button onClick={() => setMode("signin")} className="font-semibold text-foreground hover:text-accent">Sign in</button>
              </>
            ) : mode === "signin" ? (
              <>New to PULSE?{" "}
                <button onClick={() => setMode("signup")} className="font-semibold text-foreground hover:text-accent">Create an account</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="font-semibold text-foreground hover:text-accent">Sign in</button>
              </>
            )}
          </div>

          <p className="mono mt-8 text-center text-[10px] text-muted-foreground/70">
            By continuing you agree to PULSE's Terms & Privacy.
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  label, type, value, onChange, placeholder, required, autoComplete, icon: Icon, rightSlot,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
  autoComplete?: string;
  icon?: typeof Mail;
  rightSlot?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mono mb-1.5 block text-[10px] text-muted-foreground">{label}</span>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-border bg-card py-3 text-sm placeholder:text-muted-foreground/60 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${Icon ? "pl-10" : "pl-4"} ${rightSlot ? "pr-12" : "pr-4"}`}
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </label>
  );
}
