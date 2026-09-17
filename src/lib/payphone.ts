/**
 * Cliente para el "Botón de Pago" de Payphone (https://docs.payphone.app/boton-de-pago).
 * Reemplaza al antiguo cliente de Stripe. Flujo:
 *   1. prepararPagoPayphone(...)  -> crea la transacción y devuelve la URL de pago
 *   2. El cliente paga en esa URL (la aloja Payphone, no nuestro servidor)
 *   3. Payphone redirige de vuelta a NEXT_PUBLIC_SITE_URL + "/checkout/success?id=...&clientTransactionId=..."
 *   4. confirmarPagoPayphone(...) -> confirma el resultado real de la transacción
 */

const PAYPHONE_BASE = "https://pay.payphonetodoesposible.com/api";

function payphoneHeaders() {
  if (!process.env.PAYPHONE_TOKEN) {
    console.warn("PAYPHONE_TOKEN no está definido. Configura tu archivo .env");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.PAYPHONE_TOKEN || ""}`
  };
}

type PrepararPagoInput = {
  /** Monto total en dólares, ej. 19.99 */
  amount: number;
  /** Debe ser único por transacción: usamos el id del Pedido */
  clientTransactionId: string;
  reference: string;
  email?: string | null;
};

type PrepararPagoResultado = {
  paymentId: string;
  url: string;
};

export async function prepararPagoPayphone({
  amount,
  clientTransactionId,
  reference,
  email
}: PrepararPagoInput): Promise<PrepararPagoResultado> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  // Payphone trabaja los montos en centavos (enteros)
  const amountInCents = Math.round(amount * 100);

  const body = {
    amount: amountInCents,
    amountWithoutTax: amountInCents,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    currency: "USD",
    clientTransactionId,
    storeId: process.env.PAYPHONE_STOREID || "",
    reference,
    email: email || undefined,
    // A esta URL vuelve el cliente después de pagar (con ?id=...&clientTransactionId=...)
    responseUrl: `${siteUrl}/checkout/success`,
    // A esta URL vuelve si cancela desde el formulario de Payphone
    cancellationUrl: `${siteUrl}/carrito`
  };

  const res = await fetch(`${PAYPHONE_BASE}/button/Prepare`, {
    method: "POST",
    headers: payphoneHeaders(),
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok || !data.paymentId) {
    throw new Error(data?.message || "No se pudo preparar el pago con Payphone");
  }

  return {
    paymentId: data.paymentId as string,
    // payWithCard: paga directo con tarjeta (Visa/Mastercard/Diners/Discover), sin necesitar la app.
    // Si prefieres priorizar el Saldo Payphone / la app, usa data.payWithPayPhone en su lugar.
    url: data.payWithCard as string
  };
}

export type ConfirmacionPayphone = {
  transactionStatus: "Approved" | "Canceled";
  statusCode: number;
  clientTransactionId: string;
  transactionId: number;
  amount: number;
  message?: string | null;
};

export async function confirmarPagoPayphone(id: string, clientTxId: string): Promise<ConfirmacionPayphone> {
  const res = await fetch(`${PAYPHONE_BASE}/button/V2/Confirm`, {
    method: "POST",
    headers: payphoneHeaders(),
    body: JSON.stringify({ id: Number(id), clientTxId })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "No se pudo confirmar la transacción con Payphone");
  }

  return data as ConfirmacionPayphone;
}
