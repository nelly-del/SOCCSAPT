let accionModal = null;

// =============================================
// INICIO — leer parámetro de la URL y cargar
// =============================================
window.addEventListener("DOMContentLoaded", async function () {

    const params = new URLSearchParams(window.location.search);
    const idContrato = params.get("contrato");

    if (!idContrato) {
        mostrarModal("No se recibió ningún contrato. Regresa y selecciona uno.");
        return;
    }

    try {

        const res = await fetch(`http://localhost:3000/pagos/detalle/${idContrato}`);

        if (res.status === 404) {
            mostrarModal("Este contrato aún no tiene pagos registrados.");
            return;
        }

        if (!res.ok) {
            mostrarModal("Error al conectar con el servidor.");
            return;
        }

        const pago = await res.json();
        cargarDatos(pago);

    } catch (error) {
        console.error("Error al cargar información del pago:", error);
        mostrarModal("Error al conectar con el servidor.");
    }

});

// =============================================
// CARGAR DATOS EN LA PANTALLA
// =============================================
function cargarDatos(pago) {

    // --- FOLIO ---
    document.getElementById("folioPago").textContent =
        "F-" + (pago.id_pagos || "-");

    // --- FECHA INICIO PAGO ---
    document.getElementById("fechaInicio").value =
        pago.mes_inicio
            ? new Date(pago.mes_inicio).toLocaleDateString("es-MX")
            : "-";

    // --- FECHA FIN PAGO ---
    document.getElementById("fechaFin").value =
        pago.mes_fin
            ? new Date(pago.mes_fin).toLocaleDateString("es-MX")
            : "-";

    // --- FECHA DE PAGO (usamos mes_fin como referencia) ---
    document.getElementById("fechaPago").value =
        pago.mes_fin
            ? new Date(pago.mes_fin).toLocaleDateString("es-MX")
            : "-";

    // --- NO. MESES ---
    document.getElementById("numMeses").textContent =
        pago.meses ?? 0;

    // --- TOTAL ---
    document.getElementById("total").textContent =
        formatearMoneda(pago.total_recaudado || pago.importe || 0);

    // --- SERVICIO DE AGUA ---
    document.getElementById("servicioAgua").textContent =
        formatearMoneda(pago.total_servicio_agua || pago.importe || 0);

    // --- RECARGOS ---
    document.getElementById("recargos").textContent =
        formatearMoneda(pago.total_recargos || 0);

    // --- DESCUENTOS ---
    let montoDescuento = 0;
    if (pago.porcentaje_descuento && pago.importe) {
        montoDescuento = (parseFloat(pago.importe) * parseFloat(pago.porcentaje_descuento)) / 100;
    }
    document.getElementById("descuentos").textContent =
        formatearMoneda(montoDescuento);

    // --- COMENTARIOS / DESCRIPCIÓN ---
    document.getElementById("comentarios").value =
        pago.descripcion || "";

    // --- TABLA DESGLOSE POR MES ---
    const cuerpo = document.getElementById("cuerpoTabla");
    cuerpo.innerHTML = "";

    const meses = parseInt(pago.meses) || 1;
    const fechaBase = pago.mes_inicio ? new Date(pago.mes_inicio) : new Date();
    const tarifa = parseFloat(pago.tarifa) || 0;
    const importe = parseFloat(pago.importe) || 0;
    const cuotaMes = tarifa > 0 ? tarifa : (meses > 0 ? importe / meses : importe);

    for (let i = 0; i < meses; i++) {

        const fechaMes = new Date(fechaBase);
        fechaMes.setMonth(fechaMes.getMonth() + i);

        const anio = fechaMes.getFullYear();
        const mes = fechaMes.toLocaleString("es-MX", { month: "long" });

        // Fila del mes
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${anio}</td>
            <td style="text-transform: capitalize;">${mes}</td>
            <td>${formatearMoneda(cuotaMes)}</td>
            <td>${formatearMoneda(cuotaMes)}</td>
        `;
        cuerpo.appendChild(tr);

        // Fila de cargos
        const trCargo = document.createElement("tr");
        trCargo.classList.add("cargo");
        trCargo.innerHTML = `
            <td colspan="3">Cargos Mes</td>
            <td>${formatearMoneda(pago.recargos_meses || 0)}</td>
        `;
        cuerpo.appendChild(trCargo);
    }

    // --- DATOS CFDI ---
    const uuid = document.getElementById("uuid");
    if (uuid) uuid.value = pago.serie || "";

    const rfcReceptor = document.getElementById("rfcReceptor");
    if (rfcReceptor) rfcReceptor.value = pago.rfc || "";

    const razonReceptor = document.getElementById("razonReceptor");
    if (razonReceptor) razonReceptor.value = pago.nombre || "";
}

// =============================================
// FORMATEAR MONEDA
// =============================================
function formatearMoneda(valor) {
    return "$" + parseFloat(valor || 0).toFixed(2).replace(
        /\B(?=(\d{3})+(?!\d))/g, ","
    );
}

// =============================================
// TABS
// =============================================
function cambiarTab(id) {

    document.querySelectorAll(".panel").forEach(function (panel) {
        panel.classList.remove("activo");
    });

    document.querySelectorAll(".tab").forEach(function (tab) {
        tab.classList.remove("activo");
    });

    document.getElementById(id).classList.add("activo");
    event.target.classList.add("activo");
}

// =============================================
// BOTÓN REGRESAR
// =============================================
document.getElementById("btnRegresar").addEventListener("click", function () {
    mostrarModal(
        "¿Desea regresar?",
        function () {
            history.back();
        }
    );
});

// =============================================
// BOTÓN DESCARGAR XML
// =============================================
document.getElementById("btnXML").addEventListener("click", function () {

    const folio = document.getElementById("folioPago").textContent;

    if (!folio || folio === "F--") {
        mostrarModal("No hay pago cargado para descargar");
        return;
    }

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

// =============================================
// BOTÓN IMPRIMIR FACTURA
// =============================================
document.getElementById("btnFactura").addEventListener("click", function () {

    const folio = document.getElementById("folioPago").textContent;

    if (!folio || folio === "F--") {
        mostrarModal("No hay pago cargado para imprimir");
        return;
    }

    window.print();
});

// =============================================
// MODAL
// =============================================
function mostrarModal(mensaje, accion) {

    document.getElementById("textoModal").textContent = mensaje;
    document.getElementById("modal").style.display = "flex";

    accionModal = accion;

    const btnCancelarModal = document.getElementById("btnCancelarModal");

    if (accion) {
        btnCancelarModal.style.display = "inline-block";
    } else {
        btnCancelarModal.style.display = "none";
    }
}

function cerrarModal() {

    document.getElementById("modal").style.display = "none";

    if (accionModal) {
        accionModal();
        accionModal = null;
    }
}

function cancelarModal() {

    document.getElementById("modal").style.display = "none";
    accionModal = null;
}
