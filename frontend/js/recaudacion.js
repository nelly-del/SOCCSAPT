const datos = [
  {
    folio: 1,
    codigo: "001",
    nombre: "Juan",
    contrato: "123",
    periodo: "Ene-Feb",
    meses: 2,
    tarifa: 200,
    recargos: 20,
    descuentos: 10
  },
  {
    folio: 2,
    codigo: "002",
    nombre: "Ana",
    contrato: "456",
    periodo: "Mar-Abr",
    meses: 2,
    tarifa: 300,
    recargos: 30,
    descuentos: 20
  }
];

// ==================== CARGAR TABLA ====================
function cargarTabla(lista = datos) {

  let subtotal = 0;
  let agua = 0;
  let totalRec = 0;
  let totalDesc = 0;
  let neto = 0;

  const tbody = document.getElementById("tabla-body");

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

    subtotal += importe;
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
        <td>$${d.tarifa.toFixed(2)}</td>
        <td>$${d.recargos.toFixed(2)}</td>
        <td>$${totalRecargos.toFixed(2)}</td>
        <td>$${d.descuentos.toFixed(2)}</td>
        <td>$${totalDescuentos.toFixed(2)}</td>
        <td>$${servicio.toFixed(2)}</td>
        <td>$${importe.toFixed(2)}</td>
        <td>$${netoFila.toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("subtotal").innerText =
    "$" + subtotal.toFixed(2);

  document.getElementById("agua").innerText =
    "$" + agua.toFixed(2);

  document.getElementById("recargos").innerText =
    "$" + totalRec.toFixed(2);

  document.getElementById("descuentos").innerText =
    "$" + totalDesc.toFixed(2);

  document.getElementById("neto").innerText =
    "$" + neto.toFixed(2);
}

// ==================== INICIAR ====================
window.onload = () => {

  cargarTabla();

  // ==================== MENÚ ====================
  document.getElementById("menu").onclick = () => {

    window.location.href =
      "menu.html";
  };

  // ==================== BUSCAR ====================
  document.getElementById("buscar").onclick = () => {

    const cajero =
      document.getElementById("cajero").value;

    if (cajero === "") {

      cargarTabla(datos);
      return;
    }

    const filtrados = datos.filter(d =>
      d.nombre.toLowerCase()
        .includes(cajero.toLowerCase())
    );

    cargarTabla(filtrados);
  };

  // ==================== LIMPIAR ====================
  document.getElementById("limpiar").onclick = () => {

    document.getElementById("fechaInicio").value = "";

    document.getElementById("fechaFinal").value = "";

    document.getElementById("cajero").selectedIndex = 0;

    cargarTabla(datos);
  };

  // ==================== IMPRIMIR ====================
  document.getElementById("imprimir").onclick = () => {

    window.print();
  };

  // ==================== IMPRIMIR CORTE ====================
  document.getElementById("imprimirCorte").onclick = () => {

    alert("Impresión de corte");
  };

  // ==================== FORMATO MENSUAL ====================
  document.getElementById("formatoMensual").onclick = () => {

    alert("Formato mensual");
  };

};