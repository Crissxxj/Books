import Link from "next/link";
import Image from "next/image";
import { GENEROS } from "@/types";

type Props = {
  libro: {
    id: string;
    titulo: string;
    autor: string;
    precio: number;
    portadaUrl: string;
    genero: string;
  };
};

export default function BookCard({ libro }: Props) {
  const etiquetaGenero = GENEROS.find((g) => g.value === libro.genero)?.label ?? libro.genero;

  return (
    <Link href={`/libro/${libro.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-paper2 shadow-sm group-hover:shadow-md transition-shadow">
        <Image
          src={libro.portadaUrl}
          alt={`Portada de ${libro.titulo}`}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>
      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-wine/80 font-medium">{etiquetaGenero}</p>
        <h3 className="font-display text-lg leading-snug mt-1 line-clamp-2">{libro.titulo}</h3>
        <p className="text-sm text-ink/60 mt-0.5">{libro.autor}</p>
        <p className="text-sm font-semibold mt-1.5">${libro.precio.toFixed(2)}</p>
      </div>
    </Link>
  );
}
