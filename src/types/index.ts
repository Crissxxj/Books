export const GENEROS = [
  { value: "FANTASIA", label: "Fantasía" },
  { value: "DARK_ROMANCE", label: "Dark Romance" },
  { value: "ROMANCE_VAINILLA", label: "Romance Vainilla" },
  { value: "SPORT_ROMANCE", label: "Sport Romance" }
] as const;

export type GeneroValue = (typeof GENEROS)[number]["value"];
