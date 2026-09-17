import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { confirmarPagoPayphone } from "@/lib/payphone";

export const dynamic = "force-dynamic";

// Payphone redirige aquí con ?id=...&clientTransactionId=... después del pago.
// A diferencia de Stripe (que confirmaba vía webhook aparte), con Payphone
// confirmamos directamente en esta página cuando el cliente vuelve.
export default async function CheckoutSuccess({
  searchParams
}: {
  searchParams: { id?: string; clientTransactionId?: string };
}) {
  let estado: "pagado" | "cancelado" | "error" = "error";

  const { id, clientTransactionId } = searchParams;

  if (id && clientTransactionId) {
    try {
      const confirmacion = await confirmarPagoPayphone(id, clientTransactionId);

      if (confirmacion.transactionStatus === "Approved") {
        const pedido = await prisma.pedido.update({
          where: { id: clientTransactionId },
          data: { estado: "PAGADO" },
          include: { items: true }
        });

        // Descontamos stock y vaciamos el carrito, igual que hacía antes el webhook de Stripe
        await Promise.all(
          pedido.items.map((item) =>
            prisma.libro.update({
              where: { id: item.libroId },
              data: { stock: { decrement: item.cantidad } }
            })
          )
        );
        await prisma.itemCarrito.deleteMany({ where: { userId: pedido.userId } });

        estado = "pagado";
      } else {
        await prisma.pedido.update({
          where: { id: clientTransactionId },
          data: { estado: "CANCELADO" }
        });
        estado = "cancelado";
      }
    } catch (err) {
      console.error("Error confirmando pago con Payphone:", err);
      estado = "error";
    }
  }

  const textos = {
    pagado: {
      titulo: "¡Gracias por tu compra!",
      mensaje: "Tu pago fue confirmado por Payphone y tu pedido ya está en marcha."
    },
    cancelado: {
      titulo: "Pago cancelado",
      mensaje: "La transacción no se completó. Tu carrito sigue disponible para intentarlo de nuevo."
    },
    error: {
      titulo: "No pudimos confirmar tu pago",
      mensaje: "Si el cobro se realizó, contáctanos con tu correo para verificarlo manualmente."
    }
  }[estado];

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-4xl mb-4">{textos.titulo}</h1>
      <p className="text-ink/70">{textos.mensaje}</p>
      <Link href="/" className="inline-block mt-8 bg-ink text-paper rounded-full px-6 py-3 hover:bg-wine transition-colors">
        Seguir explorando
      </Link>
    </div>
  );
}
