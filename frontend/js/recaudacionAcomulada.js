let datos = [];

// =============================
// OBTENER DATOS DE MYSQL
// =============================
async function obtenerDatos() {
  try {
    const respuesta = await fetch("http://localhost:3000/recaudacion");
    datos = await respuesta.json();
    cargarTabla(datos);
  } catch (error) {
    console.error(error);
    alert("Error al cargar datos");
  }
}

// =============================
// CARGAR TABLA
// =============================
function cargarTabla(lista = datos) {
  let agua      = 0;
  let totalRec  = 0;
  let totalDesc = 0;
  let neto      = 0;

  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  lista.forEach(d => {
    const importe    = Number(d.importe)    || 0;
    const recargos   = Number(d.recargos)   || 0;
    const descuentos = Number(d.descuentos) || 0;
    const meses      = Number(d.meses)      || 0;

    const servicio        = importe - recargos;
    const totalRecargos   = recargos;
    const totalDescuentos = descuentos;
    const netoFila        = importe - totalDescuentos;

    agua      += servicio;
    totalRec  += totalRecargos;
    totalDesc += totalDescuentos;
    neto      += netoFila;

    tbody.innerHTML += `
      <tr>
        <td>${d.folio}</td>
        <td>${d.codigo}</td>
        <td>${d.nombre}</td>
        <td>${d.contrato}</td>
        <td>${d.periodo}</td>
        <td>${meses}</td>
        <td>$${servicio.toFixed(2)}</td>
        <td>$${recargos.toFixed(2)}</td>
        <td>$${totalRecargos.toFixed(2)}</td>
        <td>$${descuentos.toFixed(2)}</td>
        <td>$${totalDescuentos.toFixed(2)}</td>
        <td>$${servicio.toFixed(2)}</td>
        <td>$${importe.toFixed(2)}</td>
        <td>$${netoFila.toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("agua").innerText        = "$" + agua.toFixed(2);
  document.getElementById("recargos").innerText    = "$" + totalRec.toFixed(2);
  document.getElementById("descuentos").innerText  = "$" + totalDesc.toFixed(2);
  document.getElementById("neto").innerText        = "$" + neto.toFixed(2);
}

// =============================
// INICIAR
// =============================
window.onload = () => {
  obtenerDatos();
};

// =============================
// MENU
// =============================
document.getElementById("menu").onclick = () => {
  window.location.href = "menu.html";
};

// =============================
// BUSCAR
// =============================
document.getElementById("buscarBtn").onclick = async () => {
  const fechaInicio = document.getElementById("fechaInicio")?.value || "";
  const fechaFinal  = document.getElementById("fechaFinal")?.value  || "";
  const cajero      = document.getElementById("cajero").value;

  const params = new URLSearchParams();
  if (fechaInicio) params.append("inicio", fechaInicio);
  if (fechaFinal)  params.append("fin", fechaFinal);
  if (cajero && cajero !== "Seleccione") params.append("cajero", cajero);

  try {
    const res  = await fetch(`http://localhost:3000/recaudacion?${params}`);
    const data = await res.json();
    cargarTabla(data);
  } catch (error) {
    console.error(error);
    alert("Error al buscar");
  }
};

// =============================
// DESCARGAR EXCEL
// =============================
document.getElementById("descargarBtn").onclick = () => {
  const datosExcel = datos.map(d => {
    const importe    = Number(d.importe)    || 0;
    const recargos   = Number(d.recargos)   || 0;
    const descuentos = Number(d.descuentos) || 0;
    const meses      = Number(d.meses)      || 0;
    const servicio   = importe - recargos;

    return {
      Folio:            d.folio,
      Codigo:           d.codigo,
      Contribuyente:    d.nombre,
      Contrato:         d.contrato,
      Periodo:          d.periodo,
      Meses:            meses,
      ServicioAgua:     servicio.toFixed(2),
      Recargos:         recargos.toFixed(2),
      TotalRecargos:    recargos.toFixed(2),
      Descuentos:       descuentos.toFixed(2),
      TotalDescuentos:  descuentos.toFixed(2),
      ImporteTotal:     importe.toFixed(2),
      RecaudacionNeta:  (importe - descuentos).toFixed(2)
    };
  });

  const hoja  = XLSX.utils.json_to_sheet(datosExcel);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Recaudacion");
  XLSX.writeFile(libro, "Recaudacion_Acumulada.xlsx");
};