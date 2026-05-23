import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# -------------------------
# DATOS SIMULADOS
# -------------------------

datos = {
    "promedio": [95, 70, 50, 85, 40, 60, 90, 30, 75, 55],
    "asistencia": [95, 80, 60, 90, 50, 70, 98, 40, 85, 65],
    "riesgo": [
        "Bajo",
        "Medio",
        "Alto",
        "Bajo",
        "Alto",
        "Medio",
        "Bajo",
        "Alto",
        "Medio",
        "Alto"
    ]
}

df = pd.DataFrame(datos)

# -------------------------
# VARIABLES
# -------------------------

X = df[["promedio", "asistencia"]]
y = df["riesgo"]

# -------------------------
# DIVIDIR DATOS
# -------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------
# MODELO
# -------------------------

modelo = DecisionTreeClassifier()

modelo.fit(X_train, y_train)

# -------------------------
# PREDICCIONES
# -------------------------

predicciones = modelo.predict(X_test)

# -------------------------
# PRECISIÓN
# -------------------------

precision = accuracy_score(y_test, predicciones)

print("Precisión del modelo:", precision)

# -------------------------
# NUEVO ESTUDIANTE
# -------------------------

nuevo_estudiante = [[65, 70]]

resultado = modelo.predict(nuevo_estudiante)

print("Nivel de riesgo:", resultado[0])