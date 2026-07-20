/**
 * Contenido de la página /metodologia. Dirigido a un público técnico
 * (investigadores, evaluadores Minciencias, docentes).
 */

export interface MethodologySection {
  id: string;
  icon: "target" | "layers" | "brain" | "database" | "flag" | "book-open";
  title: string;
  body_markdown: string;
}

export interface Reference {
  citation: string;
  note: string;
}

export const HERO_TITLE = "Metodología del proyecto GrillIA";
export const HERO_SUBTITLE =
  "Cómo estudiamos, modelamos y validamos la cría de grillos nativos del Piedemonte Llanero.";

export const METHODOLOGY_SECTIONS: MethodologySection[] = [
  {
    id: "problema",
    icon: "target",
    title: "El problema que abordamos",
    body_markdown:
      "Colombia importa cerca de **12.000 toneladas al año de harina de pescado** para alimentar tilapia, pollo y cerdo. Esta dependencia encarece los concentrados que compran los pequeños productores del país y expone al sector pecuario a la volatilidad del mercado internacional y a la presión sobre las pesquerías marinas.\n\nLa harina de grillo aparece como una alternativa concreta:\n\n- Alto contenido proteico (**meta interna 60-70% en base seca**, a confirmar por análisis bromatológico).\n- Perfil de aminoácidos y lípidos favorable para monogástricos y peces.\n- Producción posible en pequeñas unidades familiares, con baja huella de agua y suelo.\n\nGrillIA se enfoca específicamente en **grillos nativos del Piedemonte Llanero**, un rasgo diferencial frente a proyectos que trabajan con especies exóticas. La pregunta que guía la metodología es sencilla:\n\n> ¿Qué combinación de dieta y condiciones de cría le permite a un productor obtener harina con el perfil proteico que su animal necesita, manteniendo una supervivencia viable del cultivo?\n\nResponderla exige articular biología, nutrición animal y ciencia de datos en una misma plataforma, y hacerlo con un lenguaje que un productor sin formación técnica pueda entender.",
  },
  {
    id: "variables",
    icon: "layers",
    title: "Variables del sistema",
    body_markdown:
      "El sistema modela la cría como una función de seis variables de entrada y dos variables objetivo, más filtros de viabilidad biológica.\n\n## Entradas (features)\n\n- **tipo_dieta**: código categórico (D1, D2, D3). El modelo aprende qué produce cada receta sin necesidad de análisis bromatológico previo.\n- **alimento_g_dia**: gramos de alimento suministrado por día.\n- **temperatura**: temperatura de cría en °C (condiciones objetivo 24-34 °C).\n- **humedad_ambiental**: humedad relativa en % (condiciones objetivo 50-80%).\n- **especie**: grillo nativo del Piedemonte Llanero utilizado en el ensayo.\n- **tiempo_desarrollo**: días desde la eclosión hasta la cosecha.\n\n## Salidas objetivo\n\n- **proteina_harina** (%MS): meta interna 60-70%.\n- **lipidos_harina** (%MS): perfil secundario relevante para peces.\n\n## Filtros de viabilidad\n\n- **tasa_supervivencia** (%), **peso_promedio** (g) y **biomasa_total** (g). Una recomendación con alta proteína pero baja supervivencia se descarta.\n\nLas dietas se registran como códigos y su composición (bore, botón de oro, salvado de trigo, harina de choclo, avena en hojuelas, hidratación con manzana) queda documentada en el campo **observaciones**.",
  },
  {
    id: "modelo",
    icon: "brain",
    title: "Modelo predictivo",
    body_markdown:
      "Estudiamos el problema con un enfoque de **Random Forest multi-salida** implementado en scikit-learn (`MultiOutputRegressor` sobre `RandomForestRegressor`, con `OneHotEncoder` para variables categóricas y `StandardScaler` para numéricas).\n\nLa elección responde a tres criterios:\n\n1. **Tamaño del conjunto de datos**: los datos iniciales provienen de literatura (decenas a pocos cientos de registros). Los ensambles de árboles se comportan bien en este régimen, mientras que las redes neuronales profundas suelen sobreajustar.\n2. **Interpretabilidad**: podemos exponer la importancia relativa de cada variable y explicar al productor por qué se le sugiere una dieta u otra.\n3. **Multi-salida nativa**: predecimos simultáneamente proteína y lípidos sin entrenar dos modelos independientes.\n\nEl enfoque es de **clasificación asistida**: el modelo solo puede sugerir dietas que ya haya visto en los datos. No extrapola combinaciones novedosas.\n\n> Como referencia externa, Vargas-Serna et al. (2025) reportan R²=0.99 con una red neuronal sobre 105 registros de literatura. Ese trabajo funciona como línea base y meta a discutir en la validación.\n\nEl **informe técnico completo** — con hiperparámetros, validación cruzada, métricas por objetivo y análisis de residuos — se publicará en el repositorio del proyecto a medida que avancen las fases experimentales.",
  },
  {
    id: "datos",
    icon: "database",
    title: "Construcción de la base de datos",
    body_markdown:
      "La base se construye en dos fases complementarias.\n\n## Fase 1 — Literatura científica\n\nEl equipo biológico revisa artículos que reportan composición nutricional de grillos y ensayos de dieta, y extrae los registros a una **plantilla CSV estandarizada** (`data/literature/README_DATA.md`). Cada fila incluye:\n\n- Dieta, especie, temperatura, humedad, tiempo de desarrollo, alimento diario.\n- Proteína y lípidos de la harina resultante.\n- Supervivencia, peso promedio, biomasa total.\n- **Fuente bibliográfica** (autor, año, DOI) para trazabilidad.\n\nEsta fase permite entrenar una primera versión del modelo sin depender del cronograma experimental.\n\n## Fase 2 — Datos propios de laboratorio\n\nLos ensayos en Universidad de los Llanos generan datos con protocolo controlado sobre las tres dietas en estudio (D1 bore, D2 botón de oro, D3 salvado de trigo). Cada ensayo alimenta la misma tabla `experiments` a través de la API, distinguiendo el campo `fuente` para separar literatura de laboratorio.\n\n## Validación cruzada\n\nAl unir ambas fuentes, comparamos predicciones sobre los datos propios usando modelos entrenados solo con literatura. Esta comparación mide el **gap de generalización** hacia las condiciones del Piedemonte Llanero y guía la ponderación de fuentes.",
  },
  {
    id: "fase_actual",
    icon: "flag",
    title: "Fase actual del proyecto",
    body_markdown:
      "GrillIA se encuentra en **fase de MVP demostrativo**. Esto significa:\n\n- El modelo de IA **está en entrenamiento**. Las cifras que devuelve la plataforma son útiles para ilustrar el flujo de trabajo y validar el diseño de la interfaz, pero **no constituyen recomendaciones productivas definitivas**.\n- Los ensayos experimentales sobre las dietas D1, D2 y D3 están en curso. Los resultados bromatológicos finales alimentarán versiones posteriores del modelo.\n- Las metas de proteína por animal se presentan como **objetivos NRC**, no como resultados garantizados.\n\n## Qué ya se puede hacer\n\n- Explorar la plataforma completa: chat informativo, wizard de dietas y visualización de resultados.\n- Comprender el flujo de decisión que un productor seguirá cuando el modelo esté validado.\n- Entregar retroalimentación temprana sobre lenguaje, usabilidad y contenido.\n\n## Qué está pendiente\n\n- Cierre de los ensayos experimentales y análisis bromatológico.\n- Reentrenamiento del modelo con datos propios y validación cruzada.\n- Documentación técnica final y publicación de resultados.\n\nEvitamos anunciar fechas específicas: las publicaremos únicamente cuando los datos experimentales lo respalden.",
  },
  {
    id: "lecturas",
    icon: "book-open",
    title: "Lecturas recomendadas",
    body_markdown:
      "La metodología de GrillIA se apoya en literatura previa sobre entomofagia, nutrición de insectos y modelos predictivos aplicados a producción animal. A continuación listamos las referencias que consideramos indispensables para quien quiera profundizar.\n\nCada referencia aporta a un aspecto distinto del proyecto:\n\n- Bases nutricionales de los grillos como fuente proteica.\n- Modelado estadístico de la composición de harina de insectos.\n- Marco global de la FAO sobre insectos comestibles y seguridad alimentaria.\n- Diseño de dietas experimentales para grillos.\n- Requerimientos nutricionales por especie animal según NRC.\n\nLe invitamos a revisar la sección de referencias que aparece a continuación. Si es evaluador o investigador y desea acceder al informe técnico ampliado, al repositorio de código o a la plantilla de datos, puede solicitarlo al equipo de la Universidad de los Llanos a través de los canales institucionales del proyecto.",
  },
];

