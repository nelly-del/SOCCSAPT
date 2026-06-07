let paginaActual = 1;
let modoCancelar = false;
let contratoSeleccionado = null;

// =============================
// CARGAR CONTRATOS
// =============================
async function cargarContratos(pagina = 1) {
  const res = await fetch(`http://localhost:3000/contratos?pagina=${pagina}`);
  const data = await res.json();
  const tabla = document.getElementById("tablaContratos");
  tabla.innerHTML = "";

  const encabezado = document.querySelector("thead tr");
  encabezado.innerHTML = `
    ${modoCancelar ? "<th></th>" : ""}
    <th>Contrato</th>
    <th>Código</th>
    <th>Contribuyente</th>
    <th>Último pago</th>
    <th>Mes inicio</th>
    <th>Mes fin</th>
    <th>Creación contrato</th>
    <th>Unidad</th>
    <th>Estatus</th>
    <th>Bomba</th>
    <th>Tipo de uso</th>
  `;

  data.datos.forEach(c => {
    const checkbox = modoCancelar
      ? `<td><input type="checkbox" class="chk-cancelar" value="${c.id_contrato}"></td>`
      : "";

    tabla.innerHTML += `
      <tr>
        ${checkbox}
        <td>${c.id_contrato}</td>
        <td>${c.codigo_contribuyente}</td>
        <td>${c.nombre || ""}</td>
        <td>${c.ultimo_pago ? c.ultimo_pago.split("T")[0] : "—"}</td>
        <td>${c.pago_mes_inicio ? c.pago_mes_inicio.split("T")[0] : "—"}</td>
        <td>${c.pago_mes_fin   ? c.pago_mes_fin.split("T")[0]   : "—"}</td>
        <td>${c.creacion_contrato ? c.creacion_contrato.split("T")[0] : ""}</td>
        <td>${c.unidad || ""}</td>
        <td>
          <button class="${c.estatus == 1 ? 'activo' : 'inactivo'} btn-estatus"
            onclick="cambiarEstatus(${c.id_contrato})">
            ${c.estatus == 1 ? 'Vigente' : 'Cancelado'}
          </button>
        </td>
        <td>${c.bomba || ""}</td>
        <td>${c.tipo_de_uso || ""}</td>
      </tr>
    `;
  });

  document.getElementById("infoRegistros").textContent = `Existen ${data.total} registros en total`;
  generarPaginacion(data.total, pagina);
}

// =============================
// PAGINACION
// =============================
function generarPaginacion(total, pagina) {
  const contenedor = document.querySelector(".paginacion");
  contenedor.innerHTML = "";
  const totalPaginas = Math.ceil(total / 10);
  for (let i = 1; i <= totalPaginas; i++) {
    contenedor.innerHTML += `<span onclick="cargarContratos(${i})" class="${i === pagina ? 'activo' : ''}">${i}</span>`;
  }
}

cargarContratos();

// =============================
// REDIRECCIONES
// =============================
document.getElementById("menu").onclick = () => { window.location.href = "menu.html"; };
document.getElementById("contribuyentes").onclick = () => { window.location.href = "listado_cont.html"; };
document.getElementById("pagos").onclick = () => { window.location.href = "pagos.html"; };
document.getElementById("recargos").onclick = () => { window.location.href = "recaudacion.html"; };
document.getElementById("agregarcontrato").onclick = () => { window.location.href = "crearcontrato.html"; };
document.getElementById("editar").onclick = () => { window.location.href = "modificar_contrato.html"; };
document.getElementById("pago").onclick = () => { window.location.href = "recibos.html"; };

document.getElementById("editar").onclick = ()=>{

  window.location.href = "Modificar_contrato.html";

};


// =============================
// EXCEL
// =============================
document.getElementById("excel").onclick = generarExcel;

