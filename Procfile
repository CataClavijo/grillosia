# Antes de servir, el modelo se entrena a partir de los datos que están en el
# repositorio. Se hace así, y no subiendo el .joblib, para no versionar
# binarios y para que el modelo en produccion sea siempre el que sale de esos
# datos. El entrenamiento usa semilla fija y tarda unos segundos.
web: python backend/scripts/entrenar.py --datos data/sintetico/experimentos_simulados.csv --simulados && uvicorn main:app --host 0.0.0.0 --port $PORT --app-dir backend
