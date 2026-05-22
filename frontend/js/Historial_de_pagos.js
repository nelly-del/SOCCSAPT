const pagos = [];
/* ELEMENTOS HTML */

const tablaBody = document.getElementById("tablaBody");
const botonBuscar = document.getElementById("btnBuscar");
const busquedaFecha = document.getElementById("busquedaFecha");
const busquedaNombre = document.getElementById("busquedaNombre");
const botonLimpiar = document.getElementById("btnLimpiar");
const botonMenu = document.getElementById("btnMenu");
const botonOrdenar = document.getElementById("btnOrdenar");


/* MOSTRAR PAGOS */

function mostrarPagos(listaPagos){

    tablaBody.innerHTML = "";

    listaPagos.forEach(function(pago){

        tablaBody.innerHTML += `

        <tr>

            <td>${pago.fecha}</td>

            <td>${pago.nombre}</td>

            <td>${pago.contrato}</td>

            <td>${pago.monto}</td>

        </tr>

        `;

    });

}


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


        return coincideFecha && coincideNombre;

    });


    console.log(resultados);


    mostrarPagos(resultados);


    if(resultados.length === 0){

        mostrarModal("No se encontraron pagos");

    }

});


/* BOTÓN LIMPIAR */

botonLimpiar.addEventListener("click", function(){

    busquedaFecha.value = "";

    busquedaNombre.value = "";

    mostrarPagos(pagos);

});


/* BOTÓN ORDENAR */

botonOrdenar.addEventListener("click", function(){

    pagos.sort(function(a, b){

        return new Date(b.fecha) - new Date(a.fecha);

    });

    mostrarPagos(pagos);

});


/* BOTÓN MENÚ */

botonMenu.addEventListener("click", function(){

    mostrarModal("¿Desea regresar al menú?", function(){

        window.location.href = "menu.html";

    });

});


/* MOSTRAR MODAL */

function mostrarModal(mensaje, accion){

    document.getElementById("textoModal").textContent = mensaje;

    document.getElementById("modal").style.display = "flex";

    accionModal = accion;

}


/* BOTÓN ACEPTAR MODAL */

function cerrarModal(){

    document.getElementById("modal").style.display = "none";

    if(accionModal){

        accionModal();

        accionModal = null;

    }

}


/* BOTÓN CANCELAR MODAL */

function cancelarModal(){

    document.getElementById("modal").style.display = "none";

    accionModal = null;

}