async function generarExcel() {
  const res = await fetch("http://localhost:3000/contratos-todos");
  const data = await res.json();
  const datos = data.map(c => ({
    Contrato: c.id_contrato,
    Contribuyente: c.codigo_contribuyente,
    Nombre: c.nombre,
    UltimoPago: c.ultimo_pago,
    MesInicio: c.pago_mes_inicio || "",
    MesFin: c.pago_mes_fin || "",
    CreacionContrato: c.creacion_contrato,
    Unidad: c.unidad,
    Estatus: c.estatus == 1 ? "Vigente" : "Cancelado",
    Bomba: c.bomba,
    TipoUso: c.tipo_de_uso
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contratos");
  XLSX.writeFile(wb, "Reporte_General_Contratos.xlsx");
}

// =============================
// BOTON CANCELAR
// =============================
document.getElementById("cancelar").addEventListener("click", async () => {
  if (!modoCancelar) {
    modoCancelar = true;
    document.getElementById("cancelar").innerHTML = `<i class="fa-solid fa-check"></i> Seleccionar contrato`;
    cargarContratos();
    return;
  }

  const seleccionados = document.querySelectorAll(".chk-cancelar:checked");
  if (seleccionados.length === 0) { mostrarModal("Selecciona un contrato"); return; }
  if (seleccionados.length > 1)  { mostrarModal("Solo puedes cancelar un contrato"); return; }

  contratoSeleccionado = seleccionados[0].value;
  const fila = seleccionados[0].closest("tr");

  document.getElementById("modalContrato").textContent = fila.children[modoCancelar ? 1 : 0].textContent;
  document.getElementById("modalNombre").textContent   = fila.children[modoCancelar ? 3 : 2].textContent;
  document.getElementById("modalEstatus").textContent  = fila.children[modoCancelar ? 9 : 8].querySelector("button")?.textContent || "";

  try {
    const validar = await fetch(`http://localhost:3000/validar-adeudos/${contratoSeleccionado}`);
    const resultado = await validar.json();
    const adeudos = document.getElementById("modalAdeudos");
    if (resultado.tieneAdeudos) {
      adeudos.textContent = "Tiene adeudos pendientes";
      adeudos.className = "conAdeudos";
      document.getElementById("confirmarCancelacion").disabled = true;
    } else {
      adeudos.textContent = "Sin adeudos pendientes";
      adeudos.className = "sinAdeudos";
      document.getElementById("confirmarCancelacion").disabled = false;
    }
  } catch (error) {
    document.getElementById("modalAdeudos").textContent = "No se pudo validar";
  }
  document.getElementById("modalCancelar").style.display = "flex";
});


document.getElementById("confirmarCancelacion").onclick = async () => {
  const motivo = document.getElementById("motivoCancelacion").value;
  console.log("Contrato:", contratoSeleccionado);
  console.log("Motivo:", motivo);
  if (motivo.trim() === "") { mostrarModal("Escribe un motivo"); return; }
  
  await fetch("http://localhost:3000/cambiar-estatus-contrato", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_contrato: contratoSeleccionado, estatus: 0 })
  });
  cerrarModalCancelar();
  mostrarModal("Contrato cancelado correctamente");
  cargarContratos();
};

function cerrarModalCancelar() {
  document.getElementById("modalCancelar").style.display = "none";
  document.getElementById("motivoCancelacion").value = "";
  contratoSeleccionado = null;
  modoCancelar = false;
  document.getElementById("cancelar").innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Cancelar contrato`;
  cargarContratos();
}

function mostrarModal(mensaje) { alert(mensaje); }


/*
async function cambiarEstatus(id) {
  if (!confirm("¿Deseas cambiar el estatus del contrato?")) return;
  try {
    const res = await fetch("http://localhost:3000/cambiar-estatus-contrato", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_contrato: id, estatus: 1 })
    });
    const mensaje = await res.text();
    mostrarModal(mensaje);
    cargarContratos();
  } catch (error) {
    mostrarModal("Error al cambiar estatus");
  }
}
*/