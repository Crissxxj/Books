import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const esquemaRegistro = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = esquemaRegistro.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { nombre, email, password } = parsed.data;

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }

  const passwordHasheado = await bcrypt.hash(password, 10);

  const usuario = await prisma.user.create({
    data: { name: nombre, email, password: passwordHasheado }
  });

  return NextResponse.json({ id: usuario.id, email: usuario.email }, { status: 201 });
}
