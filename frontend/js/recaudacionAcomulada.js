const datos = [

  {
    folio:1,
    codigo:"001",
    nombre:"Juan",
    contrato:"123",
    periodo:"Ene-Feb",
    meses:2,
    tarifa:200,
    recargos:20,
    descuentos:10
  },

  {
    folio:2,
    codigo:"002",
    nombre:"Ana",
    contrato:"456",
    periodo:"Mar-Abr",
    meses:2,
    tarifa:300,
    recargos:30,
    descuentos:20
  }

];


// =============================
// CARGAR TABLA
// =============================
function cargarTabla(lista = datos){

  let agua = 0;
  let totalRec = 0;
  let totalDesc = 0;
  let neto = 0;

  const tbody =
  document.getElementById(
    "tabla-body"
  );

  tbody.innerHTML = "";

  lista.forEach(d => {

    let totalRecargos =
    d.recargos * d.meses;

    let totalDescuentos =
    d.descuentos * d.meses;

    let servicio =
    d.tarifa * d.meses;

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

        <td>${d.meses}</td>

        <td>$${d.tarifa}</td>

        <td>$${d.recargos}</td>

        <td>$${totalRecargos}</td>

        <td>$${d.descuentos}</td>

        <td>$${totalDescuentos}</td>

        <td>$${servicio}</td>

        <td>$${importe}</td>

        <td>$${netoFila}</td>

      </tr>

    `;

  });

  document.getElementById(
    "agua"
  ).innerText = "$" + agua;

  document.getElementById(
    "recargos"
  ).innerText = "$" + totalRec;

  document.getElementById(
    "descuentos"
  ).innerText = "$" + totalDesc;

  document.getElementById(
    "neto"
  ).innerText = "$" + neto;

}

cargarTabla();


// =============================
// BOTON MENU
// =============================
document.getElementById(
  "menu"
).onclick = ()=>{

  window.location.href =
  "menu.html";

};


// =============================
// BUSCAR
// =============================
document.getElementById(
  "buscarBtn"
).onclick = ()=>{

  const inicio =
  document.getElementById(
    "fechaInicio"
  ).value;

  const fin =
  document.getElementById(
    "fechaFinal"
  ).value;

  const cajero =
  document.getElementById(
    "cajero"
  ).value;

  alert(

    `Buscando registros\n\n` +

    `Inicio: ${inicio}\n` +

    `Fin: ${fin}\n` +

    `Cajero: ${cajero}`

  );

};


// =============================
// DESCARGAR EXCEL
// =============================
document.getElementById(
  "descargarBtn"
).onclick = ()=>{

  const datosExcel = datos.map(d => ({

    Folio:d.folio,

    Codigo:d.codigo,

    Contribuyente:d.nombre,

    Contrato:d.contrato,

    Periodo:d.periodo,

    Meses:d.meses,

    Tarifa:d.tarifa,

    Recargos:d.recargos,

    TotalRecargos:
    d.recargos * d.meses,

    Descuentos:d.descuentos,

    TotalDescuentos:
    d.descuentos * d.meses,

    ServicioAgua:
    d.tarifa * d.meses,

    ImporteTotal:
    (d.tarifa * d.meses)
    +
    (d.recargos * d.meses),

    RecaudacionNeta:
    (
      (d.tarifa * d.meses)
      +
      (d.recargos * d.meses)
    )
    -
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

    "Recaudacion_Acumulada.xlsx"

  );

};