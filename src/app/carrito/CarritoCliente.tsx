"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  cantidad: number;
  libro: {
    id: string;
    titulo: string;
    autor: string;
    precio: number;
    portadaUrl: string;
    stock: number;
  };
};

export default function CarritoCliente({ itemsIniciales }: { itemsIniciales: Item[] }) {
  const [items, setItems] = useState(itemsIniciales);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const total = items.reduce((acc, it) => acc + it.cantidad * it.libro.precio, 0);

  async function actualizarCantidad(libroId: string, cantidad: number) {
    if (cantidad < 1) return;
    setItems((prev) => prev.map((it) => (it.libro.id === libroId ? { ...it, cantidad } : it)));
    await fetch("/api/carrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libroId, cantidad, reemplazar: true })
    });
    startTransition(() => router.refresh());
  }

  async function quitar(libroId: string) {
    setItems((prev) => prev.filter((it) => it.libro.id !== libroId));
    await fetch("/api/carrito", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ libroId })
    });
    startTransition(() => router.refresh());
  }

  async function irAPagar() {
    setError(null);
    setCargandoPago(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
      setCargandoPago(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-ink/60">
        Tu carrito está vacío. <Link href="/" className="text-wine underline">Ver catálogo</Link>
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-10">
      <ul className="divide-y divide-ink/10">
        {items.map((it) => (
          <li key={it.id} className="py-5 flex gap-4">
            <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0 bg-paper2">
              <Image src={it.libro.portadaUrl} alt={it.libro.titulo} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <Link href={`/libro/${it.libro.id}`} className="font-display text-lg hover:text-wine">
                {it.libro.titulo}
              </Link>
              <p className="text-sm text-ink/60">{it.libro.autor}</p>
              <p className="text-sm font-medium mt-1">${it.libro.precio.toFixed(2)}</p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-ink/20 rounded-full">
                  <button
                    onClick={() => actualizarCantidad(it.libro.id, it.cantidad - 1)}
                    className="w-8 h-8 flex items-center justify-center text-ink/70 hover:text-wine"
                    aria-label="Restar cantidad"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{it.cantidad}</span>
                  <button
                    onClick={() => actualizarCantidad(it.libro.id, it.cantidad + 1)}
                    className="w-8 h-8 flex items-center justify-center text-ink/70 hover:text-wine"
                    aria-label="Sumar cantidad"
                  >
                    +
                  </button>
                </div>
                <button onClick={() => quitar(it.libro.id)} className="text-sm text-ink/50 hover:text-wine underline">
                  Quitar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="border border-ink/10 rounded-xl p-6 h-fit sticky top-24">
        <h2 className="font-display text-xl mb-4">Resumen</h2>
        <div className="flex justify-between text-sm text-ink/70 mb-2">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4 pt-4 border-t border-ink/10">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <button
          onClick={irAPagar}
          disabled={cargandoPago}
          className="w-full mt-6 bg-wine text-paper rounded-full py-3 font-medium hover:bg-wine-dark transition-colors disabled:opacity-60"
        >
          {cargandoPago ? "Redirigiendo a pago..." : "Pagar con Stripe"}
        </button>
      </aside>
    </div>
  );
}
