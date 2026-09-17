import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import { GENEROS } from "@/types";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function LibroDetalle({ params }: { params: { id: string } }) {
  const libro = await prisma.libro.findUnique({ where: { id: params.id } });
  if (!libro) notFound();

  const session = await getAuthSession();
  let esFavorito = false;
  if (session?.user) {
    const favorito = await prisma.favorito.findUnique({
      where: { userId_libroId: { userId: session.user.id, libroId: libro.id } }
    });
    esFavorito = !!favorito;
  }

  const etiquetaGenero = GENEROS.find((g) => g.value === libro.genero)?.label ?? libro.genero;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-[320px_1fr] gap-12">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-paper2">
        <Image src={libro.portadaUrl} alt={`Portada de ${libro.titulo}`} fill className="object-cover" />
      </div>

      <div>
        <p className="text-wine font-medium tracking-wide">{etiquetaGenero}</p>
        <h1 className="font-display text-4xl mt-2">{libro.titulo}</h1>
        <p className="text-ink/60 mt-1">por {libro.autor}</p>

        <p className="font-display text-3xl mt-6">${libro.precio.toFixed(2)}</p>
        <p className="text-sm text-ink/50 mt-1">
          {libro.stock > 0 ? `${libro.stock} disponibles` : "Sin stock por ahora"}
        </p>

        <div className="flex items-center gap-3 mt-6 max-w-md">
          <AddToCartButton libroId={libro.id} />
          <FavoriteButton libroId={libro.id} esFavoritoInicial={esFavorito} />
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl mb-3">Sinopsis</h2>
          <p className="text-ink/75 leading-relaxed max-w-prose">{libro.descripcion}</p>
        </div>
      </div>
    </div>
  );
}
