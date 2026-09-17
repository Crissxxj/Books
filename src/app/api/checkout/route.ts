import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { prepararPagoPayphone } from "@/lib/payphone";

export async function POST() {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await prisma.itemCarrito.findMany({
    where: { userId: session.user.id },
    include: { libro: true }
  });

  if (items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  const total = items.reduce((acc, it) => acc + it.cantidad * it.libro.precio, 0);

  // Creamos el pedido en estado PENDIENTE antes de mandar a Payphone.
  // Usamos su id como clientTransactionId: es único y nos permite ubicarlo al confirmar.
  const pedido = await prisma.pedido.create({
    data: {
      userId: session.user.id,
      total,
      estado: "PENDIENTE",
      items: {
        create: items.map((it) => ({
          libroId: it.libro.id,
          cantidad: it.cantidad,
          precio: it.libro.precio
        }))
      }
    }
  });

  try {
    const { url, paymentId } = await prepararPagoPayphone({
      amount: total,
      clientTransactionId: pedido.id,
      reference: `Pedido ${pedido.id} - Papel & Tinta`,
      email: session.user.email
    });

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { pagoExternoId: paymentId }
    });

    return NextResponse.json({ url });
  } catch (e: any) {
    // Si Payphone falla al preparar la transacción, no dejamos un pedido fantasma en PENDIENTE
    await prisma.pedido.update({ where: { id: pedido.id }, data: { estado: "CANCELADO" } });
    return NextResponse.json({ error: e.message || "No se pudo iniciar el pago" }, { status: 500 });
  }
}
