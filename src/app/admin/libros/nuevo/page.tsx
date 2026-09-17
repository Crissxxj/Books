import LibroFormulario from "../LibroFormulario";

export default function NuevoLibroPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Agregar libro</h1>
      <LibroFormulario />
    </div>
  );
}
