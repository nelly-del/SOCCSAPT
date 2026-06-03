
///////////////////////////////////////////////
let paginaActual = 1;

let modoCancelar = false;

let contratoSeleccionado = null;


// =============================
// CARGAR CONTRATOS
// =============================
async function cargarContratos(pagina = 1){

  const res = await fetch(
    `http://localhost:3000/contratos?pagina=${pagina}`
  );

  const data = await res.json();

  const tabla =
  document.getElementById("tablaContratos");

  tabla.innerHTML = "";

  // CABECERA DINAMICA
  const encabezado =
  document.querySelector("thead tr");

  encabezado.innerHTML = `

    ${modoCancelar ? "<th></th>" : ""}

    <th>Contrato</th>
    <th>Codigo</th>
    <th>Contribuyente</th>
    <th>Último pago</th>
    <th>Pago inicio</th>
    <th>Creacion del contrato</th>
    <th>Contrato anterior</th>
    <th>Unidad</th>
    <th>Estatus</th>
    <th>Bomba</th>
    <th>Tipo de uso</th>

  `;

  // FILAS
  data.datos.forEach(c => {

    const checkbox =
    modoCancelar

    ? `

      <td>

        <input
        type="checkbox"
        class="chk-cancelar"
        value="${c.id_contrato}">

      </td>

    `

    : "";

    tabla.innerHTML += `

      <tr>

        ${checkbox}

        <td>${c.id_contrato}</td>

        <td>${c.codigo_contribuyente}</td>

        <td>${c.nombre || ""}</td>

        <td>
          ${c.ultimo_pago
          ? c.ultimo_pago.split("T")[0]
          : ""}
        </td>

        <td>
          ${c.pago_inicio
          ? c.pago_inicio.split("T")[0]
          : ""}
        </td>

        <td>
          ${c.creacion_contrato
          ? c.creacion_contrato.split("T")[0]
          : ""}
        </td>

        <td>${c.contrato_anterior || ""}</td>

        <td>${c.unidad || ""}</td>

       <td>

  <button

    class="${
      c.estatus == 1
      ? 'activo'
      : 'inactivo'
    } btn-estatus"

    onclick="cambiarEstatus(${c.id_contrato})"

  >

    ${
      c.estatus == 1
      ? 'Vigente'
      : 'Baja'
    }

  </button>

</td>

          

        </td>

        <td>${c.bomba || ""}</td>

        <td>${c.tipo_de_uso || ""}</td>

      </tr>

    `;

  });

  document.getElementById(
    "infoRegistros"
  ).textContent =

  `Existen ${data.total} registros en total`;

  generarPaginacion(
    data.total,
    pagina
  );

}


// =============================
// PAGINACION
// =============================
function generarPaginacion(total,pagina){

  const contenedor =
  document.querySelector(".paginacion");

  contenedor.innerHTML = "";

  const totalPaginas =
  Math.ceil(total / 10);

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


// =============================
// INICIO
// =============================
cargarContratos();


// =============================
// REDIRECCIONES
// =============================
document.getElementById("menu").onclick = ()=>{

  window.location.href = "menu.html";

};

document.getElementById("contribuyentes").onclick = ()=>{

  window.location.href = "listado_cont.html";

};

document.getElementById("pagos").onclick = ()=>{

  window.location.href = "pagos.html";

};

document.getElementById("reportes").onclick = ()=>{

  window.location.href = "reportes.html";

};

document.getElementById("agregarcontrato").onclick = ()=>{

  window.location.href = "crearcontrato.html";

};

document.getElementById("editar").onclick = ()=>{

  window.location.href = "Modificar_contrato.html";

};


// =============================
// EXCEL
// =============================
document.getElementById("excel")
.onclick = generarExcel;

async function generarExcel(){

  const res = await fetch(
    "http://localhost:3000/contratos-todos"
  );

  const data = await res.json();

  const datos = data.map(c => ({

    Contrato: c.id_contrato,

    Contribuyente:
    c.codigo_contribuyente,

    Nombre: c.nombre,

    UltimoPago:
    c.ultimo_pago,

    CreacionContrato:
    c.creacion_contrato,

    Unidad: c.unidad,

    Estatus:
    c.estatus == 1
    ? "Vigente"
    : "Baja",

    Bomba: c.bomba,

    TipoUso:
    c.tipo_de_uso

  }));

  const ws =
  XLSX.utils.json_to_sheet(datos);

  const wb =
  XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Contratos"
  );

  XLSX.writeFile(
    wb,
    "Reporte_General_Contratos.xlsx"
  );

}


