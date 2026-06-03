const pagos = [];

let accionModal = null;

window.addEventListener("DOMContentLoaded", function(){

    /* Simula recibir el folio por parámetro URL */
    const params = new URLSearchParams(window.location.search);
    const folio = params.get("folio") || pagos[0].folio;

    const pago = pagos.find(function(p){
        return p.folio === folio;
    });

    if(pago){
        cargarDatos(pago);
    } else {
        mostrarModal("No se encontró información del pago");
    }
});

/* =============================================
   CARGAR DATOS EN LA PANTALLA
   ============================================= */

function cargarDatos(pago){

    /* DATOS PAGO */
    document.getElementById("folioPago").textContent =
    pago.folio;

    document.getElementById("fechaInicio").value =
    pago.fechaInicio;

    document.getElementById("fechaFin").value =
    pago.fechaFin;

    document.getElementById("fechaPago").value =
    pago.fechaPago;

    document.getElementById("numMeses").textContent =
    pago.numMeses;

    document.getElementById("total").textContent =
    formatearMoneda(pago.total);

    document.getElementById("servicioAgua").textContent =
    formatearMoneda(pago.servicioAgua);

    document.getElementById("recargos").textContent =
    formatearMoneda(pago.recargos);

    document.getElementById("descuentos").textContent =
    formatearMoneda(pago.descuentos);

    document.getElementById("comentarios").value =
    pago.comentarios;

    /* TABLA DESGLOSE */
    const cuerpo = document.getElementById("cuerpoTabla");
    cuerpo.innerHTML = "";

    pago.desglose.forEach(function(fila){

        /* Fila del mes */
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${fila.anio}</td>
            <td>${fila.mes}</td>
            <td>${formatearMoneda(fila.cuota)}</td>
            <td>${formatearMoneda(fila.importe)}</td>
        `;
        cuerpo.appendChild(tr);

        /* Fila de cargo */
        const trCargo = document.createElement("tr");
        trCargo.classList.add("cargo");
        trCargo.innerHTML = `
            <td colspan="3">Cargos Mes</td>
            <td>${formatearMoneda(fila.importe)}</td>
        `;
        cuerpo.appendChild(trCargo);
    });

    /* DATOS CFDI */
    if(pago.cfdi){
        document.getElementById("uuid").value =
        pago.cfdi.uuid;

        document.getElementById("rfcEmisor").value =
        pago.cfdi.rfcEmisor;

        document.getElementById("rfcReceptor").value =
        pago.cfdi.rfcReceptor;

        document.getElementById("razonEmisor").value =
        pago.cfdi.razonEmisor;

        document.getElementById("razonReceptor").value =
        pago.cfdi.razonReceptor;

        document.getElementById("fechaTimbrado").value =
        pago.cfdi.fechaTimbrado;

        document.getElementById("selloDigital").value =
        pago.cfdi.selloDigital;
    }
}

/* =============================================
   FORMATEAR MONEDA
   ============================================= */

function formatearMoneda(valor){
    return "$" + parseFloat(valor).toFixed(2).replace(
        /\B(?=(\d{3})+(?!\d))/g, ","
    );
}

/* =============================================
   TABS
   ============================================= */

function cambiarTab(id){

    /* Desactivar todos los paneles y tabs */
    document.querySelectorAll(".panel").forEach(function(panel){
        panel.classList.remove("activo");
    });

    document.querySelectorAll(".tab").forEach(function(tab){
        tab.classList.remove("activo");
    });

    /* Activar el seleccionado */
    document.getElementById(id).classList.add("activo");

    event.target.classList.add("activo");
}

/* =============================================
   BOTÓN REGRESAR
   ============================================= */

document.getElementById("btnRegresar").addEventListener("click", function(){
    mostrarModal(
        "¿Desea regresar al menú?",
        function(){
            window.location.href = "menu.html";
        }
    );
});

/* =============================================
   BOTÓN DESCARGAR XML
   En producción aquí iría la llamada al backend
   ============================================= */

document.getElementById("btnXML").addEventListener("click", function(){

    const folio = document.getElementById("folioPago").textContent;

    if(!folio){
        mostrarModal("No hay pago cargado para descargar");
        return;
    }

    /* Simula la descarga generando un XML de ejemplo */
    const contenidoXML = `<?xml version="1.0" encoding="UTF-8"?>
<Pago>
  <Folio>${folio}</Folio>
  <FechaInicio>${document.getElementById("fechaInicio").value}</FechaInicio>
  <FechaFin>${document.getElementById("fechaFin").value}</FechaFin>
  <FechaPago>${document.getElementById("fechaPago").value}</FechaPago>
  <Total>${document.getElementById("total").textContent}</Total>
  <UUID>${document.getElementById("uuid").value}</UUID>
</Pago>`;

    const blob = new Blob([contenidoXML], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `pago-${folio}.xml`;
    enlace.click();
    URL.revokeObjectURL(url);
});

/* =============================================
   BOTÓN IMPRIMIR FACTURA
   ============================================= */

document.getElementById("btnFactura").addEventListener("click", function(){

    const folio = document.getElementById("folioPago").textContent;

    if(!folio){
        mostrarModal("No hay pago cargado para imprimir");
        return;
    }

    window.print();
});

/* =============================================
   MODAL
   ============================================= */

function mostrarModal(mensaje, accion){

    document.getElementById("textoModal").textContent =
    mensaje;

    document.getElementById("modal").style.display =
    "flex";

    accionModal = accion;

    const btnCancelarModal =
    document.getElementById("btnCancelarModal");

    if(accion){
        btnCancelarModal.style.display = "inline-block";
    } else {
        btnCancelarModal.style.display = "none";
    }
}

function cerrarModal(){

    document.getElementById("modal").style.display =
    "none";

    if(accionModal){
        accionModal();
        accionModal = null;
    }
}

function cancelarModal(){

    document.getElementById("modal").style.display =
    "none";

    accionModal = null;
}