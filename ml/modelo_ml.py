import pandas as pd
from sklearn.tree import DecisionTreeClassifier

# LEER CSV
df = pd.read_csv("data/dataset_prediccion_escolar.csv")

# MOSTRAR PRIMERAS FILAS
print(df.head())

print("\nCantidad de estudiantes:", len(df))

# VARIABLES DE ENTRADA
X = df[[
    "Asistencia (%)",
    "Tareas",
    "Parcial 1",
    "Parcial 2",
    "Parcial 3",
    "Promedio Final"
]]

print("\nVariables utilizadas:")
print(X.columns.tolist())

# VARIABLE OBJETIVO
y = df["Nivel de Riesgo"]

# CREAR MODELO
modelo = DecisionTreeClassifier()

# ENTRENAR
modelo.fit(X, y)

# NUEVO ESTUDIANTE
nuevo_estudiante = pd.DataFrame([{
    "Asistencia (%)": 95,
    "Tareas": 90,
    "Parcial 1": 92,
    "Parcial 2": 94,
    "Parcial 3": 91,
    "Promedio Final": 92
},
{
    "Asistencia (%)": 80,
    "Tareas": 75,
    "Parcial 1": 70,
    "Parcial 2": 75,
    "Parcial 3": 78,
    "Promedio Final": 75
},
{
    "Asistencia (%)": 55,
    "Tareas": 50,
    "Parcial 1": 45,
    "Parcial 2": 50,
    "Parcial 3": 40,
    "Promedio Final": 48
}

])

# PREDICCIÓN
resultados = modelo.predict(nuevo_estudiante)

print("\nRESULTADOS:")

for i, riesgo in enumerate(resultados):
    print(f"Estidiante {i+1}: {riesgo}")