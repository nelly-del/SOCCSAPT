let listaPagos = [];
let accionModal = null;

const tablaBody    = document.getElementById("tablaBody");
const busquedaFecha  = document.getElementById("busquedaFecha");
const busquedaNombre = document.getElementById("busquedaNombre");
const botonBuscar  = document.getElementById("btnBuscar");
const botonLimpiar = document.getElementById("btnLimpiar");
const botonMenu    = document.getElementById("btnMenu");
const botonOrdenar = document.getElementById("btnOrdenar");

// ============ CARGAR DATOS ============
async function cargarHistorial() {
    try {
        const respuesta = await fetch("http://localhost:3000/historial-pagos");
        if (!respuesta.ok) throw new Error("Error al obtener los datos");
        listaPagos = await respuesta.json();
        mostrarPagos(listaPagos);
    } catch (error) {
        console.error("Error:", error);
        mostrarModal("No se pudo cargar el historial de pagos. Verifica la conexión.");
    }
}

// ============ RENDERIZAR TABLA ============
function mostrarPagos(datos) {
    tablaBody.innerHTML = "";
    if (!datos || datos.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No existen pagos registrados</td></tr>`;
        return;
    }
    datos.forEach(function(pago) {
        const fechaFormateada = pago.fecha ? new Date(pago.fecha).toLocaleDateString("es-MX") : "N/A";
        tablaBody.innerHTML += `
        <tr>
            <td>${fechaFormateada}</td>
            <td>${pago.nombre || 'Sin nombre'}</td>
            <td>${pago.contrato || 'N/A'}</td>
            <td>${pago.servicio || '—'}</td>
            <td>$${parseFloat(pago.monto || 0).toFixed(2)}</td>
        </tr>
        `;
    });
}

document.addEventListener("DOMContentLoaded", cargarHistorial);

<<<<<<< HEAD
// ============ BÚSQUEDA ============
botonBuscar.addEventListener("click", function() {
    const fecha  = busquedaFecha.value;
    const nombre = busquedaNombre.value.toLowerCase();
    const resultados = listaPagos.filter(function(pago) {
        const fechaPago = pago.fecha ? new Date(pago.fecha).toLocaleDateString("es-MX") : '';
        const coincideFecha  = fecha  === "" || fechaPago.includes(fecha);
        const coincideNombre = nombre === "" || (pago.nombre && pago.nombre.toLowerCase().includes(nombre));
=======
/* MOSTRAR TODOS AL INICIO */

mostrarPagos(pagos);


/* BOTÓN BUSCAR */

botonBuscar.addEventListener("click", function(){

    const fecha = busquedaFecha.value;
    const nombre = busquedaNombre.value;

    const resultados = pagos.filter(function(pago){

        const coincideFecha =

        fecha === "" ||

        pago.fecha.includes(fecha);


        const coincideNombre =

        nombre === "" ||

        pago.nombre.toLowerCase().includes(nombre.toLowerCase());


>>>>>>> a0fcbc245f401c399900e5c315fb9fed996210b6
        return coincideFecha && coincideNombre;
    });
    if (resultados.length === 0) mostrarModal("No se encontraron pagos con esos criterios.");
    mostrarPagos(resultados);
});

botonLimpiar.addEventListener("click", function() {
    busquedaFecha.value = "";
    busquedaNombre.value = "";
    mostrarPagos(listaPagos);
});

botonOrdenar.addEventListener("click", function() {
    const ordenados = [...listaPagos].sort(function(a, b) {
        return new Date(b.fecha) - new Date(a.fecha);
    });
    mostrarPagos(ordenados);
});

// ============ MODAL ============
function mostrarModal(mensaje, accion) {
    const modal = document.getElementById("modal");
    const textoModal = document.getElementById("textoModal");
    if (modal && textoModal) {
        textoModal.textContent = mensaje;
        modal.style.display = "flex";
        accionModal = accion || null;
    } else {
        alert(mensaje);
    }
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
    if (accionModal) { accionModal(); accionModal = null; }
}

function cancelarModal() {
    document.getElementById("modal").style.display = "none";
    accionModal = null;
}

botonMenu.addEventListener("click", function() {
    mostrarModal("¿Desea regresar al menú?", function() {
        window.location.href = "menu.html";
    });
});
