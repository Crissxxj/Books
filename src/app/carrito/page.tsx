import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CarritoCliente from "./CarritoCliente";

export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const items = await prisma.itemCarrito.findMany({
    where: { userId: session.user.id },
    include: { libro: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Tu carrito</h1>
      <CarritoCliente itemsIniciales={items} />
    </div>
  );
}
