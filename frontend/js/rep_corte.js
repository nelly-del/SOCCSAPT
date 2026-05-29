const datos = [

  {
    codigo:"001",
    desc:"Agua",
    pagos:10,
    recargos:50,
    descuentos:10,
    importe:500
  },

  {
    codigo:"002",
    desc:"Drenaje",
    pagos:5,
    recargos:20,
    descuentos:5,
    importe:200
  },

  {
    codigo:"003",
    desc:"Otros",
    pagos:8,
    recargos:30,
    descuentos:0,
    importe:300
  }

];


// =============================
// CARGAR TABLA
// =============================
function cargarTabla(lista = datos){

  const tbody =
  document.getElementById(
    "tabla-body"
  );

  tbody.innerHTML = "";

  let totalR = 0;
  let totalRec = 0;
  let totalDes = 0;

  lista.forEach(d => {

    totalR += d.importe;

    totalRec += d.recargos;

    totalDes += d.descuentos;

    tbody.innerHTML += `

      <tr>

        <td>${d.codigo}</td>

        <td>${d.desc}</td>

        <td>${d.pagos}</td>

        <td>$${d.recargos}</td>

        <td>$${d.descuentos}</td>

        <td>$${d.importe}</td>

      </tr>

    `;

  });

  document.getElementById(
    "totalRecaudado"
  ).innerText = "$" + totalR;

  document.getElementById(
    "totalRecargos"
  ).innerText = "$" + totalRec;

  document.getElementById(
    "totalDescuentos"
  ).innerText = "$" + totalDes;

}

cargarTabla();


// =============================
// MENU
// =============================
document.getElementById(
  "menu"
).onclick = ()=>{

  window.location.href =
  "menu.html";

};


// =============================
// REGRESAR
// =============================
document.getElementById(
  "regresar"
).onclick = ()=>{

  history.back();

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

    `Buscando información\n\n` +

    `Inicio: ${inicio}\n` +

    `Fin: ${fin}\n` +

    `Cajero: ${cajero}`

  );

};


// =============================
// IMPRIMIR
// =============================
document.getElementById(
  "imprimirBtn"
).onclick = ()=>{

  window.print();

};


// =============================
// IMPRIMIR CORTE
// =============================
document.getElementById(
  "imprimirCorteBtn"
).onclick = ()=>{

  alert(
    "Imprimiendo corte..."
  );

};


// =============================
// LIMPIAR
// =============================
document.getElementById(
  "limpiarBtn"
).onclick = ()=>{

  document.getElementById(
    "fechaInicio"
  ).value = "";

  document.getElementById(
    "fechaFinal"
  ).value = "";

  document.getElementById(
    "cajero"
  ).selectedIndex = 0;

  cargarTabla();

};


// =============================
// FORMATO MENSUAL
// =============================
document.getElementById(
  "formatoBtn"
).onclick = ()=>{

  alert(
    "Generando formato mensual..."
  );

};