import { AvisoPermisos } from "@/components/aviso-permisos";
import { DondeEncontrarlos } from "@/components/donde-encontrarlos";
import { Paso } from "@/components/paso";

export const metadata = {
  title: "Busque sus grillos — GrillosIA",
  description:
    "Dónde encontró el proyecto GrillosIA sus grillos en el Piedemonte Llanero y cómo sacarlos vivos para la cría.",
};

/**
 * Parada 3: buscar los grillos.
 *
 * Antes era una seccion de "Conozca sus grillos" y mezclaba al animal con
 * los lugares. Aqui va sola: los sitios de muestreo con sus fotos y el
 * metodo que si sirvio para sacarlos vivos.
 */
export default function PaginaRecoleccion() {
  return (
    <Paso n={3} titulo="Busque sus grillos">
      <DondeEncontrarlos>
        <AvisoPermisos forma="bloque" />
      </DondeEncontrarlos>
    </Paso>
  );
}
