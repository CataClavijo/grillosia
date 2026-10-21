/**
 * Registro de referencias cientificas de la plataforma.
 *
 * Cada valor que se muestra como "Valor de referencia cientifica" apunta a
 * una entrada de aqui por su `id`. Una referencia entra SOLO si alguien la
 * abrio y comprobo que dice lo que se le atribuye: nada de citas de memoria.
 *
 * Si un valor todavia no tiene referencia verificada, no se muestra el valor:
 * se muestra "Dato aun no disponible" (ver `DatoPendiente`).
 */

export interface Referencia {
  id: string;
  /**
   * Cita completa en APA 7. Lo que va en cursiva (titulo del libro, nombre y
   * volumen de la revista) se marca entre asteriscos: *asi*.
   */
  cita: string;
  /** Como se nombra dentro del texto: "National Research Council (1994)". */
  corta: string;
  /** Donde se puede consultar. */
  url?: string;
  /** Tabla o pagina donde esta el dato. */
  ubicacion?: string;
}

export const REFERENCIAS: Record<string, Referencia> = {
  "nrc-1994-aves": {
    id: "nrc-1994-aves",
    cita: "National Research Council. (1994). *Nutrient requirements of poultry* (9.ª ed. rev.). National Academy Press. https://doi.org/10.17226/2114",
    corta: "National Research Council (1994)",
    url: "https://web.archive.org/web/20150919022731/http://www.nap.edu/read/2114/chapter/4",
    ubicacion:
      "Tablas 2-1 (p. 20, levante), 2-3 (p. 23, postura) y 2-6 (p. 27, pollo de engorde). Base: 90 % de materia seca.",
  },
  "msd-nrc-2012-cerdos": {
    id: "msd-nrc-2012-cerdos",
    cita: "National Research Council. (2012). *Nutrient requirements of swine* (11.ª ed. rev.). The National Academies Press. https://doi.org/10.17226/13298. Tabla adaptada en: MSD Veterinary Manual. (s. f.). *Dietary nutrient requirements of growing pigs allowed ad lib feed (90 % dry matter)*.",
    corta: "National Research Council (2012), en la tabla adaptada del MSD Veterinary Manual",
    url: "https://www.msdvetmanual.com/multimedia/table/dietary-nutrient-requirements-of-growing-pigs-allowed-ad-lib-feed-90-dry-matter",
    ubicacion:
      "Proteína bruta aproximada para una dieta de maíz y soya. El NRC 2012 fija las necesidades en aminoácidos.",
  },
  "fao-affris-tilapia": {
    id: "fao-affris-tilapia",
    cita: "Ng, W. K. y Leger, M. (s. f.). *Nile tilapia (Oreochromis niloticus): Nutritional requirements* [Tabla 2]. FAO, Aquaculture Feed and Fertilizer Resources Information System (AFFRIS).",
    corta: "Ng y Leger (FAO, s. f.)",
    url: "https://www.fao.org/fileadmin/user_upload/affris/docs/tilapiaT2.pdf",
    ubicacion: "Tabla 2. Porcentaje del alimento seco.",
  },
  "fao-2014-trucha": {
    id: "fao-2014-trucha",
    cita: "FAO. (2014). *Manual práctico para el cultivo de la trucha arcoíris*. Organización de las Naciones Unidas para la Alimentación y la Agricultura.",
    corta: "FAO (2014)",
    url: "https://www.fao.org/3/a-bc354s.pdf",
    ubicacion: "Tabla 7, p. 21 del PDF.",
  },
  "vasquez-torres-2011": {
    id: "vasquez-torres-2011",
    cita: "Vásquez-Torres, W., Pereira-Filho, M. y Arias-Castellanos, J. A. (2011). Optimum dietary crude protein requirement for juvenile cachama Piaractus brachypomus. *Ciência Rural, 41*(12), 2183-2189. https://doi.org/10.1590/S0103-84782011001200023",
    corta: "Vásquez-Torres et al. (2011)",
    url: "https://www.scielo.br/j/cr/a/b3PWN5nz6B3dSVDhmr8H8rt/?format=pdf&lang=en",
    ubicacion: "Juveniles de 15,5 g, 60 días. Óptimo estimado en materia seca.",
  },
  "lima-2016": {
    id: "lima-2016",
    cita: "Lima, C. S., Bomfim, M. A. D., Siqueira, J. C., Ribeiro, F. B. y Lanna, E. A. T. (2016). Crude protein levels in the diets of tambaqui, Colossoma macropomum (Cuvier, 1818), fingerlings. *Revista Caatinga, 29*(1), 183-190. https://doi.org/10.1590/1983-21252016v29n121rc",
    corta: "Lima et al. (2016)",
    url: "https://locus.ufv.br/bitstreams/2dc23eee-03e9-4577-8625-138c1b15a4e7/download",
    ubicacion: "Alevines de 0,35 a 15 g. Óptimo estimado.",
  },
  "oishi-2010": {
    id: "oishi-2010",
    cita: "Oishi, C. A., Nwanna, L. C. y Pereira Filho, M. (2010). Optimum dietary protein requirement for Amazonian tambaqui, Colossoma macropomum Cuvier, 1818, fed fish meal free diets. *Acta Amazonica, 40*(4), 757-762. https://doi.org/10.1590/S0044-59672010000400017",
    corta: "Oishi et al. (2010)",
    url: "https://www.scielo.br/pdf/aa/v40n4/v40n4a17.pdf",
    ubicacion: "Juveniles de 46 g, 60 días. Óptimo estimado en materia seca.",
  },
};

/** La cita sin las marcas de cursiva, para el asistente y los textos planos. */
export function citaPlana(r: Referencia): string {
  return r.cita.replace(/\*/g, "");
}

export function referencia(id: string): Referencia | undefined {
  return REFERENCIAS[id];
}
