// ============================================
// VARIABLES DE CONTROL E INICIALIZACIÓN
// ============================================
let totalRegistrosTxt;
let tablaPagos;
let modoVer = false;
let idAccionTemporal = null;
let estadoAccionTemporal = null;
let tipoAccionTemporal = "";

document.addEventListener("DOMContentLoaded", () => {
    tablaPagos = document.getElementById("tablaPagos");
    totalRegistrosTxt = document.getElementById("totalRegistros");
    crearModalEstructura();
    cargarPagos();
    cargarContratos();
    cargarContribuyentes();
    cargarServicios();

    document.getElementById("fechaInicio").addEventListener("change", buscarPagos);
    document.getElementById("fechaFin").addEventListener("change", buscarPagos);
    document.getElementById("filtroContrato").addEventListener("change", buscarPagos);
    document.getElementById("filtroContribuyente").addEventListener("change", buscarPagos);
    document.getElementById("filtroServicio").addEventListener("change", buscarPagos);
    document.getElementById("chkVigentes").addEventListener("change", buscarPagos);
   
});

// ============================================
// FORMATEAR FECHA CORTA (YYYY-MM-DD → mes año)
// ============================================
function formatearMes(fecha) {
    if (!fecha) return "—";
    const f = new Date(fecha);
    return f.toLocaleString("es-MX", { month: "long", year: "numeric" });
}

// ============================================
// CARGAR PAGOS DESDE TABLA pagos
// ============================================
async function cargarPagos() {
    try {
        const res = await fetch("http://localhost:3000/pagos");
        const data = await res.json();

        if (!tablaPagos) return;
        tablaPagos.innerHTML = "";

        if (!data || data.length === 0) {
            tablaPagos.innerHTML = `<tr><td colspan="14" style="text-align:center;">No existen pagos registrados</td></tr>`;
            if (totalRegistrosTxt) totalRegistrosTxt.textContent = "Existen 0 registros en total";
            return;
        }

        if (totalRegistrosTxt) totalRegistrosTxt.textContent = `Existen ${data.length} registros en total`;

        const thead = document.querySelector("thead tr");
        if (modoVer) {
            if (!document.getElementById("th-checkbox-ver")) {
                const th = document.createElement("th"); th.id = "th-checkbox-ver";
                thead.insertBefore(th, thead.firstChild);
            }
        } else {
            const thExistente = document.getElementById("th-checkbox-ver");
            if (thExistente) thExistente.remove();
        }

        data.forEach(pago => {
            const importeFormateado = parseFloat(pago.importe || pago.total_recaudado || 0).toFixed(2);
            const mesInicio = formatearMes(pago.mes_inicio);
            const mesFin    = formatearMes(pago.mes_fin);
            const fechaPago = pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-MX") : "—";
            const cajero    = pago.cajero || "—";
            const recargos  = parseFloat(pago.recargos || pago.recargos_meses || 0).toFixed(2);

            // Timbrado: en tabla pagos, timbrado=1 significa timbrado
            const esTimbrado = pago.timbrado === 1 || pago.timbrado === "1";
            const timbradoTexto = esTimbrado ? "Timbrado" : "No Timbrado";
            const timbradoClase = esTimbrado ? "badge-timbrado-si" : "badge-timbrado-no";

            const esVigente = pago.estatus === 1 || pago.estatus === "1";
            const estatusTexto = esVigente ? "Vigente" : "Baja";
            const estatusClase = esVigente ? "badge-vigente" : "badge-novigente";

            const checkboxTd = modoVer
                ? `<td><input type="checkbox" class="chk-ver" value="${pago.id_contrato}"></td>`
                : "";

            const fila = document.createElement("tr");
            fila.innerHTML = `
                ${checkboxTd}
                <td><strong>P-${pago.id_pagos}</strong></td>
                <td>${pago.id_contrato || "S/N"}</td>
                <td>${pago.nombre || "—"}</td>
                <td>${pago.servicio || "—"}</td>
                <td style="text-transform:capitalize;">${mesInicio}</td>
                <td style="text-transform:capitalize;">${mesFin}</td>
                <td style="text-align:center;">${pago.meses_morosos ?? pago.meses ?? 0}</td>
                <td>${fechaPago}</td>
                <td>${cajero}</td>
                <td>$${recargos}</td>
                <td>${pago.descuento ? `${pago.descuento} (${pago.porcentaje_descuento}%)` : "Sin descuento"}</td>
                <td><strong>$${importeFormateado}</strong></td>
                <td>
                    <span class="badge-estatus ${estatusClase}" style="cursor:pointer;"
                        onclick="abrirConfirmacion(${pago.id_pagos}, ${pago.estatus}, 'estatus')">
                        ${estatusTexto}
                    </span>
                </td>
                <td>
                    <span class="badge-timbrado ${timbradoClase}">
                        ${timbradoTexto}
                    </span>
                </td>
            `;
            tablaPagos.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar pagos:", error);
    }
}

// ============================================
// MODALES
// ============================================
function crearModalEstructura() {
    if (document.getElementById("modalConfirmarPagos")) return;
    const modalHtml = `
        <div id="modalConfirmarPagos" class="modal-personalizado" style="display:none;">
            <div class="modal-contenido-personalizado">
                <h3 id="modalTituloPagos">Confirmar Acción</h3>
                <p id="modalMensajePagos">¿Estás seguro de realizar esta operación?</p>
                <div class="modal-botones-pagos">
                    <button id="btnCancelarPagoModal" class="btn-pago-cancelar">Cancelar</button>
                    <button id="btnAceptarPagoModal" class="btn-pago-aceptar">Aceptar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    document.getElementById("btnCancelarPagoModal").onclick = cerrarConfirmacion;
    document.getElementById("btnAceptarPagoModal").onclick = procesarAccionConfirmada;
}

function abrirConfirmacion(id, estadoActual, tipo) {
    idAccionTemporal = id;
    estadoAccionTemporal = estadoActual;
    tipoAccionTemporal = tipo;
    const titulo = document.getElementById("modalTituloPagos");
    const mensaje = document.getElementById("modalMensajePagos");
    if (tipo === "estatus") {
        titulo.textContent = "Cambiar Estatus";
        const textoCambio = (estadoActual === 1 || estadoActual === "1") ? "dar de BAJA" : "poner como VIGENTE";
        mensaje.textContent = `¿Seguro que quieres ${textoCambio} este pago?`;
    }
    document.getElementById("modalConfirmarPagos").style.display = "flex";
}

function cerrarConfirmacion() {
    document.getElementById("modalConfirmarPagos").style.display = "none";
    idAccionTemporal = null; estadoAccionTemporal = null; tipoAccionTemporal = "";
}

async function procesarAccionConfirmada() {
    if (!idAccionTemporal) return;
    if (tipoAccionTemporal === "estatus") {
        const nuevoEstado = (estadoAccionTemporal === 1 || estadoAccionTemporal === "1") ? 0 : 1;
        try {
            const res = await fetch(`http://localhost:3000/pagos/estado/${idAccionTemporal}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (res.ok) cargarPagos();
        } catch (error) { console.error("Error al actualizar estatus:", error); }
    }
    cerrarConfirmacion();
}

