import pandas as pd
from sklearn.tree import DecisionTreeClassifier

# LEER CSV
df = pd.read_csv("data/dataset_prediccion_escolar.csv")

# MOSTRAR PRIMERAS FILAS
print(df.head())

# VARIABLES DE ENTRADA
X = df[[
    "Asistencia (%)",
    "Tareas",
    "Parcial 1",
    "Parcial 2",
    "Parcial 3",
    "Promedio Final"
]]

# VARIABLE OBJETIVO
y = df["Nivel de Riesgo"]

# CREAR MODELO
modelo = DecisionTreeClassifier()

# ENTRENAR
modelo.fit(X, y)

# NUEVO ESTUDIANTE
nuevo_estudiante = pd.DataFrame([{
    "Asistencia (%)": 85,
    "Tareas": 80,
    "Parcial 1": 70,
    "Parcial 2": 75,
    "Parcial 3": 90,
    "Promedio Final": 78
}])

# PREDICCIÓN
resultado = modelo.predict(nuevo_estudiante)

print("Nivel de riesgo predicho:", resultado[0])