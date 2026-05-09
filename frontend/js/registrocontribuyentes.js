
//Registro
let propietario = null;
let contrato = null;


document.getElementById("propSi").onclick = () => {
  propietario = true;
  document.getElementById("propSi").style.background = "green";
  document.getElementById("propNo").style.background = "";
};

document.getElementById("propNo").onclick = () => {
  propietario = false;
  document.getElementById("propNo").style.background = "red";
  document.getElementById("propSi").style.background = "";
};

document.getElementById("contSi").onclick = () => {
  contrato = true;
  document.getElementById("contSi").style.background = "green";
  document.getElementById("contNo").style.background = "";
};

document.getElementById("contNo").onclick = () => {
  contrato = false;
  document.getElementById("contNo").style.background = "red";
  document.getElementById("contSi").style.background = "";
};


document.getElementById("guardar").addEventListener("click", async () => {

  const datos = {
    codigo: document.getElementById("codigo").value,
    apellidoP: document.getElementById("apellidoP").value,
    apellidoM: document.getElementById("apellidoM").value,
    nombre: document.getElementById("nombre").value,
    estado: document.getElementById("estado").value,
    municipio: document.getElementById("municipio").value,
    localidad: document.getElementById("localidad").value,
    colonia: document.getElementById("colonia").value,
    calle: document.getElementById("calle").value,
    numExt: document.getElementById("numExt").value,
    numInt: document.getElementById("numInt").value,
    cp: document.getElementById("cp").value,
    razon: document.getElementById("razon").value,
    rfc: document.getElementById("rfc").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    regimen: document.getElementById("regimen").value,
    propietario: propietario,
    contrato: contrato
  };

  if (!datos.nombre || !datos.apellidoP) {
    mostrarModal("Faltan datos obligatorios");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const respuesta = await res.text();
    mostrarModal(respuesta);

  } catch (error) {
    mostrarModal("Error al conectar con el servidor");
  }
});


document.getElementById("cancelar").addEventListener("click", () => {

  abrirModalConfirmacion(
    "¿Seguro que quieres cancelar el registro?",
    
    () => {

      document.getElementById("formulario").reset();

      propietario = null;
      contrato = null;

      document.getElementById("propSi").style.background = "";
      document.getElementById("propNo").style.background = "";
      document.getElementById("contSi").style.background = "";
      document.getElementById("contNo").style.background = "";

      mostrarModal("Formulario cancelado");

    }
  );

});

// Función para abrir el modal
document.getElementById('menu').addEventListener('click', (e) => {
    e.preventDefault(); 
    document.getElementById('modalMenu').style.display = 'flex';
});

// Función para cerrar el modal si el usuario decide quedarse
function cerrarModalMenu() {
    document.getElementById('modalMenu').style.display = 'none';
}

// Función para redireccionar finalmente
function irAlMenu() {
    window.location.href = "menu.html"; 
}
//////////////// MODAL NORMAL //////////////////

function mostrarModal(mensaje) {

  document.getElementById("textoModal").textContent = mensaje;

  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {

  document.getElementById("modal").style.display = "none";
}

//////////////// MODAL CONFIRMACION //////////////////

function abrirModalConfirmacion(texto, callback) {

  document.getElementById("modalConfirmacion").style.display = "flex";

  document.getElementById("textoConfirmacion").textContent = texto;

  document.getElementById("btnAceptar").onclick = () => {

    cerrarModalConfirmacion();

    callback();
  };
}

function cerrarModalConfirmacion() {

  document.getElementById("modalConfirmacion").style.display = "none";
}