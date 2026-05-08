const modulos = [
  "Contratos",
  "Contribuyentes",
  "Pagos",
  "Reportes",
  "Corte",
  "Estado de cuenta"
];

// 🔽 cargar usuarios
async function cargarUsuarios() {
  const res = await fetch("http://localhost:3000/usuarios");
  const data = await res.json();
  const select = document.getElementById("usuarioSelect");
  
  select.innerHTML = '<option value="">Seleccione al usuario</option>';
  data.forEach(u => {
    // Es vital que el value sea el ID_USUARIO
    select.innerHTML += `<option value="${u.id_usuario}">${u.usuario} (${u.correo})</option>`;
  });
}
// 🔽 crear tabla permisos
function crearTabla() {
  const tabla = document.getElementById("tablaPermisos");
  tabla.innerHTML = "";

  modulos.forEach((mod, i) => {
    tabla.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${mod}</td>
        <td><input type="checkbox" data-mod="${mod}" data-perm="nuevo"></td>
        <td><input type="checkbox" data-mod="${mod}" data-perm="editar"></td>
        <td><input type="checkbox" data-mod="${mod}" data-perm="eliminar"></td>
        <td><input type="checkbox" data-mod="${mod}" data-perm="ver"></td>
      </tr>
    `;
  });
}

// 🔽 guardar permisos
document.getElementById("guardar").addEventListener("click", async () => {

  const usuario = document.getElementById("usuarioSelect").value;

  if (!usuario) {
    alert("Selecciona un usuario");
    return;
  }

  const checks = document.querySelectorAll("input[type='checkbox']");

  let permisos = [];

  checks.forEach(chk => {
    if (chk.checked) {
      permisos.push({
        modulo: chk.dataset.mod,
        permiso: chk.dataset.perm
      });
    }
  });

  await fetch("http://localhost:3000/permisos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario,
      permisos
    })
  });

  alert("Permisos guardados");
});

// init
cargarUsuarios();
crearTabla();
