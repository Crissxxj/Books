"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FavoriteButton({
  libroId,
  esFavoritoInicial
}: {
  libroId: string;
  esFavoritoInicial: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [esFavorito, setEsFavorito] = useState(esFavoritoInicial);
  const [cargando, setCargando] = useState(false);

  async function alternar() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setCargando(true);
    const metodo = esFavorito ? "DELETE" : "POST";
    const res = await fetch("/api/favoritos", {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libroId })
    });
    if (res.ok) setEsFavorito(!esFavorito);
    setCargando(false);
  }

  return (
    <button
      onClick={alternar}
      disabled={cargando}
      aria-pressed={esFavorito}
      aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
        esFavorito
          ? "bg-wine border-wine text-paper"
          : "bg-paper border-ink/20 text-ink/70 hover:border-wine hover:text-wine"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={esFavorito ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-6.7-4.3-9.4-8.1C.8 10.1 1.4 6.6 4.3 5c2.3-1.3 5-.6 6.6 1.3C12.5 4.4 15.2 3.7 17.5 5c2.9 1.6 3.5 5.1 1.7 7.9C18.7 16.7 12 21 12 21z" />
      </svg>
    </button>
  );
}
