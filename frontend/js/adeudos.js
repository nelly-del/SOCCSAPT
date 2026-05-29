// ==================== DATOS ====================
const datos = [
  {
    contrato: "001",
    anterior: "0001",
    nombre: "Juan Pérez",
    domProp: "Calle 1",
    domCont: "Calle 2",
    tipo: "Doméstico",
    inicio: "Ene",
    actual: "Mar",
    meses: 3,
    cuota: 200,
    recargos: 20
  },
  {
    contrato: "002",
    anterior: "0002",
    nombre: "Ana López",
    domProp: "Calle 3",
    domCont: "Calle 4",
    tipo: "Comercial",
    inicio: "Feb",
    actual: "Abr",
    meses: 2,
    cuota: 300,
    recargos: 30
  }
];

// ==================== CARGAR TABLA ====================
function cargarTabla(lista = datos) {

  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  lista.forEach(item => {

    const totalRecargos = item.recargos * item.meses;
    const importeAgua = item.cuota * item.meses;
    const totalPagar = importeAgua + totalRecargos;

    tbody.innerHTML += `
      <tr>
        <td>${item.contrato}</td>
        <td>${item.anterior}</td>
        <td>${item.nombre}</td>
        <td>${item.domProp}</td>
        <td>${item.domCont}</td>
        <td>${item.tipo}</td>
        <td>${item.inicio}</td>
        <td>${item.actual}</td>
        <td>${item.meses}</td>
        <td>$${item.cuota.toFixed(2)}</td>
        <td>$${item.recargos.toFixed(2)}</td>
        <td>$${totalRecargos.toFixed(2)}</td>
        <td>$${importeAgua.toFixed(2)}</td>
        <td>$${totalPagar.toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("infoRegistros").textContent =
    `Existen ${lista.length} registros en total`;
}

// ==================== CARGAR AL ABRIR ====================
window.onload = () => {

  cargarTabla();

  // ==================== MENÚ ====================
  const btnMenu = document.getElementById("menu");

  if (btnMenu) {
    btnMenu.onclick = () => {
      window.location.href = "menu.html";
    };
  }

  // ==================== REGRESAR ====================
  const btnRegresar = document.getElementById("regresar");

  if (btnRegresar) {
    btnRegresar.onclick = () => {
      history.back();
    };
  }

  // ==================== LIMPIAR ====================
  const btnLimpiar = document.getElementById("limpiar");

  if (btnLimpiar) {
    btnLimpiar.onclick = () => {

      const fecha = document.getElementById("fechaCorte");
      const calle = document.getElementById("calle");

      if (fecha) fecha.value = "";
      if (calle) calle.selectedIndex = 0;

      cargarTabla();
    };
  }

  // ==================== BUSCAR ====================
  const btnBuscar = document.getElementById("buscar");

  if (btnBuscar) {

    btnBuscar.onclick = () => {

      const calle = document.getElementById("calle");

      // Si no existe el select, mostrar todo
      if (!calle) {
        cargarTabla();
        return;
      }

      const valor = calle.value.toLowerCase();

      // Si está vacío, mostrar todo
      if (valor === "") {
        cargarTabla();
        return;
      }

      // Filtrar datos
      const filtrados = datos.filter(item =>
        item.domCont.toLowerCase().includes(valor)
      );

      cargarTabla(filtrados);
    };
  }

  // ==================== DESCARGAR ====================
  const btnDescargar = document.getElementById("descargar");

  if (btnDescargar) {

    btnDescargar.onclick = () => {

      // Verificar librería XLSX
      if (typeof XLSX === "undefined") {
        alert("No se cargó la librería XLSX");
        return;
      }

      const datosExcel = datos.map(item => {

        const totalRecargos = item.recargos * item.meses;
        const importeAgua = item.cuota * item.meses;
        const totalPagar = importeAgua + totalRecargos;

        return {
          Contrato: item.contrato,
          ContratoAnterior: item.anterior,
          Nombre: item.nombre,
          DomicilioPropietario: item.domProp,
          DomicilioContrato: item.domCont,
          TipoToma: item.tipo,
          MesInicio: item.inicio,
          MesActual: item.actual,
          MesesPendientes: item.meses,
          Cuota: item.cuota,
          Recargos: item.recargos,
          TotalRecargos: totalRecargos,
          ImporteAgua: importeAgua,
          TotalPagar: totalPagar
        };
      });

      const ws = XLSX.utils.json_to_sheet(datosExcel);

      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Adeudos"
      );

      XLSX.writeFile(
        wb,
        "reporte_adeudos.xlsx"
      );
    };
  }

};