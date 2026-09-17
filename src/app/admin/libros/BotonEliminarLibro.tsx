"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BotonEliminarLibro({ libroId }: { libroId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function eliminar() {
    if (!confirm("¿Eliminar este libro del catálogo?")) return;
    setCargando(true);
    const res = await fetch(`/api/libros/${libroId}`, { method: "DELETE" });
    setCargando(false);
    if (res.ok) router.refresh();
    else alert("No se pudo eliminar el libro.");
  }

  return (
    <button onClick={eliminar} disabled={cargando} className="text-red-600 hover:underline disabled:opacity-50">
      Eliminar
    </button>
  );
}
