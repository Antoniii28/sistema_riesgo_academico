"""
EduNexis - Modelo de Machine Learning para riesgo académico

FASE 3 - PROTOTIPO FUNCIONAL

Este script entrena un clasificador con datos SIMULADOS de un grupo escolar.
No representa datos institucionales reales.

Modelo elegido: Random Forest
Motivos:
- funciona bien con variables numéricas heterogéneas;
- permite obtener probabilidades por clase;
- permite visualizar importancia de variables;
- es más estable que un árbol único para este conjunto pequeño.

IMPORTANTE:
El dataset actual tiene solo 18 registros y una clase "Bajo" con un solo ejemplo.
Por ello, las métricas de validación deben interpretarse como demostración
metodológica del prototipo, NO como evidencia de rendimiento en producción.
"""

from pathlib import Path
import json
import warnings

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import LeaveOneOut, cross_val_predict
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score, classification_report

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
DATASET_PATH = PROJECT_DIR / "data" / "dataset_ml.csv"
OUTPUT_PATH = PROJECT_DIR / "data" / "predicciones_ml.json"

FEATURES = [
    "Asistencia (%)",
    "Tareas",
    "Parcial 1",
    "Parcial 2",
    "Parcial 3",
]
TARGET = "Nivel de Riesgo"
IDENTIFIERS = ["Matricula", "Nombre", "Grupo", "Asesor"]


def cargar_dataset():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"No se encontró el dataset: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    required = IDENTIFIERS + FEATURES + ["Promedio Final", TARGET]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError("Faltan columnas requeridas: " + ", ".join(missing))

    for col in FEATURES + ["Promedio Final"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    if df[FEATURES + [TARGET]].isnull().any().any():
        raise ValueError("Hay valores vacíos o no numéricos en las variables del modelo.")

    return df


def crear_modelo():
    return RandomForestClassifier(
        n_estimators=300,
        max_depth=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )


def evaluar_modelo(modelo, X, y):
    """Validación Leave-One-Out, adecuada para documentar este dataset pequeño."""
    loo = LeaveOneOut()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        pred = cross_val_predict(modelo, X, y, cv=loo, method="predict")

    return {
        "metodo": "Leave-One-Out Cross-Validation",
        "accuracy": round(float(accuracy_score(y, pred)), 4),
        "balanced_accuracy": round(float(balanced_accuracy_score(y, pred)), 4),
        "f1_macro": round(float(f1_score(y, pred, average="macro", zero_division=0)), 4),
        "reporte": classification_report(y, pred, output_dict=True, zero_division=0),
        "advertencia": (
            "El dataset es pequeño (18 registros) y la clase Bajo tiene un solo ejemplo; "
            "estas métricas son orientativas para el prototipo."
        ),
    }


def entrenar_y_exportar():
    df = cargar_dataset()
    X = df[FEATURES]
    y = df[TARGET]

    modelo = crear_modelo()
    evaluacion = evaluar_modelo(modelo, X, y)

    # Entrenamiento final con todos los registros disponibles.
    modelo.fit(X, y)
    predicciones = modelo.predict(X)
    probabilidades = modelo.predict_proba(X)

    clases = list(modelo.classes_)
    importancia = [
        {
            "variable": feature,
            "importancia": round(float(value), 6),
            "porcentaje": round(float(value * 100), 2),
        }
        for feature, value in zip(FEATURES, modelo.feature_importances_)
    ]
    importancia.sort(key=lambda x: x["importancia"], reverse=True)

    resultados = []
    for i, row in df.iterrows():
        probs = {
            clase: round(float(probabilidades[i][j] * 100), 2)
            for j, clase in enumerate(clases)
        }
        confianza = max(probs.values())
        resultados.append({
            "matricula": str(row["Matricula"]),
            "nombre": row["Nombre"],
            "grupo": row["Grupo"],
            "riesgo_predicho": str(predicciones[i]),
            "confianza": confianza,
            "probabilidades": probs,
            "variables": {
                "asistencia": float(row["Asistencia (%)"]),
                "tareas": float(row["Tareas"]),
                "parcial1": float(row["Parcial 1"]),
                "parcial2": float(row["Parcial 2"]),
                "parcial3": float(row["Parcial 3"]),
                "promedio": float(row["Promedio Final"]),
            },
        })

    salida = {
        "modelo": {
            "nombre": "Random Forest Classifier",
            "version": "1.0-prototipo",
            "variables_entrada": FEATURES,
            "variable_objetivo": TARGET,
            "n_registros": int(len(df)),
            "clases": clases,
            "importancia_variables": importancia,
            "evaluacion": evaluacion,
            "nota": "Datos simulados para fines académicos. No son datos institucionales reales.",
        },
        "predicciones": resultados,
    }

    OUTPUT_PATH.write_text(json.dumps(salida, ensure_ascii=False, indent=2), encoding="utf-8")

    print("=== EDUNEXIS | MACHINE LEARNING ===")
    print(f"Registros: {len(df)}")
    print(f"Variables: {', '.join(FEATURES)}")
    print(f"Modelo: Random Forest")
    print(f"Accuracy LOO: {evaluacion['accuracy']:.2%}")
    print(f"Balanced Accuracy LOO: {evaluacion['balanced_accuracy']:.2%}")
    print(f"F1 Macro LOO: {evaluacion['f1_macro']:.2%}")
    print("\nImportancia de variables:")
    for item in importancia:
        print(f"- {item['variable']}: {item['porcentaje']:.2f}%")
    print(f"\nPredicciones exportadas a: {OUTPUT_PATH}")


if __name__ == "__main__":
    entrenar_y_exportar()
