//FUNCIONES GENERALES
//Paginacion
let paginaActual = 1;

//Cargar datos de la tabla de contribuyentes registrados
async function cargarDatos(pagina = 1) {

  //Peticion al servidor y manda el numero de pagina
  const res = await fetch(`http://localhost:3000/contribuyentes?pagina=${pagina}`);
  const data = await res.json(); //se espera una respuesta

  //Borrar tabla para no duplicar datos 
  const tabla = document.querySelector("tbody");
  tabla.innerHTML = "";

  //Colocar las filas de los datos de cada contribuyente
  data.datos.forEach(c => {
    
    //Crear cada fila del html listado_cont y se insertan los datos dinamicos
    tabla.innerHTML += `
      <tr>
        <td>${c.codigo_contribuyente}</td>
        <td>${c.nombre}</td>
        <td>${c.apellido_paterno}</td>
        <td>${c.apellido_materno}</td>
        <td>${c.rfc}</td>
        <td>${c.estado}</td>
        <td>${c.municipio}</td>
        <td>${c.colonia}</td>
        <td>${c.calle}</td>
        <td>${c.cp}</td>
        <td class="${c.estatus == 1 ? 'activo' : 'inactivo'}"> 
          ${c.estatus == 1 ? 'Vigente' : 'Baja'}
        </td>
       <td 
  class="${c.estatus == 1 ? 'activo' : 'inactivo'}"
  onclick="cambiarEstatus('${c.codigo_contribuyente}', ${c.estatus})"
  style="cursor:pointer"
>
  ${c.estatus == 1 ? 'Vigente' : 'Baja'}
</td>
      </tr>
    `;
  });
 //Mostrar el total de registros
  document.getElementById("infoRegistros").textContent =
    `Existen ${data.total} registros en total`;

 //Generar la paginacion y se llama a otra funcion
  generarPaginacion(data.total, pagina);
}
//Llamar a otra funcion
function generarPaginacion(total, pagina) {

//Generar la paginacion que divide entre 10 registros por pagina
  const contenedor = document.querySelector(".paginacion");
  contenedor.innerHTML = "";

  const totalPaginas = Math.ceil(total / 10);

  //Crear botones 1,2,3
  for (let i = 1; i <= totalPaginas; i++) {

    //Cuando se hace click se llama a cargar datos actuales
    contenedor.innerHTML += `
      <span onclick="cargarDatos(${i})"
        class="${i === pagina ? 'activo' : ''}">
        ${i}
      </span>
    `;
  }

}
//Se ejecuta cuando abre la pagina
cargarDatos();

//Redireccionar a las paginas segun el boton presionado
document.getElementById('menu').onclick = () => window.location.href = "menu.html";
document.getElementById('contrato').onclick = () => window.location.href = "contratos.html";
document.getElementById('pago').onclick = () => window.location.href = "pagos.html";
document.getElementById('reporte').onclick = () => window.location.href = "reportes.html";
document.getElementById('agregar').onclick = () => window.location.href = "registrocontribuyentes.html";

//GENERAR EXCEL
document.getElementById('descargar').onclick = generarExcel;

async function generarExcel() {

  // Traer todos los contribuyentes
  const res = await fetch("http://localhost:3000/contribuyentes-todos");
  const data = await res.json();

  // Convertir datos a formato más limpio
  const datos = data.map(c => ({
    Codigo: c.codigo_contribuyente,
    Nombre: c.nombre,
    ApellidoP: c.apellido_paterno,
    ApellidoM: c.apellido_materno,
    RFC: c.rfc,
    Estado: c.estado,
    Municipio: c.municipio,
    Colonia: c.colonia,
    Calle: c.calle,
    CP: c.cp,
    Estatus: c.estatus == 1 ? "Vigente" : "Baja"
  }));

  // Crear hoja
  const ws = XLSX.utils.json_to_sheet(datos);

  // Crear libro
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contribuyentes");

  // Descargar archivo
  XLSX.writeFile(wb, "reporte_contribuyentes.xlsx");
}