// =============================
// BOTON CANCELAR
// =============================
document.getElementById("cancelar")
.addEventListener("click", async ()=>{

  // ACTIVAR MODO
  if(!modoCancelar){

    modoCancelar = true;

    document.getElementById(
      "cancelar"
    ).innerHTML = `

      <i class="fa-solid fa-check"></i>
      Seleccionar contrato

    `;

    cargarContratos();

    return;

  }

  // OBTENER SELECCIONADOS
  const seleccionados =
  document.querySelectorAll(
    ".chk-cancelar:checked"
  );

  // VALIDAR
  if(seleccionados.length === 0){

    mostrarModal(
      "Selecciona un contrato"
    );

    return;

  }

  if(seleccionados.length > 1){

    mostrarModal(
      "Solo puedes cancelar un contrato"
    );

    return;

  }

  contratoSeleccionado =
  seleccionados[0].value;

  const fila =
  seleccionados[0].closest("tr");

  // DATOS
  document.getElementById(
    "modalContrato"
  ).textContent =
  fila.children[1].textContent;

  document.getElementById(
    "modalNombre"
  ).textContent =
  fila.children[3].textContent;

  document.getElementById(
    "modalEstatus"
  ).textContent =
  fila.children[9].textContent;

  // VALIDAR ADEUDOS
  try{

    const validar = await fetch(

      `http://localhost:3000/validar-adeudos/${contratoSeleccionado}`

    );

    const resultado =
    await validar.json();

    const adeudos =
    document.getElementById(
      "modalAdeudos"
    );

    if(resultado.tieneAdeudos){

      adeudos.textContent =
      "Tiene adeudos pendientes";

      adeudos.className =
      "conAdeudos";

      document.getElementById(
        "confirmarCancelacion"
      ).disabled = true;

    }else{

      adeudos.textContent =
      "Sin adeudos pendientes";

      adeudos.className =
      "sinAdeudos";

      document.getElementById(
        "confirmarCancelacion"
      ).disabled = false;

    }

  }catch(error){

    document.getElementById(
      "modalAdeudos"
    ).textContent =
    "No se pudo validar";

  }

  // MOSTRAR MODAL
  document.getElementById(
    "modalCancelar"
  ).style.display = "flex";

});


// =============================
// CONFIRMAR CANCELACION
// =============================
document.getElementById(
  "confirmarCancelacion"
).onclick = async ()=>{

  const motivo =
  document.getElementById(
    "motivoCancelacion"
  ).value;

  if(motivo.trim() === ""){

    mostrarModal(
      "Escribe un motivo"
    );

    return;

  }

  await fetch(

    "http://localhost:3000/cambiar-estatus-contrato",

    {

      method:"PUT",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        id_contrato:
        contratoSeleccionado,

        motivo

      })

    }

  );

  cerrarModalCancelar();

  mostrarModal(
    "Contrato cancelado correctamente"
  );

  cargarContratos();

};


// =============================
// CERRAR MODAL
// =============================
function cerrarModalCancelar(){

  document.getElementById(
    "modalCancelar"
  ).style.display = "none";

  document.getElementById(
    "motivoCancelacion"
  ).value = "";

  contratoSeleccionado = null;

  modoCancelar = false;

  document.getElementById(
    "cancelar"
  ).innerHTML = `

    <i class="fa-solid fa-circle-xmark"></i>
    Cancelar contrato

  `;

  cargarContratos();

}


// =============================
// MODAL SIMPLE
// =============================
function mostrarModal(mensaje){

  alert(mensaje);

}
//////////////////FUNCION CAMBIAR ESTATUS
async function cambiarEstatus(id){

  // CONFIRMAR
  const confirmar = confirm(
    "¿Deseas cambiar el estatus del contrato?"
  );

  if(!confirmar){

    return;

  }

  try{

    const res = await fetch(

      "http://localhost:3000/cambiar-estatus-contrato",

      {

        method:"PUT",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          id_contrato:id

        })

      }

    );

    const mensaje =
    await res.text();

    mostrarModal(mensaje);

    cargarContratos();

  }catch(error){

    mostrarModal(
      "Error al cambiar estatus"
    );

  }

}