import { prisma } from "@/lib/prisma";
import BookCard from "@/components/BookCard";
import Filters from "@/components/Filters";
import { GeneroValue } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams
}: {
  searchParams: { genero?: string };
}) {
  const genero = searchParams.genero as GeneroValue | undefined;

  const [libros, destacados] = await Promise.all([
    prisma.libro.findMany({
      where: genero ? { genero } : undefined,
      orderBy: { createdAt: "desc" }
    }),
    genero ? Promise.resolve([]) : prisma.libro.findMany({ where: { destacado: true }, take: 4 })
  ]);

  return (
    <div>
      <section className="border-b border-ink/10 bg-paper2/60">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-wine font-medium tracking-wide mb-3">Cuatro mundos, una librería</p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink">
              Historias que se quedan contigo hasta la última página.
            </h1>
            <p className="mt-5 text-ink/70 max-w-prose">
              Fantasía épica, dark romance, romance vainilla y sport romance — elegidos para lectoras y
              lectores que quieren algo más que una portada bonita.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {destacados.slice(0, 4).map((libro) => (
              <div key={libro.id} className="aspect-[2/3] rounded-lg overflow-hidden bg-paper shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={libro.portadaUrl} alt={libro.titulo} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="font-display text-2xl">Catálogo</h2>
          <Filters />
        </div>

        {libros.length === 0 ? (
          <p className="text-ink/60">No hay libros en esta categoría todavía.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {libros.map((libro) => (
              <BookCard key={libro.id} libro={libro} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
