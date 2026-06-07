let datos = [];

// ==================== OBTENER DATOS ====================
async function obtenerDatos() {
    try {
        const respuesta = await fetch("http://localhost:3000/recaudacion");
        datos = await respuesta.json();
        cargarTabla(datos);
    } catch (error) {
        console.error(error);
        alert("Error al cargar la información");
    }
}

// ==================== CARGAR TABLA ====================
function cargarTabla(lista = datos) {
    let subtotal  = 0;
    let agua      = 0;
    let totalRec  = 0;
    let totalDesc = 0;
    let neto      = 0;

    const tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    lista.forEach(d => {
        const importe     = Number(d.importe)    || 0;
        const recargos    = Number(d.recargos)   || 0;
        const descuentos  = Number(d.descuentos) || 0;
        const meses       = Number(d.meses)      || 0;

        const servicio        = importe - recargos;   // agua = importe sin recargos
        const totalRecargos   = recargos;
        const totalDescuentos = descuentos;
        const netoFila        = importe - totalDescuentos;

        subtotal  += importe;
        agua      += servicio;
        totalRec  += totalRecargos;
        totalDesc += totalDescuentos;
        neto      += netoFila;

        tbody.innerHTML += `
            <tr>
                <td>${d.folio}</td>
                <td>${d.codigo}</td>
                <td>${d.nombre}</td>
                <td>${d.contrato}</td>
                <td>${d.periodo}</td>
                <td>${meses}</td>
                <td>$${servicio.toFixed(2)}</td>
                <td>$${recargos.toFixed(2)}</td>
                <td>$${totalRecargos.toFixed(2)}</td>
                <td>$${descuentos.toFixed(2)}</td>
                <td>$${totalDescuentos.toFixed(2)}</td>
                <td>$${servicio.toFixed(2)}</td>
                <td>$${importe.toFixed(2)}</td>
                <td>$${netoFila.toFixed(2)}</td>
            </tr>
        `;
    });

    document.getElementById("subtotal").innerText    = "$" + subtotal.toFixed(2);
    document.getElementById("agua").innerText        = "$" + agua.toFixed(2);
    document.getElementById("recargos").innerText    = "$" + totalRec.toFixed(2);
    document.getElementById("descuentos").innerText  = "$" + totalDesc.toFixed(2);
    document.getElementById("neto").innerText        = "$" + neto.toFixed(2);
}

// ==================== BUSCAR CON FILTROS ====================
async function buscarConFiltros() {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFinal  = document.getElementById("fechaFinal").value;
    const cajero      = document.getElementById("cajero").value;

    const params = new URLSearchParams();
    if (fechaInicio) params.append("inicio", fechaInicio);
    if (fechaFinal)  params.append("fin", fechaFinal);
    if (cajero)      params.append("cajero", cajero);

    try {
        const res  = await fetch(`http://localhost:3000/recaudacion?${params}`);
        const data = await res.json();
        cargarTabla(data);
    } catch (error) {
        console.error(error);
        alert("Error al buscar");
    }
}

// ==================== INICIAR ====================
window.onload = () => {
    obtenerDatos();

    document.getElementById("menu").onclick = () => {
        window.location.href = "menu.html";
    };

    document.getElementById("buscar").onclick = buscarConFiltros;

    document.getElementById("limpiar").onclick = () => {
        document.getElementById("fechaInicio").value = "";
        document.getElementById("fechaFinal").value  = "";
        document.getElementById("cajero").selectedIndex = 0;
        cargarTabla(datos);
    };

    document.getElementById("imprimir").onclick = () => {
        window.print();
    };

    document.getElementById("formatoMensual").onclick = () => {
        alert("Formato mensual");
    };
};