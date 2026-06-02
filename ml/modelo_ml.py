import pandas as pd
from sklearn.tree import DecisionTreeClassifier

# LEER CSV
df = pd.read_csv("data/dataset_prediccion_escolar.csv")

print("\n=== DATOS CARGADOS ===")
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

# NUEVOS ESTUDIANTES
nuevos_estudiantes = pd.DataFrame([
{
    "Nombre": "Alumno Excelente",
    "Asistencia (%)": 95,
    "Tareas": 90,
    "Parcial 1": 92,
    "Parcial 2": 94,
    "Parcial 3": 91,
    "Promedio Final": 92
},
{
    "Nombre": "Alumno Regular",
    "Asistencia (%)": 80,
    "Tareas": 75,
    "Parcial 1": 70,
    "Parcial 2": 75,
    "Parcial 3": 78,
    "Promedio Final": 75
},
{
    "Nombre": "Alumno Riesgo",
    "Asistencia (%)": 55,
    "Tareas": 50,
    "Parcial 1": 45,
    "Parcial 2": 50,
    "Parcial 3": 40,
    "Promedio Final": 48
}
])

# SOLO LAS VARIABLES DEL MODELO
datos_prediccion = nuevos_estudiantes[[
    "Asistencia (%)",
    "Tareas",
    "Parcial 1",
    "Parcial 2",
    "Parcial 3",
    "Promedio Final"
]]

# PREDICCIÓN
resultados = modelo.predict(datos_prediccion)

# AGREGAR RESULTADO A LA TABLA
nuevos_estudiantes["Riesgo Predicho"] = resultados

def semaforo(riesgo):
    if riesgo == "Bajo":
        return "🟢 Bajo"
    elif riesgo == "Medio":
        return "🟡 Medio"
    else:
        return "🔴 Alto"

nuevos_estudiantes["Nivel Visual"] = (
    nuevos_estudiantes["Riesgo Predicho"]
    .apply(semaforo)
)

print("\n=== REPORTE FINAL ===")

print(nuevos_estudiantes[[
    "Asistencia (%)",
    "Tareas",
    "Promedio Final",
    "Nivel Visual"
]])