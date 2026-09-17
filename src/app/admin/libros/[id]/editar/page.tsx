import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LibroFormulario from "../../LibroFormulario";

export const dynamic = "force-dynamic";

export default async function EditarLibroPage({ params }: { params: { id: string } }) {
  const libro = await prisma.libro.findUnique({ where: { id: params.id } });
  if (!libro) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Editar libro</h1>
      <LibroFormulario libroInicial={libro} />
    </div>
  );
}
