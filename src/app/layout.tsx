import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import Proveedores from "@/components/Proveedores";
import Navbar from "@/components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"]
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Papel y Tinta — Librería online",
  description: "Fantasía, dark romance, romance vainilla y sport romance. Encuentra tu próxima obsesión lectora."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fraunces.variable} ${workSans.variable} font-sans`}>
        <Proveedores>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-ink/10 py-10 mt-20 text-center text-sm text-ink/60">
            <p>© {new Date().getFullYear()} Papel y Tinta. Proyecto educativo — no afiliado a ninguna editorial.</p>
          </footer>
        </Proveedores>
      </body>
    </html>
  );
}
