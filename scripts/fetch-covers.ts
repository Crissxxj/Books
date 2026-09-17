/**
 * Busca una portada real para cada libro del catálogo usando la API pública
 * y gratuita de Open Library (https://openlibrary.org/dev/docs/api/covers) y
 * actualiza el campo `portadaUrl` en la base de datos.
 *
 * Uso:
 *   npm run covers:fetch
 *
 * Si no encuentra una portada para algún libro, deja la que ya tenía
 * (el placeholder de color por género) y lo indica en la consola para que
 * la agregues manualmente desde el panel /admin/libros.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buscarPortada(titulo: string, autor: string): Promise<string | null> {
  const params = new URLSearchParams({
    title: titulo,
    author: autor,
    limit: "1"
  });

  const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
  if (!res.ok) return null;

  const data = await res.json();
  const doc = data?.docs?.[0];
  if (!doc) return null;

  // cover_i es el id numérico de la portada más confiable; si no viene,
  // probamos con el ISBN del primer resultado.
  if (doc.cover_i) {
    return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  }
  if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
    return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
  }
  return null;
}

async function main() {
  const libros = await prisma.libro.findMany({
    select: { id: true, titulo: true, autor: true, portadaUrl: true }
  });

  console.log(`Buscando portadas para ${libros.length} libros...\n`);

  let actualizados = 0;
  let sinCambios = 0;

  for (const libro of libros) {
    try {
      const url = await buscarPortada(libro.titulo, libro.autor.split("&")[0].trim());
      if (url) {
        await prisma.libro.update({ where: { id: libro.id }, data: { portadaUrl: url } });
        console.log(`✅ ${libro.titulo} -> ${url}`);
        actualizados++;
      } else {
        console.log(`⚠️  Sin portada encontrada: ${libro.titulo} (se mantiene el placeholder)`);
        sinCambios++;
      }
    } catch (err) {
      console.error(`❌ Error buscando "${libro.titulo}":`, (err as Error).message);
      sinCambios++;
    }
    // Pausa breve para no saturar la API pública de Open Library
    await esperar(300);
  }

  console.log(`\nListo: ${actualizados} portadas actualizadas, ${sinCambios} sin cambios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
