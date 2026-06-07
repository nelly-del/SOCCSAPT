let adeudoIdActual = null;
let importeBaseOriginal = 0;

document.addEventListener("DOMContentLoaded", () => {
    const inputFecha = document.getElementById("inp-fecha-pago");
    if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];

    const inputRecargos = document.getElementById("inp-recargos");
    if (inputRecargos) inputRecargos.addEventListener("input", recalcularTotales);
});

function switchTab(tabName, element) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    element.classList.add('active');
    document.getElementById(`panel-${tabName}`).classList.add('active');
}

// =========================================================
// BÚSQUEDA — por número de contrato O por nombre/código contribuyente
// =========================================================
async function buscarContrato() {
    // Intentar primero por número de contrato, luego por nombre/código
    const contratoId  = document.getElementById("inp-contrato").value.trim();
    const nombreBusca = document.getElementById("inp-nombre").value.trim();

    const terminoBusqueda = contratoId || nombreBusca;
    if (!terminoBusqueda) {
        alert("Por favor, introduce un número de contrato o nombre de contribuyente.");
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:3000/contrato/${terminoBusqueda}`);
        if (!respuesta.ok) {
            if (respuesta.status === 404) alert("No se encontró el contrato o contribuyente.");
            else alert("Error interno al conectar con el servidor.");
            limpiarControles();
            return;
        }
        const datos = await respuesta.json();
        poblarFormulario(datos);
    } catch (error) {
        console.error("Error en búsqueda:", error);
        alert("Error de conexión. Revisa la consola.");
    }
}

function poblarFormulario(datos) {
    // --- PESTAÑA 1: DATOS DEL CONTRATO ---
    document.getElementById("txt-contrato-id").textContent  = datos.id_contrato || "—";
    document.getElementById("txt-contrato-desc").textContent = datos.tipo_de_uso ? `Servicio de ${datos.tipo_de_uso.toLowerCase()}` : "—";
    document.getElementById("txt-contrato-ultimo-mes").textContent = datos.ultimo_pago || "Sin pagos previos";
    
    const nombreCompleto = datos.nombre
        ? `${datos.nombre} ${datos.apellido_paterno || ''} ${datos.apellido_materno || ''}`.trim()
        : "—";
    document.getElementById("txt-contrato-nombre").textContent = nombreCompleto;
    document.getElementById("txt-contrato-fecha").textContent = "Verificado";

    const divEstatus = document.getElementById("txt-contrato-estatus");
    divEstatus.innerHTML = datos.estatus == 1
        ? `<span class="badge badge-active">Activo</span>`
        : `<span class="badge badge-inactive">Inactivo</span>`;

    document.getElementById("txt-ubicacion-localidad").textContent = datos.localidad || "—";
    document.getElementById("txt-ubicacion-calle").textContent =
        `${datos.calle || ''} INT. ${datos.numero_interior || 'S/N'} EXT. ${datos.numero_exterior || 'S/N'} COL. ${datos.colonia || '—'} C.P. ${datos.cp || ''}`.trim();

    document.getElementById("txt-servicio-bomba").textContent = datos.bomba || "—";
    document.getElementById("txt-servicio-uso").textContent  = datos.tipo_de_uso || "—";

    // Actualizar campos de búsqueda con los datos encontrados
    document.getElementById("inp-contrato").value = datos.id_contrato || "";
    document.getElementById("inp-nombre").value   = nombreCompleto;

    // --- PESTAÑA 2: DATOS DE PAGO ---
    if (datos.id_adeudo) {
        adeudoIdActual = datos.id_adeudo;
        importeBaseOriginal = parseFloat(datos.importes || 0);

        document.getElementById("lbl-periodo-pago").textContent = `Pendiente de pago`;
        document.getElementById("lbl-meses-cubrir").textContent = a.meses_morosos || "1";
        document.getElementById("desglose-servicio").textContent = `$${importeBaseOriginal.toFixed(2)}`;
        document.getElementById("desglose-folio").textContent   = `F-${datos.id_adeudo}`;
        document.getElementById("desglose-tarifa").textContent  = datos.tipo_de_uso || "Doméstico / Agua";
        document.getElementById("desglose-descuento").textContent = "$0.00";
        document.getElementById("desglose-timbrado").innerHTML  = `<span class="badge badge-warn">Pendiente</span>`;

        recalcularTotales();
    } else {
        alert("Este contrato no tiene adeudos pendientes. Está al corriente.");
        limpiarSeccionPago();
    }
}

function recalcularTotales() {
    const recargos = parseFloat(document.getElementById("inp-recargos").value) || 0;
    const totalCalculado = importeBaseOriginal + recargos;
    document.getElementById("lbl-total-pagar").textContent = `$${totalCalculado.toFixed(2)}`;
    document.getElementById("desglose-total").textContent  = `$${totalCalculado.toFixed(2)}`;
}

// =========================================================
// PROCESAR TIMBRADO — guarda en adeudos + inserta en pagos
// =========================================================
async function pagar() {
    if (!adeudoIdActual) {
        alert("Debe buscar un contrato con adeudos pendientes antes de timbrar.");
        return;
    }

    const recargos  = parseFloat(document.getElementById("inp-recargos").value) || 0;
    const totalFinal = importeBaseOriginal + recargos;
    const cajero    = document.getElementById("inp-cajero").value.trim() || "Cajero Central";
    const fechaPago = document.getElementById("inp-fecha-pago").value;

    if (!fechaPago) { alert("Por favor seleccione la fecha del cobro."); return; }

    if (!confirm(`¿Confirmar cobro por $${totalFinal.toFixed(2)} y timbrar el folio F-${adeudoIdActual}?`)) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/pagos/procesar-timbrado/${adeudoIdActual}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recargos, importes: totalFinal, cajero, fecha_pago: fechaPago })
        });

        if (respuesta.ok) {
            alert("¡Cobro guardado y comprobante fiscal Timbrado con éxito!");
            document.getElementById("desglose-timbrado").innerHTML =
                `<span class="badge" style="background:#d1e7dd;color:#0f5132;padding:4px 8px;border-radius:4px;font-weight:bold;">✔ Timbrado</span>`;
            adeudoIdActual = null;
        } else {
            const err = await respuesta.json();
            alert("Error al timbrar: " + (err.error || err.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error al procesar el timbrado:", error);
        alert("Error de conexión al procesar el pago.");
    }
}

// =========================================================
// QUITAR RECARGOS
// =========================================================
function quitarRecargos() {
    document.getElementById("inp-recargos").value = "0.00";
    recalcularTotales();
}

// =========================================================
// IMPRIMIR COTIZACIÓN
// =========================================================
function imprimirCotizacion() {
    window.print();
}

function limpiarSeccionPago() {
    adeudoIdActual = null;
    importeBaseOriginal = 0;
    document.getElementById("lbl-periodo-pago").textContent = "—";
    document.getElementById("lbl-meses-cubrir").textContent = "0";
    document.getElementById("lbl-total-pagar").textContent  = "$0.00";
    document.getElementById("desglose-servicio").textContent = "$0.00";
    document.getElementById("inp-recargos").value = "0.00";
    //document.getElementById("desglose-total").textContent  = "$0.00";//
    document.getElementById("desglose-folio").textContent  = "—";
    document.getElementById("desglose-tarifa").textContent = "—";
    document.getElementById("desglose-timbrado").innerHTML = `<span class="badge badge-warn">Pendiente</span>`;
}

function limpiar() {
    document.getElementById("inp-contrato").value = "";
    document.getElementById("inp-nombre").value   = "";
    document.getElementById("txt-contrato-id").textContent    = "—";
    document.getElementById("txt-contrato-desc").textContent  = "—";
    document.getElementById("txt-contrato-ultimo-mes").textContent = "—";
    document.getElementById("txt-contrato-nombre").textContent = "— — — — — — —";
    document.getElementById("txt-contrato-estatus").innerHTML = `<span class="badge badge-inactive">Inactivo</span>`;
    document.getElementById("txt-ubicacion-localidad").textContent = "—";
    document.getElementById("txt-ubicacion-calle").textContent = "—";
    document.getElementById("txt-servicio-bomba").textContent  = "—";
    document.getElementById("txt-servicio-uso").textContent   = "—";
    limpiarSeccionPago();
}

function limpiarControles() { limpiar(); }

function goBack() { window.history.back(); }
