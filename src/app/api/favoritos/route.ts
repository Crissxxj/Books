import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json([], { status: 200 });

  const favoritos = await prisma.favorito.findMany({
    where: { userId: session.user.id },
    include: { libro: true }
  });
  return NextResponse.json(favoritos);
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { libroId } = await req.json();
  if (!libroId) return NextResponse.json({ error: "Falta libroId" }, { status: 400 });

  const favorito = await prisma.favorito.upsert({
    where: { userId_libroId: { userId: session.user.id, libroId } },
    update: {},
    create: { userId: session.user.id, libroId }
  });

  return NextResponse.json(favorito, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { libroId } = await req.json();
  if (!libroId) return NextResponse.json({ error: "Falta libroId" }, { status: 400 });

  await prisma.favorito.deleteMany({ where: { userId: session.user.id, libroId } });
  return NextResponse.json({ ok: true });
}
