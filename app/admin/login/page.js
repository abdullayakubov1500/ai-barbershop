"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import PageHero from "../../../components/PageHero";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Не войти.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <>
      <SiteHeader />
      <PageHero crumbs="Главная / Журнал" title="Вход в журнал" />
      <main className="login sheet">
        <form className="form-grid" onSubmit={submit}>
          <label>
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            Войти
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
