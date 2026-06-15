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