import { PrismaClient, Genero } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Genera una portada de marcador de posición con el color del género y el título del libro.
// Reemplaza estas URLs por portadas reales (o súbelas a tu propio storage) cuando quieras.
function portada(color: string, texto: string) {
  const codificado = encodeURIComponent(texto);
  return `https://placehold.co/400x600/${color}/FFFFFF?text=${codificado}&font=playfair-display`;
}

type LibroSeed = {
  titulo: string;
  autor: string;
  descripcion: string;
  precio: number;
  genero: Genero;
  destacado?: boolean;
};

const colorPorGenero: Record<Genero, string> = {
  FANTASIA: "1F5C56",
  DARK_ROMANCE: "3A1620",
  ROMANCE_VAINILLA: "B98A2E",
  SPORT_ROMANCE: "1C3D5A"
};

const libros: LibroSeed[] = [
  // ---------- FANTASÍA ----------
  {
    titulo: "El Nombre del Viento",
    autor: "Patrick Rothfuss",
    descripcion:
      "La historia del legendario Kvothe, narrada por él mismo: música, magia y una búsqueda de respuestas que lo llevó de mendigo a mito.",
    precio: 18.99,
    genero: "FANTASIA",
    destacado: true
  },
  {
    titulo: "El Hobbit",
    autor: "J.R.R. Tolkien",
    descripcion:
      "Bilbo Bolsón deja la comodidad de la Comarca para acompañar a un grupo de enanos en la recuperación de un tesoro custodiado por un dragón.",
    precio: 15.5,
    genero: "FANTASIA"
  },
  {
    titulo: "Juego de Tronos",
    autor: "George R.R. Martin",
    descripcion:
      "Las grandes casas de Poniente luchan por el Trono de Hierro mientras una amenaza olvidada despierta más allá del Muro.",
    precio: 21.0,
    genero: "FANTASIA",
    destacado: true
  },
  {
    titulo: "Mistborn: El Imperio Final",
    autor: "Brandon Sanderson",
    descripcion:
      "En un mundo donde la ceniza cae del cielo, una joven ladrona descubre que puede manipular metales para desafiar a un emperador inmortal.",
    precio: 19.5,
    genero: "FANTASIA"
  },
  {
    titulo: "El Camino de los Reyes",
    autor: "Brandon Sanderson",
    descripcion:
      "Primer volumen de El Archivo de las Tormentas: guerra, honor y tormentas mágicas en un mundo devastado por conflictos ancestrales.",
    precio: 24.0,
    genero: "FANTASIA"
  },
  {
    titulo: "Trono de Cristal",
    autor: "Sarah J. Maas",
    descripcion:
      "Una asesina entrenada compite por convertirse en la campeona del rey en un torneo donde la traición puede costarle la vida.",
    precio: 17.99,
    genero: "FANTASIA"
  },
  {
    titulo: "Sombra y Hueso",
    autor: "Leigh Bardugo",
    descripcion:
      "Una cartógrafa huérfana descubre un poder capaz de salvar a su nación, y se ve arrastrada a la intriga de la corte real.",
    precio: 16.5,
    genero: "FANTASIA"
  },
  {
    titulo: "La Rueda del Tiempo: El Ojo del Mundo",
    autor: "Robert Jordan",
    descripcion:
      "Un ataque a su aldea revela que uno de tres jóvenes amigos podría ser el Dragón Renacido, profetizado para salvar o destruir el mundo.",
    precio: 20.0,
    genero: "FANTASIA"
  },
  {
    titulo: "Eragon",
    autor: "Christopher Paolini",
    descripcion:
      "Un joven granjero encuentra un huevo de dragón que cambiará su destino y lo convertirá en el último Jinete de Dragones.",
    precio: 15.0,
    genero: "FANTASIA"
  },
  {
    titulo: "Percy Jackson y el Ladrón del Rayo",
    autor: "Rick Riordan",
    descripcion:
      "Un adolescente descubre que es hijo de Poseidón y debe recuperar el rayo maestro de Zeus antes de que estalle una guerra entre dioses.",
    precio: 13.99,
    genero: "FANTASIA"
  },

  // ---------- DARK ROMANCE ----------
  {
    titulo: "Haunting Adeline",
    autor: "H.D. Carlton",
    descripcion:
      "Una escritora es acechada por un hombre tan peligroso como obsesionado, en una historia intensa que mezcla suspenso psicológico y deseo.",
    precio: 16.99,
    genero: "DARK_ROMANCE",
    destacado: true
  },
  {
    titulo: "Hunting Adeline",
    autor: "H.D. Carlton",
    descripcion:
      "La secuela directa de Haunting Adeline, donde la protagonista enfrenta las consecuencias de un amor tan retorcido como devoto.",
    precio: 16.99,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "Twisted Love",
    autor: "Ana Huang",
    descripcion:
      "Un empresario frío e implacable esconde secretos oscuros que amenazan con destruir a la única mujer que ha logrado conmoverlo.",
    precio: 14.5,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "Corrupt",
    autor: "Penelope Douglas",
    descripcion:
      "Diez años después de un roce peligroso, una joven vuelve a cruzarse con el hombre que casi la destruye, y la obsesión resurge.",
    precio: 15.99,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "Credence",
    autor: "Penelope Douglas",
    descripcion:
      "Tres hermanastros y una herencia familiar desatan una dinámica tan tensa como prohibida en una mansión aislada.",
    precio: 15.99,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "Captive in the Dark",
    autor: "C.J. Roberts",
    descripcion:
      "Una historia extrema sobre cautiverio y control, donde las líneas entre el trauma y la obsesión se difuminan peligrosamente.",
    precio: 13.99,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "Vicious",
    autor: "L.J. Shen",
    descripcion:
      "El chico más cruel del colegio y la chica que juró odiarlo protagonizan un romance enemies-to-lovers marcado por el rencor y el deseo.",
    precio: 14.99,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "Monster in His Eyes",
    autor: "Pepper Winters",
    descripcion:
      "Una historia de supervivencia y vínculo retorcido entre una prisionera y el hombre que decide su destino.",
    precio: 13.5,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "Ruthless People",
    autor: "J.J. McAvoy",
    descripcion:
      "El matrimonio arreglado entre la hija de un jefe mafioso y un asesino a sueldo se convierte en una alianza tan letal como apasionada.",
    precio: 15.5,
    genero: "DARK_ROMANCE"
  },
  {
    titulo: "El Príncipe Cruel",
    autor: "Holly Black",
    descripcion:
      "Una joven mortal atrapada en la corte feérica aprende a jugar con crueldad y ambición para sobrevivir entre príncipes despiadados.",
    precio: 16.0,
    genero: "DARK_ROMANCE"
  },

  // ---------- ROMANCE VAINILLA ----------
  {
    titulo: "Orgullo y Prejuicio",
    autor: "Jane Austen",
    descripcion:
      "El ingenio de Elizabeth Bennet choca con el orgullo del señor Darcy en uno de los romances más entrañables de la literatura clásica.",
    precio: 12.99,
    genero: "ROMANCE_VAINILLA",
    destacado: true
  },
  {
    titulo: "Emma",
    autor: "Jane Austen",
    descripcion:
      "Una joven decidida a hacer de casamentera termina descubriendo sus propios sentimientos en medio de malentendidos y buenas intenciones.",
    precio: 12.5,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "Los Puentes de Madison",
    autor: "Robert James Waller",
    descripcion:
      "Cuatro días bastan para que una granjera de Iowa y un fotógrafo viajero vivan un amor que marcará el resto de sus vidas.",
    precio: 11.99,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "Bajo la Misma Estrella",
    autor: "John Green",
    descripcion:
      "Dos adolescentes que se conocen en un grupo de apoyo encuentran en el amor una forma de darle sentido al tiempo que tienen.",
    precio: 13.99,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "Antes de Ti",
    autor: "Jojo Moyes",
    descripcion:
      "Una joven sin rumbo se convierte en cuidadora de un hombre que perdió las ganas de vivir, y juntos redefinen lo que significa el amor.",
    precio: 14.5,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "El Diario de Noa",
    autor: "Nicholas Sparks",
    descripcion:
      "Un amor de juventud interrumpido por la distancia vuelve a encontrarse años después, poniendo a prueba la fuerza del destino.",
    precio: 12.99,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "Un Paseo para Recordar",
    autor: "Nicholas Sparks",
    descripcion:
      "El hijo rebelde de un predicador se enamora de la chica más tímida del pueblo, en una historia tierna sobre la redención y el amor sincero.",
    precio: 12.99,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "Eleanor & Park",
    autor: "Rainbow Rowell",
    descripcion:
      "Dos adolescentes marginados encuentran refugio el uno en el otro durante los trayectos compartidos del autobús escolar.",
    precio: 13.5,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "A Todos los Chicos de los que me Enamoré",
    autor: "Jenny Han",
    descripcion:
      "Cuando las cartas de amor secretas de Lara Jean salen a la luz, un romance falso se convierte en algo mucho más real.",
    precio: 12.99,
    genero: "ROMANCE_VAINILLA"
  },
  {
    titulo: "Persuasión",
    autor: "Jane Austen",
    descripcion:
      "Años después de rechazar una propuesta de matrimonio, Anne Elliot vuelve a encontrarse con el amor que dejó ir por prudencia.",
    precio: 12.5,
    genero: "ROMANCE_VAINILLA"
  },

  // ---------- SPORT ROMANCE ----------
  {
    titulo: "The Deal",
    autor: "Elle Kennedy",
    descripcion:
      "Un capitán de hockey y una estudiante de música hacen un trato de conveniencia que termina complicándose sentimentalmente.",
    precio: 14.99,
    genero: "SPORT_ROMANCE",
    destacado: true
  },
  {
    titulo: "The Mistake",
    autor: "Elle Kennedy",
    descripcion:
      "Una noche que debía ser un error sin importancia se convierte en el inicio de algo que ninguno de los dos esperaba sentir.",
    precio: 14.99,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "The Score",
    autor: "Elle Kennedy",
    descripcion:
      "Un jugador de hockey seguro de sí mismo se propone conquistar a la única chica del campus que no cae ante su encanto.",
    precio: 14.99,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "The Goal",
    autor: "Elle Kennedy",
    descripcion:
      "El cierre de la serie Off-Campus reúne a dos personajes con química innegable y una historia pendiente por resolver.",
    precio: 14.99,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "Him",
    autor: "Sarina Bowen & Elle Kennedy",
    descripcion:
      "Dos ex compañeros de hockey y un secreto del pasado se reencuentran en la selección nacional, donde la rivalidad esconde algo más.",
    precio: 13.99,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "Us",
    autor: "Sarina Bowen & Elle Kennedy",
    descripcion:
      "La continuación de Him profundiza en la relación de dos jugadores profesionales que deben decidir si vale la pena arriesgarlo todo.",
    precio: 13.99,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "The Year We Fell Down",
    autor: "Sarina Bowen",
    descripcion:
      "Una patinadora lesionada y un jugador de hockey en silla de ruedas construyen una amistad que se transforma en algo más profundo.",
    precio: 13.5,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "Game On",
    autor: "Kristen Callihan",
    descripcion:
      "Una periodista deportiva y un mariscal de campo protagonizan un romance lleno de tensión, cámaras y sentimientos que no pueden esconder.",
    precio: 13.99,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "Heated Rivalry",
    autor: "Rachel Reid",
    descripcion:
      "Dos rivales de la liga de hockey mantienen en secreto una relación que crece partido tras partido, temporada tras temporada.",
    precio: 15.5,
    genero: "SPORT_ROMANCE"
  },
  {
    titulo: "Icebreaker",
    autor: "Hannah Grace",
    descripcion:
      "Una patinadora artística y el capitán del equipo de hockey deben compartir la pista de entrenamiento pese a no soportarse... al principio.",
    precio: 15.99,
    genero: "SPORT_ROMANCE"
  }
];

