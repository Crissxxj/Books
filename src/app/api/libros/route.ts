import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

const esquemaLibro = z.object({
  titulo: z.string().min(1),
  autor: z.string().min(1),
  descripcion: z.string().min(1),
  precio: z.number().positive(),
  portadaUrl: z.string().url(),
  genero: z.enum(["FANTASIA", "DARK_ROMANCE", "ROMANCE_VAINILLA", "SPORT_ROMANCE"]),
  stock: z.number().int().min(0).default(20),
  destacado: z.boolean().default(false)
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const genero = searchParams.get("genero");

  const libros = await prisma.libro.findMany({
    where: genero ? { genero: genero as any } : undefined,
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(libros);
}

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = esquemaLibro.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const libro = await prisma.libro.create({ data: parsed.data });
  return NextResponse.json(libro, { status: 201 });
}
