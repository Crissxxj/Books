"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const res = await fetch("/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "No se pudo crear la cuenta.");
      setCargando(false);
      return;
    }

    const loginRes = await signIn("credentials", { email, password, redirect: false });
    setCargando(false);

    if (loginRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display text-3xl mb-8 text-center">Crear cuenta</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full border border-ink/20 rounded-full py-3 flex items-center justify-center gap-2 font-medium hover:bg-paper2 transition-colors"
      >
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 my-6 text-ink/40 text-sm">
        <div className="flex-1 h-px bg-ink/10" />
        o con tu correo
        <div className="flex-1 h-px bg-ink/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-3 bg-paper focus:outline-none focus:border-wine"
        />
        <input
          type="email"
          required
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-3 bg-paper focus:outline-none focus:border-wine"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-3 bg-paper focus:outline-none focus:border-wine"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-wine text-paper rounded-full py-3 font-medium hover:bg-wine-dark transition-colors disabled:opacity-60"
        >
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        ¿Ya tienes cuenta? <Link href="/login" className="text-wine underline">Entra aquí</Link>
      </p>
    </div>
  );
}
