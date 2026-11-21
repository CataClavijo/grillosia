/**
 * Aviso de permisos para criar grillos a escala o para vender.
 *
 * Pedido por Catalina (2026-11-21). Cada afirmacion se verifico en la norma o
 * en la pagina oficial de la entidad (noviembre de 2026):
 *
 *  - Fauna silvestre: Decreto 1076 de 2015, art. 2.2.1.2.1.4 (antes Decreto
 *    1608 de 1978, art. 4). No excluye a los insectos; Minambiente trato la
 *    cria de abejas nativas como zoocria (concepto 13002025E2011436, 2025).
 *  - Zoocria en dos fases, experimental (sin venta) y comercial: Ley 611 de
 *    2000, arts. 12, 13 y 20; Decreto 1076, arts. 2.2.1.2.15.2 y 2.2.1.2.15.4.
 *  - Licencia de la corporacion ambiental con jurisdiccion: Decreto 1076,
 *    art. 2.2.2.3.2.3, num. 19.
 *  - Recoger los grillos del monte: permiso de caza de fomento (Decreto 1076,
 *    arts. 2.2.1.2.11.1 a 2.2.1.2.11.3; Ley 611, art. 15).
 *  - Jurisdicciones: Ley 1938 de 2018 (Cormacarena en el Meta; Corporinoquia
 *    en Arauca, Casanare y Vichada).
 *  - ICA: Resolucion 061252 de 2020. Las materias primas no se registran pero
 *    deben tener ficha tecnica (art. 15); quien fabrique alimento terminado si
 *    se registra (arts. 4 y 16).
 *
 * Es orientacion, no asesoria legal: por eso el aviso manda siempre a
 * confirmar con la entidad.
 */

export const PERMISOS_TITULO = "¿Va a criar grillos para vender?";

export const PERMISOS_RESUMEN =
  "Los grillos del monte son fauna silvestre. Para criarlos a escala o vender los grillos o su harina, primero necesita permisos de la corporación ambiental de su región.";

export interface PasoPermiso {
  titulo: string;
  texto: string;
}

export const PERMISOS_PASOS: PasoPermiso[] = [
  {
    titulo: "Para recogerlos del monte",
    texto: "Permiso de caza de fomento, de la corporación ambiental del lugar donde los recoge.",
  },
  {
    titulo: "Para el criadero",
    texto:
      "Licencia de zoocriadero. Empieza en una fase experimental, en la que todavía no se puede vender; después se pide la fase comercial.",
  },
  {
    titulo: "Para vender la harina como alimento de animales",
    texto:
      "Consulte al ICA. La harina como ingrediente debe tener ficha técnica; si fabrica concentrado para vender, necesita registro.",
  },
];

export interface Autoridad {
  region: string;
  entidad: string;
  url: string;
}

export const AUTORIDADES: Autoridad[] = [
  {
    region: "Meta",
    entidad: "Cormacarena",
    url: "https://www.cormacarena.gov.co/tramites-y-servicios/licencia-ambiental",
  },
  {
    region: "Arauca, Casanare y Vichada",
    entidad: "Corporinoquia",
    url: "https://corporinoquia.gov.co",
  },
  {
    region: "Otras regiones",
    entidad: "Directorio de corporaciones ambientales",
    url: "https://www.anla.gov.co/01_anla/ciudadania/atencion-al-ciudadano/transparencia-y-acceso-a-la-informacion/directorio-de-entidades-del-sector-ambiente",
  },
  {
    region: "Venta de harina para alimento animal",
    entidad: "ICA",
    url: "https://www.ica.gov.co/areas/pecuaria/servicios/alimentos-para-animales/requisitos-para-la-expedicion-del-registro-de-3.aspx",
  },
];

export const PERMISOS_NOTA =
  "Para criar unos pocos grillos en casa y aprender, como en esta guía, también conviene preguntar a la corporación. Esta información es una orientación: confirme siempre los requisitos con la entidad. Normas: Decreto 1076 de 2015, Ley 611 de 2000 y Resolución ICA 061252 de 2020.";
