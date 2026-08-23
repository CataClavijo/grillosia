# Instrucciones para llenar el template de literatura

## Para el equipo de biologia — Proyecto GrillosIA

---

## 1. Objetivo

El archivo `template.csv` es la plantilla donde vamos a registrar **todos los datos experimentales** que encontremos en articulos cientificos sobre nutricion y cria de grillos. Estos datos alimentaran el modelo predictivo de GrillosIA. Mientras mas datos de calidad tengamos, mejor sera el modelo.

---

## 2. Como abrir y editar el archivo

- Pueden abrir `template.csv` con **Excel**, **Google Sheets** o **LibreOffice Calc**.
- Al abrir en Excel, asegurense de que el separador sea **coma** (`,`).
- **No cambien los nombres de las columnas** (la primera fila). El modelo los necesita exactamente asi.
- Cada fila nueva = un tratamiento/dieta de un articulo.
- Al guardar, asegurense de guardar como **CSV UTF-8** (no como .xlsx).

---

## 3. Descripcion de cada columna

| Columna | Tipo | Requerida | Descripcion |
|---------|------|-----------|-------------|
| `referencia` | texto | **SI** | Cita del articulo. Formato: "Apellido et al. Anio" o "Apellido & Apellido Anio". Ejemplo: "Patton et al. 2018" |
| `tipo_dieta` | texto | **SI** | Codigo que ustedes asignan a cada dieta unica dentro de un mismo articulo. Ver seccion 4 abajo. |
| `ingredientes` | texto | **SI** | Composicion de la dieta. Listar ingredientes con porcentajes separados por coma. Ejemplo: "maiz 50%, soya 30%, salvado de trigo 20%" |
| `hidratacion` | texto | opcional | Fuente de hidratacion usada. Ejemplos: "pepino", "zanahoria", "gel de agua", "agua libre". Si el articulo no lo menciona, dejar en blanco. |
| `alimento_g_dia` | numero | opcional | Cantidad de alimento suministrado por dia en **gramos**. Si el articulo reporta por semana, dividir entre 7. |
| `temperatura` | numero | **SI** | Temperatura de cria en **grados Celsius**. Si el articulo da un rango (ej. 28-32 C), usar el promedio (30). |
| `humedad_ambiental` | numero | opcional | Humedad relativa ambiental en **porcentaje**. Misma regla: si dan rango, usar promedio. |
| `especie` | texto | **SI** | Nombre cientifico completo del grillo. Ejemplos: "Acheta domesticus", "Gryllus bimaculatus", "Gryllodes sigillatus". |
| `tiempo_desarrollo` | numero | opcional | Dias desde la eclosion (o inicio del experimento) hasta la cosecha. |
| `fotoperiodo` | numero | opcional | Horas de luz por dia. Ejemplo: 12 significa 12 horas luz / 12 horas oscuridad. |
| `densidad` | numero | opcional | Densidad de cria en **individuos por metro cuadrado**. Si el articulo da individuos por caja, calcular la densidad dividiendo entre el area de la caja en m2. |
| `n_grillos_inicio` | numero | opcional | Numero de grillos al inicio del experimento o tratamiento. |
| `proteina_harina` | numero | **SI*** | Contenido de **proteina** de la harina de grillo en **% de materia seca**. Esta es una de las variables objetivo del modelo. |
| `lipidos_harina` | numero | **SI*** | Contenido de **lipidos** (grasa) de la harina de grillo en **% de materia seca**. Esta es la otra variable objetivo del modelo. |
| `tasa_supervivencia` | numero | opcional | Porcentaje de supervivencia al final del experimento. Si el articulo reporta mortalidad, restar de 100. |
| `peso_promedio` | numero | opcional | Peso promedio individual del grillo al momento de cosecha en **gramos**. |
| `biomasa_total` | numero | opcional | Biomasa total cosechada en **gramos**. |
| `observaciones` | texto | opcional | Cualquier nota relevante: si es dieta control, si hubo problemas, si los datos son aproximados, etc. |

> ***SI*:** Las columnas `proteina_harina` y `lipidos_harina` son las variables que el modelo busca predecir. Si un articulo no reporta estos valores, **igual pueden registrar la fila** con los demas datos (dejen esas celdas en blanco), pero prioricen articulos que si los reporten.

---

## 4. Como asignar codigos de dieta (tipo_dieta)

Dentro de **cada articulo**, asignen codigos secuenciales:

- La primera dieta que encuentren: **D1**
- La segunda dieta diferente: **D2**
- La tercera: **D3**
- Y asi sucesivamente.

**Reglas importantes:**
- Los codigos se reinician para cada articulo nuevo. Es decir, cada articulo empieza desde D1.
- Si dos tratamientos tienen la **misma dieta** pero difieren en otra variable (ej. temperatura), usen el **mismo** codigo de dieta.
- Si la dieta es diferente en composicion, usen un codigo **nuevo**.

**Ejemplo:**
Un articulo prueba 3 dietas a 2 temperaturas (6 tratamientos totales):

| referencia | tipo_dieta | temperatura |
|------------|-----------|-------------|
| Lopez 2022 | D1 | 25 |
| Lopez 2022 | D1 | 30 |
| Lopez 2022 | D2 | 25 |
| Lopez 2022 | D2 | 30 |
| Lopez 2022 | D3 | 25 |
| Lopez 2022 | D3 | 30 |

---

## 5. Como manejar datos faltantes

