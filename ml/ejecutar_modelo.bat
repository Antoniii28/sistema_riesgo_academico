@echo off
cd /d "%~dp0"
echo ==========================================
echo EduNexis - Modelo de Machine Learning
echo ==========================================
python modelo_ml.py
if errorlevel 1 (
  echo.
  echo Hubo un error al ejecutar el modelo.
  pause
  exit /b 1
)
echo.
echo Predicciones generadas correctamente.
pause
