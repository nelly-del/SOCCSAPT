document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;
//MODAL 1
  if (!correo || !contrasena) {

    mostrarModal("Completa todos los campos");

    return;
}
  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena })
    });

    const respuesta = await res.json(); // Ahora leemos JSON, no texto

    if (respuesta.exito) {
      // GUARDAMOS EL ROL Y EL NOMBRE PARA USARLOS DESPUÉS
      localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));
      localStorage.setItem("nombreUsuario", respuesta.usuario.nombre);

      mostrarModal("Bienvenido " + respuesta.usuario.nombre);
      setTimeout(() => {
      window.location.href = "menu.html";
      }, 2000);
    } else {
      mostrarModal(respuesta.mensaje);
      
    }
//ALERTA
  } catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor");
  }
});
//////////////////////////////////////////////////////
function mostrarModal(mensaje) {
  document.getElementById("textoModal").textContent = mensaje;
  document.getElementById("modal").style.display = "flex";
}
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}
////////////////////////////////////////////////////
 function mostrarModal(mensaje) {
  document.getElementById("textoModal").textContent = mensaje;
  document.getElementById("modal").style.display = "flex";
}
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}
///////////////////////////////////////////////////
function mostrarModal(mensaje) {
  document.getElementById("textoModal").textContent = mensaje;
  document.getElementById("modal").style.display = "flex";
}
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

localStorage.setItem(
  "usuario",
  JSON.stringify({
    id: respuesta.usuario.id,
    nombre: respuesta.usuario.nombre,
    rol: respuesta.usuario.rol,
    correo: correo
  })
);