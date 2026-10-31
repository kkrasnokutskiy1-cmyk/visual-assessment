"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";

function LoginForm({ register }: { register: boolean }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (register) {
        const response = await fetch("/api/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
        if (!response.ok) { const body = await response.json(); throw new Error(body.error || "Не удалось создать аккаунт."); }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Не удалось войти. Проверьте email и пароль.");
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/assessment");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Не удалось подключиться."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto w-full max-w-[var(--reading-max)] px-6 py-12">
    <h1 className="text-display">{status === "authenticated" ? "Аккаунт" : register ? "Создать аккаунт" : "Войти"}</h1>
    {status === "loading" ? <p className="mt-6 text-muted-foreground">Загрузка…</p> : session ? <div className="mt-6 space-y-4"><p>{session.user?.email}</p><Button onClick={() => signOut({ callbackUrl: "/" })}>Выйти</Button></div> :
    <form className="mt-8 flex max-w-sm flex-col gap-4" onSubmit={submit}>
      <label className="flex flex-col gap-2 text-body">Email<input className="rounded-md border border-border bg-background px-3 py-2" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label className="flex flex-col gap-2 text-body">Пароль<input className="rounded-md border border-border bg-background px-3 py-2" autoComplete={register ? "new-password" : "current-password"} type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={register ? 12 : undefined} required /></label>
      {register && <p className="text-caption text-muted-foreground">Не менее 12 символов. Восстановление пароля пока не предусмотрено.</p>}
      {error && <p role="alert" className="text-body text-destructive">{error}</p>}
      <Button disabled={busy} type="submit">{busy ? "Подождите…" : register ? "Создать аккаунт" : "Войти"}</Button>
      <button type="button" className="text-left text-body underline" onClick={() => router.push(`${register ? "/login" : "/register"}${window.location.search}`)}>{register ? "Уже есть аккаунт? Войти" : "Создать аккаунт"}</button>
    </form>}
  </main>;
}
export function AuthForm({ register = false }: { register?: boolean }) { return <SessionProvider><LoginForm register={register} /></SessionProvider>; }
