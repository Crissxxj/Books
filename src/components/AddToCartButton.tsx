"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddToCartButton({ libroId }: { libroId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [agregado, setAgregado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function agregar() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setCargando(true);
    const res = await fetch("/api/carrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libroId, cantidad: 1 })
    });
    if (res.ok) {
      setAgregado(true);
      router.refresh();
      setTimeout(() => setAgregado(false), 1800);
    }
    setCargando(false);
  }

  return (
    <button
      onClick={agregar}
      disabled={cargando}
      className="flex-1 bg-ink text-paper rounded-full py-3 font-medium hover:bg-wine transition-colors disabled:opacity-60"
    >
      {agregado ? "Añadido ✓" : "Añadir al carrito"}
    </button>
  );
}
