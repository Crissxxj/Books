import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalLibros, totalUsuarios, pedidosPagados, ingresos] = await Promise.all([
    prisma.libro.count(),
    prisma.user.count(),
    prisma.pedido.count({ where: { estado: "PAGADO" } }),
    prisma.pedido.aggregate({ where: { estado: "PAGADO" }, _sum: { total: true } })
  ]);

  const tarjetas = [
    { etiqueta: "Libros en catálogo", valor: totalLibros },
    { etiqueta: "Usuarios registrados", valor: totalUsuarios },
    { etiqueta: "Pedidos pagados", valor: pedidosPagados },
    { etiqueta: "Ingresos totales", valor: `$${(ingresos._sum.total ?? 0).toFixed(2)}` }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Panel de administrador</h1>
        <Link href="/admin/libros" className="bg-wine text-paper rounded-full px-5 py-2.5 text-sm font-medium hover:bg-wine-dark transition-colors">
          Gestionar libros
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tarjetas.map((t) => (
          <div key={t.etiqueta} className="border border-ink/10 rounded-xl p-6">
            <p className="text-sm text-ink/60">{t.etiqueta}</p>
            <p className="font-display text-3xl mt-2">{t.valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
