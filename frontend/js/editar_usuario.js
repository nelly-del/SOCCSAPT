// OBTENER ID URL

const params =
new URLSearchParams(
  window.location.search
);

const id = params.get("id");

// CARGAR ROLES

async function cargarRoles(){

  const res = await fetch(
    "http://localhost:3000/roles"
  );

  const data = await res.json();

  const select =
  document.getElementById("rol");

  select.innerHTML = "";

  data.forEach(r => {

    select.innerHTML += `

      <option value="${r.id_rol}">
        ${r.nombre_rol}
      </option>

    `;

  });

}

// CARGAR USUARIO

async function cargarUsuario(){

  const res = await fetch(
    `http://localhost:3000/usuario/${id}`
  );

  const data = await res.json();

  document.getElementById(
    "usuario"
  ).value = data.usuario;

  document.getElementById(
    "correo"
  ).value = data.correo;

  document.getElementById(
    "contrasena"
  ).value = data.contrasena;

  document.getElementById(
    "rol"
  ).value = data.id_rol;

}

// GUARDAR CAMBIOS

document.getElementById(
  "guardarCambios"
).onclick = async ()=>{

  const usuario =
  document.getElementById(
    "usuario"
  ).value;

  const correo =
  document.getElementById(
    "correo"
  ).value;

  const contrasena =
  document.getElementById(
    "contrasena"
  ).value;

  const id_rol =
  document.getElementById(
    "rol"
  ).value;

  await fetch(

    "http://localhost:3000/editar-usuario",

    {

      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        id_usuario:id,
        usuario,
        correo,
        contrasena,
        id_rol

      })

    }

  );

  // MOSTRAR MODAL
  mostrarModal(
    "Datos actualizados correctamente"
  );
// REDIRECCIONAR
  setTimeout(()=>{

    window.location.href =
    "usuarios.html";

  },2000);

};

// MODAL

function mostrarModal(mensaje){

  document.getElementById(
    "textoModal"
  ).textContent = mensaje;

  document.getElementById(
    "modal"
  ).style.display = "flex";

}

function cerrarModal(){

  document.getElementById(
    "modal"
  ).style.display = "none";

}

// INICIO

cargarRoles();
cargarUsuario();