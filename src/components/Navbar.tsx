"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/carrito")
      .then((r) => r.json())
      .then((items) => {
        const total = (items ?? []).reduce((acc: number, it: any) => acc + it.cantidad, 0);
        setCantidadCarrito(total);
      })
      .catch(() => {});
  }, [status]);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          Papel <span className="text-wine">&amp;</span> Tinta
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink/80">
          <Link href="/?genero=FANTASIA" className="hover:text-wine transition-colors">Fantasía</Link>
          <Link href="/?genero=DARK_ROMANCE" className="hover:text-wine transition-colors">Dark Romance</Link>
          <Link href="/?genero=ROMANCE_VAINILLA" className="hover:text-wine transition-colors">Romance Vainilla</Link>
          <Link href="/?genero=SPORT_ROMANCE" className="hover:text-wine transition-colors">Sport Romance</Link>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          {status === "authenticated" ? (
            <>
              <Link href="/favoritos" className="hover:text-wine">Favoritos</Link>
              <Link href="/carrito" className="hover:text-wine relative">
                Carrito
                {cantidadCarrito > 0 && (
                  <span className="absolute -top-2 -right-3 bg-wine text-paper text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cantidadCarrito}
                  </span>
                )}
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="hover:text-wine font-semibold">Admin</Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-ink/60 hover:text-wine"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-wine">Entrar</Link>
              <Link
                href="/registro"
                className="bg-wine text-paper px-4 py-2 rounded-full hover:bg-wine-dark transition-colors"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
