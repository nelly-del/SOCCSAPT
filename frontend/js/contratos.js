// contratos.js

let paginaActual = 1;

// CARGAR CONTRATOS
async function cargarContratos(pagina = 1){

  const res = await fetch(
    `http://localhost:3000/contratos?pagina=${pagina}`
  );

  const data = await res.json();

  const tabla = document.getElementById("tablaContratos");

  tabla.innerHTML = "";

  data.datos.forEach(c => {

    tabla.innerHTML += `
    
    <tr>

      <td>${c.id_contrato}</td>
      <td>${c.codigo_contribuyente}</td>
      <td>${c.nombre}</td>
      <td>${c.ultimo_pago}</td>
      <td>${c.ultimo_pago_inicio}</td>
      <td>${c.ultimo_pago_fin}</td>
      <td>${c.contrato_anterior}</td>
      <td>${c.unidad}</td>

      <td class="${
        c.estatus == 1 ? 'activo' : 'inactivo'
      }">

      ${
        c.estatus == 1 ? 'Vigente' : 'Baja'
      }

      </td>

      <td>${c.bomba}</td>
      <td>${c.tipo_de_uso}</td>

    </tr>
    
    `;
  });

  document.getElementById("infoRegistros").textContent =
  `Existen ${data.total} registros en total`;

  generarPaginacion(data.total,pagina);

}

function generarPaginacion(total,pagina){

  const contenedor =
  document.querySelector(".paginacion");

  contenedor.innerHTML = "";

  const totalPaginas = Math.ceil(total / 10);

  for(let i=1;i<=totalPaginas;i++){

    contenedor.innerHTML += `
    
    <span
    onclick="cargarContratos(${i})"
    class="${i === pagina ? 'activo' : ''}">
    
    ${i}

    </span>
    
    `;
  }
}

cargarContratos();
//REDIRECCIONES

document.getElementById("menu").onclick = () => {
  window.location.href = "menu.html";
};

document.getElementById("contribuyentes").onclick = () => {
  window.location.href = "listado_cont.html";
};

document.getElementById("pagos").onclick = () => {
  window.location.href = "pagos.html";
};

document.getElementById("reportes").onclick = () => {
  window.location.href = "reportes.html";
};

document.getElementById("agregarcontrato").onclick = () => {
  window.location.href = "registro_contrato.html";
};
//DESCARGA EXCEL
// DESCARGAR EXCEL

document.getElementById("descargarExcel")
.onclick = generarExcel;

async function generarExcel(){

  const res = await fetch(
    "http://localhost:3000/contratos-todos"
  );

  const data = await res.json();

  const datos = data.map(c => ({

    Contrato: c.id_contrato,
    Contribuyente: c.codigo_contribuyente,
    Nombre: c.nombre,
    UltimoPago: c.ultimo_pago,
    Inicio: c.ultimo_pago_inicio,
    Fin: c.ultimo_pago_fin,
    ContratoAnterior: c.contrato_anterior,
    Unidad: c.unidad,
    Estatus: c.estatus == 1
      ? "Vigente"
      : "Baja",
    Bomba: c.bomba,
    TipoUso: c.tipo_de_uso

  }));

  const ws = XLSX.utils.json_to_sheet(datos);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Contratos"
  );

  XLSX.writeFile(
    wb,
    "reporte_contratos.xlsx"
  );

}