import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

const esquemaActualizacion = z.object({
  titulo: z.string().min(1).optional(),
  autor: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  precio: z.number().positive().optional(),
  portadaUrl: z.string().url().optional(),
  genero: z.enum(["FANTASIA", "DARK_ROMANCE", "ROMANCE_VAINILLA", "SPORT_ROMANCE"]).optional(),
  stock: z.number().int().min(0).optional(),
  destacado: z.boolean().optional()
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const libro = await prisma.libro.findUnique({ where: { id: params.id } });
  if (!libro) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(libro);
}

async function requiereAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const bloqueo = await requiereAdmin();
  if (bloqueo) return bloqueo;

  const body = await req.json();
  const parsed = esquemaActualizacion.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const libro = await prisma.libro.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(libro);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const bloqueo = await requiereAdmin();
  if (bloqueo) return bloqueo;

  await prisma.libro.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
