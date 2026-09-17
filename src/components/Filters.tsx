"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GENEROS } from "@/types";

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const generoActivo = searchParams.get("genero");

  function irA(genero: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (genero) params.set("genero", genero);
    else params.delete("genero");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => irA(null)}
        className={`px-4 py-2 rounded-full text-sm border transition-colors ${
          !generoActivo ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink/70 hover:border-ink"
        }`}
      >
        Todos
      </button>
      {GENEROS.map((g) => (
        <button
          key={g.value}
          onClick={() => irA(g.value)}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
            generoActivo === g.value ? "bg-wine text-paper border-wine" : "border-ink/20 text-ink/70 hover:border-wine hover:text-wine"
          }`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
