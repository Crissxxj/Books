import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe necesita el cuerpo crudo (sin parsear) para validar la firma del webhook
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const firma = req.headers.get("stripe-signature");

  let evento: Stripe.Event;

  try {
    evento = stripe.webhooks.constructEvent(body, firma!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Error verificando webhook de Stripe:", err.message);
    return NextResponse.json({ error: `Webhook inválido: ${err.message}` }, { status: 400 });
  }

  if (evento.type === "checkout.session.completed") {
    const checkoutSession = evento.data.object as Stripe.Checkout.Session;
    const pedidoId = checkoutSession.metadata?.pedidoId;

    if (pedidoId) {
      const pedido = await prisma.pedido.update({
        where: { id: pedidoId },
        data: { estado: "PAGADO" },
        include: { items: true }
      });

      // Descontamos stock y vaciamos el carrito del usuario
      await Promise.all(
        pedido.items.map((item) =>
          prisma.libro.update({
            where: { id: item.libroId },
            data: { stock: { decrement: item.cantidad } }
          })
        )
      );

      await prisma.itemCarrito.deleteMany({ where: { userId: pedido.userId } });
    }
  }

  return NextResponse.json({ received: true });
}