export const REFERENCES: Reference[] = [
  {
    citation:
      "Vargas-Serna, C. L., Ochoa-Martínez, C. I., & Rodríguez-Sandoval, E. 2025. Predictive modeling of nutritional composition of edible cricket flour using artificial neural networks. Journal of Food Composition and Analysis.",
    note: "Referencia directa para el enfoque predictivo: R²=0.99 sobre 105 registros de literatura. Funciona como línea base y meta comparativa para el modelo de GrillIA.",
  },
  {
    citation:
      "Oonincx, D. G. A. B., van Broekhoven, S., van Huis, A., & van Loon, J. J. A. 2015. Feed conversion, survival and development, and composition of four insect species on diets composed of food by-products. PLoS ONE, 10(12): e0144601.",
    note: "Sustenta la relación entre dieta suministrada, supervivencia y composición nutricional final de los insectos, base para las variables de entrada y salida del sistema.",
  },
  {
    citation:
      "van Huis, A., Van Itterbeeck, J., Klunder, H., Mertens, E., Halloran, A., Muir, G., & Vantomme, P. 2013. Edible insects: future prospects for food and feed security. FAO Forestry Paper 171. Food and Agriculture Organization of the United Nations, Roma.",
    note: "Marco global de referencia sobre insectos comestibles como alternativa a fuentes proteicas convencionales; contextualiza la relevancia socioeconómica del proyecto.",
  },
  {
    citation:
      "Kwon, Y.-J., & Lee, K.-Y. 2023. Effects of dietary composition on growth performance and nutritional quality of the cricket Gryllus bimaculatus. Entomological Research, 53(5): 227-238.",
    note: "Aporta evidencia experimental sobre cómo distintas composiciones dietarias modifican el perfil nutricional de la harina de grillo, alineado con las dietas D1-D3 en estudio.",
  },
  {
    citation:
      "National Research Council (NRC). 2011. Nutrient Requirements of Fish and Shrimp. National Academies Press, Washington, D.C.",
    note: "Fuente oficial de los rangos de requerimiento proteico para tilapia en sus distintas etapas (alevín, crecimiento, engorde) utilizados en la plataforma.",
  },
  {
    citation:
      "National Research Council (NRC). 2012. Nutrient Requirements of Swine, 11th Revised Edition. National Academies Press, Washington, D.C.",
    note: "Fuente oficial de los requerimientos nutricionales para cerdos en inicio, crecimiento y engorde; sustenta las metas de proteína mostradas al productor.",
  },
];
