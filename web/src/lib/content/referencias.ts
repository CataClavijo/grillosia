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
  /** Cita completa: autores, ano, titulo, editorial o revista. */
  cita: string;
  /** Donde se puede consultar. */
  url?: string;
  /** Tabla o pagina donde esta el dato. */
  ubicacion?: string;
}

export const REFERENCIAS: Record<string, Referencia> = {
  "nrc-1994-aves": {
    id: "nrc-1994-aves",
    cita: "National Research Council (1994). Nutrient Requirements of Poultry. 9.a edición revisada. Washington, DC: National Academy Press. doi:10.17226/2114.",
    url: "https://web.archive.org/web/20150919022731/http://www.nap.edu/read/2114/chapter/4",
    ubicacion:
      "Tablas 2-1 (p. 20, levante), 2-3 (p. 23, postura) y 2-6 (p. 27, pollo de engorde). Base: 90 % de materia seca.",
  },
  "msd-nrc-2012-cerdos": {
    id: "msd-nrc-2012-cerdos",
    cita: "MSD Veterinary Manual. Dietary Nutrient Requirements of Growing Pigs Allowed Ad Lib Feed (90 % dry matter). Tabla adaptada de National Research Council (2012), Nutrient Requirements of Swine, 11.a edición revisada, doi:10.17226/13298.",
    url: "https://www.msdvetmanual.com/multimedia/table/dietary-nutrient-requirements-of-growing-pigs-allowed-ad-lib-feed-90-dry-matter",
    ubicacion:
      "Proteína bruta aproximada para una dieta de maíz y soya. El NRC 2012 fija las necesidades en aminoácidos.",
  },
  "fao-affris-tilapia": {
    id: "fao-affris-tilapia",
    cita: "FAO, Aquaculture Feed and Fertilizer Resources Information System (AFFRIS). Nile tilapia (Oreochromis niloticus): Nutritional requirements, Tabla 2. W.K. Ng y M. Leger.",
    url: "https://www.fao.org/fileadmin/user_upload/affris/docs/tilapiaT2.pdf",
    ubicacion: "Tabla 2. Porcentaje del alimento seco.",
  },
  "fao-2014-trucha": {
    id: "fao-2014-trucha",
    cita: "FAO (2014). Manual práctico para el cultivo de la trucha arcoíris. Guatemala: FAO.",
    url: "https://www.fao.org/3/a-bc354s.pdf",
    ubicacion: "Tabla 7, p. 21 del PDF.",
  },
  "vasquez-torres-2011": {
    id: "vasquez-torres-2011",
    cita: "Vásquez-Torres, W., Pereira-Filho, M. y Arias-Castellanos, J.A. (2011). Optimum dietary crude protein requirement for juvenile cachama Piaractus brachypomus. Ciência Rural 41(12): 2183-2189. doi:10.1590/S0103-84782011001200023.",
    url: "https://www.scielo.br/j/cr/a/b3PWN5nz6B3dSVDhmr8H8rt/?format=pdf&lang=en",
    ubicacion: "Juveniles de 15,5 g, 60 días. Óptimo estimado en materia seca.",
  },
  "lima-2016": {
    id: "lima-2016",
    cita: "Lima, C.S., Bomfim, M.A.D., Siqueira, J.C., Ribeiro, F.B. y Lanna, E.A.T. (2016). Crude protein levels in the diets of tambaqui, Colossoma macropomum (Cuvier, 1818), fingerlings. Revista Caatinga 29(1): 183-190. doi:10.1590/1983-21252016v29n121rc.",
    url: "https://locus.ufv.br/bitstreams/2dc23eee-03e9-4577-8625-138c1b15a4e7/download",
    ubicacion: "Alevines de 0,35 a 15 g. Óptimo estimado.",
  },
  "oishi-2010": {
    id: "oishi-2010",
    cita: "Oishi, C.A., Nwanna, L.C. y Pereira Filho, M. (2010). Optimum dietary protein requirement for Amazonian tambaqui, Colossoma macropomum Cuvier, 1818, fed fish meal free diets. Acta Amazonica 40(4): 757-762. doi:10.1590/S0044-59672010000400017.",
    url: "https://www.scielo.br/pdf/aa/v40n4/v40n4a17.pdf",
    ubicacion: "Juveniles de 46 g, 60 días. Óptimo estimado en materia seca.",
  },
};

export function referencia(id: string): Referencia | undefined {
  return REFERENCIAS[id];
}
