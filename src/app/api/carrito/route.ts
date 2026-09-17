import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json([], { status: 200 });

  const items = await prisma.itemCarrito.findMany({
    where: { userId: session.user.id },
    include: { libro: true }
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { libroId, cantidad = 1, reemplazar = false } = await req.json();
  if (!libroId) return NextResponse.json({ error: "Falta libroId" }, { status: 400 });

  const existente = await prisma.itemCarrito.findUnique({
    where: { userId_libroId: { userId: session.user.id, libroId } }
  });

  const nuevaCantidad = reemplazar ? cantidad : (existente?.cantidad ?? 0) + cantidad;

  const item = await prisma.itemCarrito.upsert({
    where: { userId_libroId: { userId: session.user.id, libroId } },
    update: { cantidad: nuevaCantidad },
    create: { userId: session.user.id, libroId, cantidad: nuevaCantidad }
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { libroId } = await req.json();
  if (!libroId) return NextResponse.json({ error: "Falta libroId" }, { status: 400 });

  await prisma.itemCarrito.deleteMany({ where: { userId: session.user.id, libroId } });
  return NextResponse.json({ ok: true });
}