// ============================================
// BÚSQUEDA DE PAGOS
// ============================================
async function buscarPagos() {
    const fechaInicio    = document.getElementById("fechaInicio").value;
    const fechaFin       = document.getElementById("fechaFin").value;
    const contrato       = document.getElementById("filtroContrato").value;
    const contribuyente  = document.getElementById("filtroContribuyente").value;
    const servicio       = document.getElementById("filtroServicio").value;
    const vigente        = document.getElementById("chkVigentes").checked ? 1 : 0;
    

    const params = new URLSearchParams({ fechaInicio, fechaFin, contrato, contribuyente, servicio, vigente });
    try {
        const res = await fetch(`http://localhost:3000/pagos/busqueda?${params}`);
        const data = await res.json();
        renderizarTabla(data);
    } catch (error) { console.error(error); }
}

function renderizarTabla(data) {
    tablaPagos.innerHTML = "";
    if (data.length === 0) {
        tablaPagos.innerHTML = `<tr><td colspan="14">No existen pagos para los filtros seleccionados</td></tr>`;
        totalRegistrosTxt.textContent = "Existen 0 registros en total";
        return;
    }
    totalRegistrosTxt.textContent = `Existen ${data.length} registros en total`;
    data.forEach(pago => {
        const esTimbrado = pago.timbrado == 1;
        const esVigente  = pago.estatus == 1;
        tablaPagos.innerHTML += `
            <tr>
                <td>P-${pago.id_pagos}</td>
                <td>${pago.id_contrato}</td>
                <td>${pago.nombre || "—"}</td>
                <td>${pago.servicio || "—"}</td>
                <td>${formatearMes(pago.mes_inicio)}</td>
                <td>${formatearMes(pago.mes_fin)}</td>
                <td>${pago.meses ?? 0}</td>
                <td>${pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString("es-MX") : "—"}</td>
                <td>${pago.cajero || "—"}</td>
                <td>$${parseFloat(pago.recargos || 0).toFixed(2)}</td>
                <td>${pago.descuento || "Sin descuento"}</td>
                <td>$${parseFloat(pago.importe || pago.total_recaudado || 0).toFixed(2)}</td>
                <td><span class="${esVigente ? 'badge-vigente' : 'badge-novigente'}">${esVigente ? 'Vigente' : 'Baja'}</span></td>
                
            </tr>
        `;
    });
}

