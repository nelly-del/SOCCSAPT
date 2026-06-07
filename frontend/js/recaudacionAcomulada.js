let datos = [];

// =============================
// OBTENER DATOS DE MYSQL
// =============================
async function obtenerDatos() {

  try {

    const respuesta =
      await fetch("http://localhost:3000/recaudacion");

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

  let agua = 0;
  let totalRec = 0;
  let totalDesc = 0;
  let neto = 0;

  const tbody =
    document.getElementById("tabla-body");

  tbody.innerHTML = "";

  lista.forEach(d => {

    const tarifa =
      Number(d.tarifa) || 0;

    const recargos =
      Number(d.recargos) || 0;

    const descuentos =
      Number(d.descuentos) || 0;

    const meses =
      Number(d.meses) || 0;

    let totalRecargos =
      recargos * meses;

    let totalDescuentos =
      descuentos * meses;

    let servicio =
      tarifa * meses;

    let importe =
      servicio + totalRecargos;

    let netoFila =
      importe - totalDescuentos;

    agua += servicio;
    totalRec += totalRecargos;
    totalDesc += totalDescuentos;
    neto += netoFila;

    tbody.innerHTML += `
      <tr>
        <td>${d.folio}</td>
        <td>${d.codigo}</td>
        <td>${d.nombre}</td>
        <td>${d.contrato}</td>
        <td>${d.periodo}</td>
        <td>${meses}</td>
        <td>$${tarifa.toFixed(2)}</td>
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

  document.getElementById("agua").innerText =
    "$" + agua.toFixed(2);

  document.getElementById("recargos").innerText =
    "$" + totalRec.toFixed(2);

  document.getElementById("descuentos").innerText =
    "$" + totalDesc.toFixed(2);

  document.getElementById("neto").innerText =
    "$" + neto.toFixed(2);

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

  window.location.href =
    "menu.html";

};

// =============================
// BUSCAR
// =============================
document.getElementById("buscarBtn").onclick = () => {

  const cajero =
    document.getElementById("cajero").value;

  if (
    cajero === "" ||
    cajero === "Seleccione"
  ) {

    cargarTabla(datos);
    return;

  }

  const filtrados =
    datos.filter(d =>
      d.cajero &&
      d.cajero.toLowerCase() ===
      cajero.toLowerCase()
    );

  cargarTabla(filtrados);

};

// =============================
// DESCARGAR EXCEL
// =============================
document.getElementById("descargarBtn").onclick = () => {

  const datosExcel =
    datos.map(d => ({

      Folio: d.folio,
      Codigo: d.codigo,
      Contribuyente: d.nombre,
      Contrato: d.contrato,
      Periodo: d.periodo,
      Meses: d.meses,
      Tarifa: d.tarifa,
      Recargos: d.recargos,

      TotalRecargos:
        d.recargos * d.meses,

      Descuentos:
        d.descuentos,

      TotalDescuentos:
        d.descuentos * d.meses,

      ServicioAgua:
        d.tarifa * d.meses,

      ImporteTotal:
        (d.tarifa * d.meses) +
        (d.recargos * d.meses),

      RecaudacionNeta:
        (
          (d.tarifa * d.meses) +
          (d.recargos * d.meses)
        ) -
        (d.descuentos * d.meses)

    }));

  const hoja =
    XLSX.utils.json_to_sheet(
      datosExcel
    );

  const libro =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    libro,
    hoja,
    "Recaudacion"
  );

  XLSX.writeFile(
    libro,
    "Recaudacion_Acomulada.xlsx"
  );

};