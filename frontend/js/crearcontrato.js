//BUSCAR CONTRIBUYENTE
document.getElementById("buscador").onclick = () => {

  window.location.href = "listado_cont.html";

};
// REGRESAR
document.getElementById("regresar").onclick = () => {

  window.location.href = "contratos.html";

};

// Variable para almacenar el nombre temporalmente mientras se edita el formulario
let nombreCompletoContribuyente = "";

// --- EVENTO: TRAER DATOS AUTOMÁTICAMENTE AL ESCRIBIR EL CÓDIGO ---
document.getElementById("codigo_contribuyente").addEventListener("change", async () => {
  const codigo = document.getElementById("codigo_contribuyente").value.trim();
  
  if (!codigo) return;

  try {
    const res = await fetch(`http://localhost:3000/buscar-contribuyente/${codigo}`);
    const data = await res.json();

    if (data) {
      // Guardamos el nombre completo en nuestra variable
      nombreCompletoContribuyente = data.nombre_completo;

      // Autocompletamos los campos del Domicilio del Contribuyente
      document.getElementById("estado").value = data.estado || "Tlaxcala";
      document.getElementById("municipio").value = data.municipio || "";
      document.getElementById("localidad").value = data.localidad || "";
      document.getElementById("colonia").value = data.colonia || "";
      document.getElementById("calle").value = data.calle || "";
      document.getElementById("numExt").value = data.numero_exterior || "";
      document.getElementById("numInt").value = data.numero_interior || "";
      document.getElementById("cp").value = data.cp || "";
      
      console.log("Contribuyente cargado:", nombreCompletoContribuyente);
    } else {
      alert("No se encontró ningún contribuyente con ese código.");
      nombreCompletoContribuyente = "";
    }
  } catch (error) {
    console.error("Error al buscar de forma automática:", error);
  }
});

// --- EVENTO: GUARDAR EL CONTRATO ---
document.getElementById("guardar").addEventListener("click", async () => {
  
  // Validación de seguridad previa
  const codigoContribuyente = document.getElementById("codigo_contribuyente").value;
  if (!codigoContribuyente || !nombreCompletoContribuyente) {
    mostrarModal("Por favor, introduce un código de contribuyente válido primero.");
    return;
  }

  const datos = {
    codigo_contribuyente: codigoContribuyente,
    nombre_contribuyente: nombreCompletoContribuyente, // Pasamos el nombre recuperado de la BD
    id_contrato: document.getElementById("id_contrato").value,
    descripcion: document.getElementById("descripcion").value,
    fecha: document.getElementById("fecha").value,
    contrato_anterior: document.getElementById("contrato_anterior").value,
    bomba: document.getElementById("bomba").value,
    tipo_uso: document.getElementById("tipo_uso").value,
    unidad: document.getElementById("unidad").value
  };

  try {
    const res = await fetch("http://localhost:3000/guardar-contrato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const respuesta = await res.text();
    mostrarModal(respuesta);

    if (res.ok && respuesta.includes("correctamente")) {
      // Opcional: Limpiar el formulario o redirigir tras guardar con éxito
      setTimeout(() => { window.location.href = "contratos.html"; }, 1500);
    }

  } catch (error) {
    mostrarModal("Error al conectar con el servidor.");
  }
});

// MODAL CONTROLES
function mostrarModal(mensaje) {
  document.getElementById("textoModal").textContent = mensaje;
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}