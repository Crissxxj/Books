import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({
  searchParams
}: {
  searchParams: { session_id?: string };
}) {
  let pedidoConfirmado = false;

  if (searchParams.session_id) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      const pedido = await prisma.pedido.findUnique({
        where: { stripeSessionId: stripeSession.id }
      });
      pedidoConfirmado = pedido?.estado === "PAGADO";
    } catch {
      pedidoConfirmado = false;
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-4xl mb-4">
        {pedidoConfirmado ? "¡Gracias por tu compra!" : "Procesando tu pedido..."}
      </h1>
      <p className="text-ink/70">
        {pedidoConfirmado
          ? "Tu pago fue confirmado y tu pedido ya está en marcha."
          : "Si el pago fue exitoso, tu pedido se confirmará en unos segundos. Puedes revisar el estado desde tu cuenta."}
      </p>
      <Link href="/" className="inline-block mt-8 bg-ink text-paper rounded-full px-6 py-3 hover:bg-wine transition-colors">
        Seguir explorando
      </Link>
    </div>
  );
}