// ============================================
// SELECTORES
// ============================================
async function cargarContratos() {
    const res = await fetch("http://localhost:3000/contratos/listado");
    const contratos = await res.json();
    const select = document.getElementById("filtroContrato");
    select.innerHTML = '<option value="">Seleccione</option>';
    contratos.forEach(c => { select.innerHTML += `<option value="${c.id_contrato}">${c.id_contrato}</option>`; });
}

async function cargarContribuyentes() {
    const res = await fetch("http://localhost:3000/contribuyentes/listado");
    const data = await res.json();
    const select = document.getElementById("filtroContribuyente");
    select.innerHTML = '<option value="">Seleccione</option>';
    data.forEach(c => { select.innerHTML += `<option value="${c.codigo_contribuyente}">${c.nombre}</option>`; });
}

function cargarServicios() {
    document.getElementById("filtroServicio").innerHTML = `
        <option value="">Seleccione</option>
        <option value="Agua">Agua</option>
        <option value="Drenaje">Drenaje</option>
    `;
}

// ============================================
// LIMPIAR FILTROS
// ============================================
document.getElementById("btnLimpiar").addEventListener("click", () => {
    if (modoVer) { modoVer = false; document.getElementById("btnVer").innerHTML = `<i class="fa-regular fa-eye"></i> Ver`; }
    document.getElementById("fechaInicio").value = "";
    document.getElementById("fechaFin").value = "";
    document.getElementById("filtroContrato").value = "";
    document.getElementById("filtroContribuyente").value = "";
    document.getElementById("filtroServicio").value = "";
    document.getElementById("chkVigentes").checked = false;
});

// ============================================
// EXCEL
// ============================================
document.getElementById("btnDescargar").addEventListener("click", () => {
    const tabla = document.querySelector("table");
    const workbook = XLSX.utils.table_to_book(tabla, { sheet: "Pagos" });
    XLSX.writeFile(workbook, "ListadoPagos.xlsx");
});

// ============================================
// IMPRIMIR
// ============================================
document.getElementById("btnImprimir").addEventListener("click", () => {
    const contenido = document.querySelector(".contenedor-tabla").innerHTML;
    const ventana = window.open("", "", "width=1000,height=700");
    ventana.document.write(`<html><head><title>Listado de Pagos</title><style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:8px;font-size:12px;}th{background:#e6e6e6;}</style></head><body><h2>Listado de Pagos</h2>${contenido}</body></html>`);
    ventana.document.close(); ventana.focus(); ventana.print(); ventana.close();
});

// ============================================
// BOTÓN VER (redirige a informacion de pago)
// ============================================
document.getElementById("btnVer").addEventListener("click", () => {
    if (!modoVer) {
        modoVer = true;
        document.getElementById("btnVer").innerHTML = `<i class="fa-regular fa-eye"></i> Seleccionar contrato`;
        cargarPagos();
        return;
    }
    const seleccionados = document.querySelectorAll(".chk-ver:checked");
    if (seleccionados.length === 0) { alert("Selecciona un contrato para ver su información"); return; }
    if (seleccionados.length > 1)  { alert("Solo puedes ver un contrato a la vez"); return; }
    const idContrato = seleccionados[0].value;
    window.location.href = `../html/informacionpagos.html?contrato=${idContrato}`;
});

// ============================================
// REDIRECCIONES
// ============================================
document.getElementById("btnMenu").addEventListener("click", () => { window.location.href = "../html/menu.html"; });
document.getElementById("btnContratos").addEventListener("click", () => { window.location.href = "../html/contratos.html"; });
document.getElementById("btnReportes").addEventListener("click", () => { window.location.href = "../html/recaudacionAcomulada.html"; });
document.getElementById("btnRecibos").addEventListener("click", () => { window.location.href = "../html/recibos.html"; });
