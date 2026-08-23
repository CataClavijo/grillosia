"use client";

import { useRouter } from "next/navigation";

import { StepFooter } from "@/components/step-footer";

/**
 * Botón de regreso de las páginas de consulta (catálogo y guía de armado).
 *
 * Devuelve al usuario por donde vino: si llegó desde el resultado del
 * asistente, vuelve al resultado; si llegó desde el recorrido, vuelve al
 * recorrido. Solo cuando no hay historial previo cae al recorrido.
 */
export function BackToGuide({ label = "Volver" }: { label?: string }) {
  const router = useRouter();

  const volver = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/caja");
    }
  };

  return <StepFooter primary={{ label, onClick: volver }} />;
}
