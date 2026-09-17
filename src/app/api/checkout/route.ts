import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

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

  // Creamos el pedido en estado PENDIENTE antes de mandar a Stripe
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: session.user.email ?? undefined,
    line_items: items.map((it) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: it.libro.titulo,
          description: it.libro.autor
        },
        unit_amount: Math.round(it.libro.precio * 100)
      },
      quantity: it.cantidad
    })),
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/carrito`,
    metadata: { pedidoId: pedido.id }
  });

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { stripeSessionId: checkoutSession.id }
  });

  return NextResponse.json({ url: checkoutSession.url });
}
