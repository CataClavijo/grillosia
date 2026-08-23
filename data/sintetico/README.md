# Datos simulados

Este directorio **no contiene datos reales**. Cada fila de
`experimentos_simulados.csv` la produjo un programa, no un laboratorio.

## Para qué existe

El modelo predictivo necesita datos con proteína y lípidos de la harina para
poder entrenarse. Esos valores salen del análisis bromatológico, que se hace
sobre la harina de los grillos ya cosechados. Mientras ese análisis no esté,
no hay con qué entrenar.

Sin datos no se puede comprobar nada: ni que el entrenamiento corra, ni que la
API responda, ni que la aplicación sepa qué hacer con un número que llega del
modelo. Este conjunto simulado permite dejar todo ese cableado montado y
probado, de modo que el día que lleguen los análisis reales solo haya que
cambiar el archivo de entrada.

## Cómo se genera

```bash
python backend/scripts/simular_datos.py
```

El script está en `backend/scripts/simular_datos.py` y la fórmula está escrita
ahí en claro, no escondida:

```
proteína      = base(dieta) − 0.45 × (temperatura − 28)
                            − 0.08 × |humedad − 65|
                            + 0.10 × (días − 45)
                            + ruido
lípidos       = 78 − proteína × 0.8 + ruido
supervivencia = 95 − 2.5 × |temperatura − 28|
                   − 0.8 × |humedad − 65|
                   + ruido
```

con `base(D1) = 58`, `base(D2) = 55`, `base(D3) = 61`.

Las direcciones de la fórmula (más calor baja la proteína, alejarse del 65 % de
humedad castiga la supervivencia) siguen lo que reporta la literatura. Las
magnitudes son inventadas.

### El alimento por día está fuera de la fórmula a propósito

`alimento_g_dia` se genera al azar y no entra en el cálculo de ninguna salida.
Es un control: si el modelo entrenado le diera importancia alta a esa variable,
sería señal de que está aprendiendo ruido en lugar de la señal. La importancia
de variables que imprime el entrenamiento sirve para verificarlo.

## Qué no se puede hacer con esto

- No se puede sugerir una dieta a un productor.
- No se pueden reportar los números como resultado del proyecto.
- No se puede comparar D1, D2 y D3 entre sí: el orden entre las tres lo fijó
  la constante `base(dieta)`, que es una decisión del programa, no un hallazgo.

El artefacto del modelo entrenado con estos datos guarda la marca
`datos_simulados: true`, la API la devuelve en cada respuesta y la aplicación
la muestra en pantalla. Es a propósito: un número que se ve bien no debe poder
pasar por real.

## Cuando lleguen los datos reales

1. Llenar las casillas V10 y V11 (proteína y lípidos) en la plantilla de
   recolección.
2. Consolidar: `python backend/scripts/cargar_plantilla.py --excel <archivo>`
3. Reentrenar: `python backend/scripts/entrenar.py --datos data/experimentos.csv`
   (sin la bandera `--simulados`).

A partir de ahí el artefacto queda marcado como `datos_simulados: false`, el
aviso desaparece solo de la aplicación y este directorio deja de usarse.
