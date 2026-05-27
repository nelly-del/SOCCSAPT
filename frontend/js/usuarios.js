
let modoEliminar = false;
// Cargar usuarios
async function cargarUsuarios() {

  const res = await fetch("http://localhost:3000/usuarios");
  const data = await res.json();

  const tabla = document.getElementById("tablaBody");
  tabla.innerHTML = "";

  data.forEach((u, i) => {
   tabla.innerHTML += `
<tr>
  <td>

  ${
    modoEliminar
    ?

    `
    <input type="checkbox"class="chk-usuario" value="${u.id_usuario}">

    `
    :
    ""
  }

  </td>

  <td>${i + 1}</td>
  <td>${u.usuario}</td>
  <td>${u.correo}</td>
  <td>${u.nombre_rol}</td>
 
  <td>

    <button
    class="btn-editar"
    onclick="editarusuario(${u.id_usuario})">
    <i class="fa-solid fa-pen"></i>
    Editar
    </button>
  </td>
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
// ver
document.getElementById("ver").onclick = () => {
  window.location.href = "permisos.html";
};

let usuarioEliminar = null;

// boton eliminar
document.getElementById(
  "eliminar"
).onclick = ()=>{

  // ACTIVAR MODO
  if(!modoEliminar){

    modoEliminar = true;

    cargarUsuarios();

    document.getElementById(
      "eliminar"
    ).innerHTML = `
    
      <i class="fa-solid fa-check"></i>
      Confirmar eliminación
    
    `;

    return;

  }

  // OBTENER CHECKBOX
  const seleccionados =
  document.querySelectorAll(
    ".chk-usuario:checked"
  );

  if(seleccionados.length === 0){

    mostrarModal(
      "Selecciona un usuario"
    );

    return;

  }

  if(seleccionados.length > 1){

    mostrarModal(
      "Solo puedes eliminar uno"
    );

    return;

  }

  usuarioEliminar =
  seleccionados[0].value;

  document.getElementById(
    "modalEliminar"
  ).style.display = "flex";

};
// CONFIRMAR
document.getElementById(
  "confirmarEliminar"
).onclick = async ()=>{
  await fetch(
    "http://localhost:3000/eliminar-usuario",
    {
      method:"DELETE",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        id_usuario:
        usuarioEliminar
      })
    }
  );

  cerrarModalEliminar();
  mostrarModal(
    "Usuario eliminado"
  );
  cargarUsuarios();
};

// CERRAR

function cerrarModalEliminar(){
  document.getElementById(
    "modalEliminar"
  ).style.display = "none";
}
//Editar usuario
function editarusuario(id){

  window.location.href =
  `editar_usuarios.html?id=${id}`;

}

