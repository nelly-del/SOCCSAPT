const modulos = [
  "Contratos",
  "Contribuyentes",
  "Pagos",
  "Reportes",
  "Corte",
  "Estado de cuenta"
];

//  cargar usuarios
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

// guardar permisos
document.getElementById("guardar")
.addEventListener("click", async ()=>{

  const id_rol = document.getElementById("usuarioSelect").value;

  if(!id_rol){
    mostrarModal("Selecciona un rol");
    return;
  }

  let permisos = [];
  modulos.forEach(mod => {
    permisos.push({
      modulo: mod,

      ver:
      document.querySelector(
        `[data-mod="${mod}"][data-perm="ver"]`
      ).checked ? 1 : 0,

      nuevo:
      document.querySelector(
        `[data-mod="${mod}"][data-perm="nuevo"]`
      ).checked ? 1 : 0,

      editar:
      document.querySelector(
        `[data-mod="${mod}"][data-perm="editar"]`
      ).checked ? 1 : 0,

      eliminar:
      document.querySelector(
        `[data-mod="${mod}"][data-perm="eliminar"]`
      ).checked ? 1 : 0

    });

  });

  await fetch(

    "http://localhost:3000/permisos",

    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({
        id_rol,
        permisos

      })
    }
  );

  mostrarModal(
    "Permisos guardados"
  );

});

//ROLES
async function cargarRoles(){
  const res = await fetch("http://localhost:3000/roles");
  const data = await res.json();
  const select = document.getElementById("usuarioSelect");

  select.innerHTML = `
    <option value="">
      Selecciona un rol
    </option>
  `;

  data.forEach(r => {
    select.innerHTML += `
      <option value="${r.id_rol}">
        ${r.nombre_rol}
      </option>
    `;
  });
}
cargarRoles();
crearTabla();
// FUNCIONES MODAL
function mostrarModal(mensaje){
  document.getElementById("textoModal").textContent = mensaje;
  document.getElementById("modal").style.display = "flex";
}
function cerrarModal(){
  document.getElementById(
    "modal"
  ).style.display = "none";
}

window.onclick = function(event){

  const modal =
  document.getElementById("modal");

  if(event.target == modal){

    cerrarModal();

  }

}