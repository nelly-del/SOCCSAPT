document.getElementById("formRegistro").addEventListener("submit", async (e) => {

  e.preventDefault();

  console.log("Formulario enviado");

  const usuario = document.getElementById("usuario").value;
  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;
  const confirmar = document.getElementById("confirmar").value;
  const id_rol = document.getElementById("id_rol").value;

  // Validación básica
  if (contrasena !== confirmar) {

    mostrarModal("Las contraseñas no coinciden");
    return;

  }

  const datos = {
    usuario,
    correo,
    contrasena,
    id_rol
  };

  try {

    const res = await fetch("http://localhost:3000/registro", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(datos)

    });

    const respuesta = await res.json();

    if (respuesta.exito) {

      //MODAL
      mostrarModal(
        "Usuario registrado con éxito. No olvides asignar permisos."
      );
      setTimeout(() => {
        window.location.href = "permisos.html";
      }, 2000);

    } else {

      mostrarModal("Error: " + respuesta.mensaje);

    }

  } catch (error) {
    mostrarModal("Error de conexión con el servidor");
  }

});
//Funciones
function mostrarModal(mensaje) {

  document.getElementById("textoModal").textContent = mensaje;

  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {

  document.getElementById("modal").style.display = "none";

}