//ESTATUS
//Dar de baja a un contribuyente cambiando su estatus
async function cambiarEstatus(codigo, estatusActual) {

  let accion = estatusActual == 1 ? "dar de baja" : "reactivar";

  //Retroalimentacion de confirmacion 
 abrirModalConfirmacion(
  `¿Seguro que quieres ${accion} este contribuyente?`,
  async () => {

  //Enviar al backend el nuevo estatus
  const res = await fetch("http://localhost:3000/estatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      codigo,
      estatus: estatusActual == 1 ? 0 : 1
    })
  });
  const respuesta = await res.text();
  mostrarModal(respuesta);
    cargarDatos(paginaActual);
  }
);
}

//BUSCAR
//barra de busqueda buscar un contribuyente por RFC
document.getElementById('buscar').addEventListener('input', async (e) => {

  const rfc = e.target.value;
//Si esta vacio se regresa a la lista completa
  if (rfc.length === 0) {
    cargarDatos(); // vuelve a cargar todo
    return;
  }
//Buscar en la BD la consulta de rfc
  const res = await fetch(`http://localhost:3000/buscarRFC?rfc=${rfc}`);
  const data = await res.json();

  const tabla = document.querySelector("tbody");
  tabla.innerHTML = "";

  data.forEach(c => {
    tabla.innerHTML += `
      <tr>
        <td>${c.codigo_contribuyente}</td>
        <td>${c.nombre}</td>
        <td>${c.apellido_paterno}</td>
        <td>${c.apellido_materno}</td>
        <td>${c.rfc}</td>
        <td>${c.estado}</td>
        <td>${c.municipio}</td>
        <td>${c.colonia}</td>
        <td>${c.calle}</td>
        <td>${c.cp}</td>
        <td class="${c.estatus == 1 ? 'activo' : 'inactivo'}"
            onclick="cambiarEstatus('${c.codigo_contribuyente}', ${c.estatus})"
            style="cursor:pointer">
          ${c.estatus == 1 ? 'Vigente' : 'Baja'}
        </td>
      </tr>
    `;
  });

});
///PERMISOS
//Traer lo guardado en el login
const usuario = JSON.parse(localStorage.getItem("usuario"));
const permisos = JSON.parse(localStorage.getItem("permisos"));

// validar el acceso al modulo si no es administrador
if (usuario.rol != 1) {

  //Buscar permisos de ese modulo
  const permisoModulo = permisos.find(p => p.modulo === "Contribuyentes");

  // Si no existe el permiso no se puede ver y lo saca
  if (!permisoModulo || permisoModulo.ver == 0) {
    mostrarModal("No tienes acceso a este módulo");
    window.location.href = "menu.html";
  }

}

//BLOQUEAR BOTONES
const permiso = permisos.find(p => p.modulo === "Contribuyentes");

if (!permiso) {
  console.warn("No hay permisos definidos para este módulo");
} else {

// NO puede crear
if (permiso.nuevo == 0) {
  document.getElementById("agregar").style.display = "none";
}

// NO puede editar
if (permiso.editar == 0) {
  document.querySelectorAll(".btn-editar").forEach(b => b.style.display = "none");
}

// NO puede eliminar
if (permiso.eliminar == 0) {
  document.querySelectorAll(".btn-eliminar").forEach(b => b.style.display = "none");
}
}
///////////////////////////////FUNCIONES///////////////////////////////////////////
function mostrarModal(mensaje) {

  document.getElementById("textoModal").textContent = mensaje;

  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {

  document.getElementById("modal").style.display = "none";

}
////////////////////////////FUNCIONES DE MODAL DE ESTATUS//////////////////////////////////////////////////////
function abrirModalConfirmacion(texto, callback) {

  document.getElementById("modalConfirmacion").style.display = "flex";

  document.getElementById("textoConfirmacion").textContent = texto;

  document.getElementById("btnAceptar").onclick = () => {
    cerrarModalConfirmacion();
    callback();
  };

}

function cerrarModalConfirmacion() {
  document.getElementById("modalConfirmacion").style.display = "none";
}