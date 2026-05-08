
// Cargar usuarios
async function cargarUsuarios() {

  const res = await fetch("http://localhost:3000/usuarios");
  const data = await res.json();

  const tabla = document.getElementById("tablaBody");
  tabla.innerHTML = "";

  data.forEach((u, i) => {
    tabla.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${u.usuario}</td>
        <td>${u.correo}</td>
      </tr>
    `;
  });

  document.getElementById("infoUsuarios").textContent =
    `Existen ${data.length} registros en total`;
}

cargarUsuarios();


// BUSCADOR
document.getElementById("buscar").addEventListener("input", (e) => {

  const texto = e.target.value.toLowerCase();
  const filas = document.querySelectorAll("#tablaBody tr");

  filas.forEach(fila => {
    const contenido = fila.textContent.toLowerCase();

    fila.style.display = contenido.includes(texto) ? "" : "none";
  });

});

// MENÚ
document.getElementById("menu").onclick = () => {
  window.location.href = "menu.html";
};
// nuevo
document.getElementById("nuevo").onclick = () => {
  window.location.href = "registrousers.html";
};