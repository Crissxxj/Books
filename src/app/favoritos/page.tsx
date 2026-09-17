import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookCard from "@/components/BookCard";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const favoritos = await prisma.favorito.findMany({
    where: { userId: session.user.id },
    include: { libro: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Tus favoritos</h1>
      {favoritos.length === 0 ? (
        <p className="text-ink/60">
          Todavía no guardaste ningún libro. Explora el catálogo y toca el corazón de tus historias favoritas.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {favoritos.map((f) => (
            <BookCard key={f.id} libro={f.libro} />
          ))}
        </div>
      )}
    </div>
  );
}