- **Dejen la celda en blanco.** No escriban "N/A", "NA", "no disponible", ni cero.
- Una celda en blanco le dice al modelo que el dato no esta disponible.
- Poner cero significa que el valor es literalmente cero, lo cual es diferente a "no se reporto".
- Si un valor se puede **calcular** a partir de otros datos del articulo, calculenlo y anotelo. Pongan una nota en la columna `observaciones` indicando que fue calculado.

---

## 6. Donde encontrar los datos en los articulos

Los datos que necesitamos suelen estar en estas secciones del articulo:

| Dato | Donde buscarlo |
|------|---------------|
| Composicion de dieta (ingredientes) | Seccion "Materials and Methods", tablas de formulacion de dietas |
| Temperatura, humedad, fotoperiodo | Seccion "Materials and Methods", subseccion de condiciones de cria o "rearing conditions" |
| Densidad, numero de grillos | Seccion "Materials and Methods", diseno experimental |
| Proteina y lipidos de la harina | Seccion "Results", tablas de composicion proximal ("proximate composition") |
| Supervivencia, peso, biomasa | Seccion "Results", tablas de parametros de crecimiento ("growth performance") |
| Tiempo de desarrollo | Seccion "Methods" o "Results" |

**Tip:** Busquen las tablas primero. La mayoria de los datos numericos estan en tablas, no en el texto.

---

## 7. Ejemplo completo trabajado

Supongamos que encontramos este articulo ficticio:

> **Martinez & Gomez (2023).** "Efecto de tres dietas sobre la composicion nutricional de Acheta domesticus criados a 28 C."

En la seccion de Materiales y Metodos leemos:
- Especie: *Acheta domesticus*
- 3 dietas: (1) maiz 60% + soya 40%; (2) maiz 40% + soya 40% + yuca 20%; (3) maiz 30% + soya 30% + moringa 40%
- Temperatura: 28 C, humedad: 70%
- Fotoperiodo: 14L:10O
- 300 grillos por tratamiento, cajas de 0.5 m2
- Hidratacion con rodajas de pepino
- Cosecha a los 45 dias
- Alimento: 5 g/dia por caja

En la tabla de resultados encontramos:

| Dieta | Proteina (% MS) | Lipidos (% MS) | Supervivencia (%) | Peso promedio (g) |
|-------|----------------|----------------|-------------------|-------------------|
| 1 | 62.4 | 16.1 | 85 | 0.48 |
| 2 | 58.9 | 18.3 | 80 | 0.42 |
| 3 | 67.2 | 11.5 | 75 | 0.39 |

Asi llenariamos el CSV (3 filas, una por dieta):

```
referencia,tipo_dieta,ingredientes,hidratacion,alimento_g_dia,temperatura,humedad_ambiental,especie,tiempo_desarrollo,fotoperiodo,densidad,n_grillos_inicio,proteina_harina,lipidos_harina,tasa_supervivencia,peso_promedio,biomasa_total,observaciones
"Martinez & Gomez 2023",D1,"maiz 60%, soya 40%",pepino,5,28,70,Acheta domesticus,45,14,600,300,62.4,16.1,85,0.48,,Dieta control
"Martinez & Gomez 2023",D2,"maiz 40%, soya 40%, yuca 20%",pepino,5,28,70,Acheta domesticus,45,14,600,300,58.9,18.3,80,0.42,,
"Martinez & Gomez 2023",D3,"maiz 30%, soya 30%, moringa 40%",pepino,5,28,70,Acheta domesticus,45,14,600,300,67.2,11.5,75,0.39,,Dieta con moringa
```

Notas sobre este ejemplo:
- La densidad se calculo: 300 grillos / 0.5 m2 = 600 ind/m2.
- `biomasa_total` se dejo en blanco porque el articulo no la reporto.
- El fotoperiodo se registro como 14 (solo las horas de luz).

---

## 8. Checklist antes de enviar los datos

Antes de enviar su archivo CSV, verifiquen:

- [ ] Cada fila tiene `referencia`, `tipo_dieta`, `ingredientes`, `temperatura` y `especie` como minimo.
- [ ] Los codigos de dieta (D1, D2...) son consistentes dentro de cada articulo.
- [ ] Los numeros **no** tienen unidades escritas (solo el numero, sin "g", "%", "C").
- [ ] Las celdas vacias estan realmente vacias (sin espacios, sin "NA").
- [ ] El archivo esta guardado como CSV con codificacion UTF-8.
- [ ] Los textos con comas estan entre comillas dobles (Excel lo hace automaticamente).

---

## 9. Dudas frecuentes

**P: El articulo usa otra especie de grillo, no Acheta domesticus. Lo incluyo?**
R: Si, incluyanlo. El modelo puede aprender de varias especies. Solo asegurense de escribir bien el nombre cientifico.

**P: El articulo reporta proteina en base humeda, no en materia seca. Que hago?**
R: Si el articulo da el porcentaje de humedad de la harina, pueden convertir: `proteina_MS = proteina_BH / (1 - humedad/100)`. Anoten en observaciones que fue convertido. Si no pueden convertir, dejenlo en blanco.

**P: Un articulo tiene muchos tratamientos (10+). Debo registrar todos?**
R: Si, cada tratamiento es una fila. Mas datos = mejor modelo.

**P: Puedo agregar columnas?**
R: No. Si hay informacion que no cabe en ninguna columna, usen la columna `observaciones`.

---

*Cualquier duda, consulten con el equipo de datos del proyecto.*
