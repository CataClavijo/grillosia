import { animalesDe, type CategoriaId } from "@/lib/animals";
import type { PasoIndicador } from "@/components/ds/pasos";
import type { WizardDraft } from "@/lib/wizard-draft";

/**
 * Las pantallas de la consulta, en orden. Cada una tiene su direccion
 * (`/consulta?p=etapa`) para que la flecha de atras del navegador funcione.
 *
 * "especie" solo aparece si la categoria tiene mas de un animal: en cerdos
 * se salta.
 */
export const PANTALLAS = ["animal", "especie", "etapa", "clima"] as const;
export type Pantalla = (typeof PANTALLAS)[number];

export function pantallasPara(categoryId: string): Pantalla[] {
  const unSoloAnimal =
    categoryId !== "" && animalesDe(categoryId as CategoriaId).length === 1;
  return unSoloAnimal ? ["animal", "etapa", "clima"] : [...PANTALLAS];
}

/** La primera pantalla que falta contestar. */
export function primeraSinContestar(r: WizardDraft): Pantalla {
  if (!r.categoryId) return "animal";
  if (!r.animalId) return "especie";
  if (!r.stageId) return "etapa";
  return "clima";
}

/**
 * Los cuatro pasos que ve la persona. Con `editar`, los enlaces abren la
 * consulta guardada (se usa desde el resultado, donde puede no haber
 * borrador).
 */
export function pasosConsulta(editar = false): PasoIndicador[] {
  const a = (p: Pantalla) => `/consulta?${editar ? "editar=1&" : ""}p=${p}`;
  return [
    { titulo: "Animal", href: a("animal") },
    { titulo: "Etapa", href: a("etapa") },
    { titulo: "Clima", href: a("clima") },
    { titulo: "Resultado" },
  ];
}
