const alumnos = [
    "Juan Pérez",
    "María López",
    "Carlos García",
    "Ana Torres"
];

const tabla = document.getElementById("tabla-alumnos");

alumnos.forEach(nombre => {

    tabla.innerHTML += `
        <tr>
            <td>${nombre}</td>

            <td>
                <select>
                    <option>Presente</option>
                    <option>Ausente</option>
                </select>
            </td>
        </tr>
    `;
});

document
.getElementById("guardar")
.addEventListener("click", () => {

    alert("Asistencia guardada correctamente");

});

const dashboardBtn = document.getElementById("dashboard-btn");
const asistenciaBtn = document.getElementById("asistencia-btn");
const calificacionesBtn = document.getElementById("calificaciones-btn");
const riesgoBtn = document.getElementById("riesgo-btn");

const dashboardSection = document.getElementById("dashboard-section");
const asistenciaSection = document.getElementById("asistencia-section");
const calificacionesSection = document.getElementById("calificaciones-section");
const riesgoSection = document.getElementById("riesgo-section");

function ocultarTodo() {

    dashboardSection.style.display = "none";
    asistenciaSection.style.display = "none";
    calificacionesSection.style.display = "none";
    riesgoSection.style.display = "none";

}

dashboardBtn.addEventListener("click", () => {

    ocultarTodo();

    dashboardSection.style.display = "block";

});

asistenciaBtn.addEventListener("click", () => {

    ocultarTodo();

    asistenciaSection.style.display = "block";

});

calificacionesBtn.addEventListener("click", () => {

    ocultarTodo();

    calificacionesSection.style.display = "block";

});

riesgoBtn.addEventListener("click", () => {

    ocultarTodo();

    riesgoSection.style.display = "block";

});