async function main() {
  console.log("Sembrando catálogo de libros...");

  for (const libro of libros) {
    await prisma.libro.create({
      data: {
        titulo: libro.titulo,
        autor: libro.autor,
        descripcion: libro.descripcion,
        precio: libro.precio,
        genero: libro.genero,
        destacado: libro.destacado ?? false,
        stock: 15 + Math.floor(Math.random() * 30),
        portadaUrl: portada(colorPorGenero[libro.genero], libro.titulo)
      }
    });
  }

  console.log(`Se crearon ${libros.length} libros.`);

  // Usuario administrador de ejemplo — cambia esta contraseña después de tu primer login
  const passwordAdmin = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@papelytinta.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@papelytinta.com",
      password: passwordAdmin,
      role: "ADMIN"
    }
  });

  // Usuario de prueba normal
  const passwordDemo = await bcrypt.hash("Lectora123!", 10);
  await prisma.user.upsert({
    where: { email: "lectora@ejemplo.com" },
    update: {},
    create: {
      name: "Usuaria Demo",
      email: "lectora@ejemplo.com",
      password: passwordDemo,
      role: "USER"
    }
  });

  console.log("Usuarios de ejemplo creados:");
  console.log("  Admin  -> admin@papelytinta.com / Admin123!");
  console.log("  Lector -> lectora@ejemplo.com / Lectora123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
