# EduNexis — Fase 3: Machine Learning

Esta carpeta contiene la primera integración real del modelo de Machine Learning del prototipo docente.

## Archivos

- `modelo_ml.py` — entrena, evalúa y exporta las predicciones.
- `../data/dataset_ml.csv` — dataset simulado usado para el prototipo.
- `../data/predicciones_ml.json` — salida que consume la interfaz docente.
- `ejecutar_modelo.bat` — ejecuta el modelo en Windows.
- `requirements_ml.txt` — dependencias de Python.

## Variables utilizadas

El modelo utiliza:

- Asistencia (%)
- Tareas
- Parcial 1
- Parcial 2
- Parcial 3

No utiliza `Promedio Final` como variable de entrada para evitar fuga de información, porque el promedio es un resultado académico que está fuertemente relacionado con la clasificación de riesgo.

## Modelo

Se utiliza `RandomForestClassifier` como modelo base. Se eligió porque permite trabajar con las variables numéricas del prototipo, obtener probabilidades por clase y consultar importancia de variables.

## Validación

Debido a que actualmente solo existen 18 registros simulados y la clase `Bajo` tiene un único ejemplo, se utiliza Leave-One-Out Cross-Validation y se muestran métricas orientativas. Estas métricas **no deben interpretarse como rendimiento de producción**.

## Flujo

```text
../data/dataset_ml.csv
      ↓
ml/modelo_ml.py
      ↓
Random Forest
      ↓
../data/predicciones_ml.json
      ↓
docente.js
      ↓
Riesgo Académico
```

## Naturaleza del proyecto

Los datos son simulados y se utilizan únicamente para el desarrollo y validación del prototipo funcional del sistema. No representan información institucional real.
