import { useState } from "react";
import { Home } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
          : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message ?? "Authentication failed. Please try again.");
      } else {
        window.location.reload();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f5] px-4 py-10 text-[#26372f]">
      <section className="w-full max-w-md rounded-[24px] border border-[#e8ebe5] bg-white p-7 shadow-[0_12px_40px_rgba(40,60,45,.08)] sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#19392f] text-[#d8e6ca]">
            <Home size={21} />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">
              Haven<span className="text-[#78a078]">.</span>
            </p>
            <p className="text-[10px] font-medium tracking-[.18em] text-[#849087]">
              CAMPUS LIVING
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "sign-up" ? "Create your manager account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-[#77837a]">
          {mode === "sign-up"
            ? "Set up an account to manage your residence."
            : "Sign in to your residence dashboard."}
        </p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          {mode === "sign-up" && (
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#526358]">Name</span>
              <input
                autoComplete="name"
                className={authInput}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#526358]">Email</span>
            <input
              autoComplete="email"
              className={authInput}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#526358]">Password</span>
            <input
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              className={authInput}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            className="w-full rounded-xl bg-[#315e49] py-3 text-sm font-bold text-white transition hover:bg-[#254d3b] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting
              ? "Please wait..."
              : mode === "sign-up"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#77837a]">
          {mode === "sign-up" ? "Already have an account?" : "New to Haven?"}{" "}
          <button
            className="font-semibold text-[#477b66] hover:underline"
            onClick={() => {
              setError("");
              setMode(mode === "sign-up" ? "sign-in" : "sign-up");
            }}
            type="button"
          >
            {mode === "sign-up" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}

const authInput =
  "w-full rounded-xl border border-[#e2e8df] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#8eae8c] focus:ring-2 focus:ring-[#8eae8c]/15";
