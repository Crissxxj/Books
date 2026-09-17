"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GENEROS } from "@/types";

type Libro = {
  id?: string;
  titulo: string;
  autor: string;
  descripcion: string;
  precio: number;
  portadaUrl: string;
  genero: string;
  stock: number;
  destacado: boolean;
};

const vacio: Libro = {
  titulo: "",
  autor: "",
  descripcion: "",
  precio: 0,
  portadaUrl: "",
  genero: "FANTASIA",
  stock: 20,
  destacado: false
};

export default function LibroFormulario({ libroInicial }: { libroInicial?: Libro }) {
  const router = useRouter();
  const [libro, setLibro] = useState<Libro>(libroInicial ?? vacio);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const esEdicion = !!libroInicial?.id;

  function actualizar<K extends keyof Libro>(campo: K, valor: Libro[K]) {
    setLibro((prev) => ({ ...prev, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const url = esEdicion ? `/api/libros/${libroInicial!.id}` : "/api/libros";
    const metodo = esEdicion ? "PUT" : "POST";

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...libro,
        precio: Number(libro.precio),
        stock: Number(libro.stock)
      })
    });

    setGuardando(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ocurrió un error al guardar.");
      return;
    }

    router.push("/admin/libros");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1.5">Título</label>
        <input
          required
          value={libro.titulo}
          onChange={(e) => actualizar("titulo", e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-wine"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Autor</label>
        <input
          required
          value={libro.autor}
          onChange={(e) => actualizar("autor", e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-wine"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Descripción</label>
        <textarea
          required
          rows={4}
          value={libro.descripcion}
          onChange={(e) => actualizar("descripcion", e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-wine"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Precio (USD)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={libro.precio}
            onChange={(e) => actualizar("precio", Number(e.target.value) as any)}
            className="w-full border border-ink/20 rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-wine"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Stock</label>
          <input
            required
            type="number"
            min="0"
            value={libro.stock}
            onChange={(e) => actualizar("stock", Number(e.target.value) as any)}
            className="w-full border border-ink/20 rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-wine"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Género</label>
        <select
          value={libro.genero}
          onChange={(e) => actualizar("genero", e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-wine"
        >
          {GENEROS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">URL de portada</label>
        <input
          required
          type="url"
          placeholder="https://..."
          value={libro.portadaUrl}
          onChange={(e) => actualizar("portadaUrl", e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-2.5 bg-paper focus:outline-none focus:border-wine"
        />
        <p className="text-xs text-ink/50 mt-1">
          Puedes usar un enlace de imagen real o un placeholder como https://placehold.co/400x600
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={libro.destacado}
          onChange={(e) => actualizar("destacado", e.target.checked)}
        />
        Mostrar en la portada principal (destacado)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="bg-wine text-paper rounded-full px-6 py-3 font-medium hover:bg-wine-dark transition-colors disabled:opacity-60"
      >
        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear libro"}
      </button>
    </form>
  );
}
