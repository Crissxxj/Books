import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GENEROS } from "@/types";
import BotonEliminarLibro from "./BotonEliminarLibro";

export const dynamic = "force-dynamic";

export default async function AdminLibrosPage() {
  const libros = await prisma.libro.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Libros</h1>
        <Link href="/admin/libros/nuevo" className="bg-wine text-paper rounded-full px-5 py-2.5 text-sm font-medium hover:bg-wine-dark transition-colors">
          + Agregar libro
        </Link>
      </div>

      <div className="overflow-x-auto border border-ink/10 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-paper2 text-left text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium">Género</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {libros.map((libro) => (
              <tr key={libro.id} className="border-t border-ink/10">
                <td className="px-4 py-3 font-medium">{libro.titulo}</td>
                <td className="px-4 py-3 text-ink/70">{libro.autor}</td>
                <td className="px-4 py-3 text-ink/70">
                  {GENEROS.find((g) => g.value === libro.genero)?.label ?? libro.genero}
                </td>
                <td className="px-4 py-3">${libro.precio.toFixed(2)}</td>
                <td className="px-4 py-3">{libro.stock}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link href={`/admin/libros/${libro.id}/editar`} className="text-wine hover:underline">
                    Editar
                  </Link>
                  <BotonEliminarLibro libroId={libro.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
