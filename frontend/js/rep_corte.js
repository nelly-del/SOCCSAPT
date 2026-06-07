// =============================
// CARGAR TABLA
// =============================
async function cargarTabla() {
    const inicio  = document.getElementById("fechaInicio").value;
    const fin     = document.getElementById("fechaFinal").value;
    const cajero  = document.getElementById("cajero").value;

    const params = new URLSearchParams();
    if (inicio) params.append("inicio", inicio);
    if (fin)    params.append("fin", fin);
    if (cajero && cajero !== "Seleccione") params.append("cajero", cajero);

    try {
        const res   = await fetch(`http://localhost:3000/reporte-corte?${params}`);
        const lista = await res.json();

        const tbody = document.getElementById("tabla-body");
        tbody.innerHTML = "";

        let totalR   = 0;
        let totalRec = 0;
        let totalDes = 0;

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No existen registros</td></tr>`;
            document.getElementById("totalRecaudado").innerText  = "$0.00";
            document.getElementById("totalRecargos").innerText   = "$0.00";
            document.getElementById("totalDescuentos").innerText = "$0.00";
            return;
        }

        lista.forEach((d, index) => {
            const importe    = Number(d.importe)    || 0;
            const recargos   = Number(d.recargos)   || 0;
            const descuentos = Number(d.descuentos) || 0;

            totalR   += importe;
            totalRec += recargos;
            totalDes += descuentos;

            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${d.servicio}</td>
                    <td>${d.pagos}</td>
                    <td>$${recargos.toFixed(2)}</td>
                    <td>$${descuentos.toFixed(2)}</td>
                    <td>$${importe.toFixed(2)}</td>
                </tr>
            `;
        });

        document.getElementById("totalRecaudado").innerText  = "$" + totalR.toFixed(2);
        document.getElementById("totalRecargos").innerText   = "$" + totalRec.toFixed(2);
        document.getElementById("totalDescuentos").innerText = "$" + totalDes.toFixed(2);

    } catch (error) {
        console.error(error);
        alert("Error al cargar el corte");
    }
}

// =============================
// INICIAR
// =============================
window.onload = () => {
    cargarTabla();
};

// =============================
// MENU
// =============================
document.getElementById("menu").onclick = () => {
    window.location.href = "menu.html";
};

// =============================
// REGRESAR
// =============================
document.getElementById("regresar").onclick = () => {
    history.back();
};

// =============================
// BUSCAR
// =============================
document.getElementById("buscarBtn").onclick = () => {
    cargarTabla();
};

// =============================
// LIMPIAR
// =============================
document.getElementById("limpiarBtn").onclick = () => {
    document.getElementById("fechaInicio").value = "";
    document.getElementById("fechaFinal").value  = "";
    document.getElementById("cajero").selectedIndex = 0;
    cargarTabla();
};

// =============================
// IMPRIMIR
// =============================
document.getElementById("imprimirBtn").onclick = () => {
    window.print();
};

// =============================
// IMPRIMIR CORTE
// =============================
document.getElementById("imprimirCorteBtn").onclick = () => {
    window.print();
};


// =============================
// FORMATO MENSUAL — PDF
// =============================
document.getElementById("formatoBtn").onclick = async () => {

    // 1. Pedir mes y año al usuario
    const mesAnio = prompt("Ingresa el mes y año a reportar (YYYY-MM):", 
        new Date().toISOString().slice(0, 7));
    
    if (!mesAnio || !/^\d{4}-\d{2}$/.test(mesAnio)) {
        alert("Formato inválido. Usa YYYY-MM, ejemplo: 2026-06");
        return;
    }

    const [anio, mes] = mesAnio.split("-");
    const nombreMes = new Date(anio, mes - 1).toLocaleString("es-MX", { month: "long" });
    const titulo    = `Reporte Mensual de Recaudación — ${nombreMes.toUpperCase()} ${anio}`;

    // 2. Obtener datos del servidor filtrados por mes
    try {
        const inicio = `${mesAnio}-01`;
        const fin    = new Date(anio, mes, 0).toISOString().split("T")[0]; // último día del mes
        
        const params = new URLSearchParams({ inicio, fin });
        const res    = await fetch(`http://localhost:3000/recaudacion?${params}`);
        const lista  = await res.json();

        if (lista.length === 0) {
            alert("No hay pagos registrados para ese mes.");
            return;
        }

        // 3. Calcular totales
        let totalImporte    = 0;
        let totalRecargos   = 0;
        let totalDescuentos = 0;
        let totalNeto       = 0;

        const filas = lista.map((d, i) => {
            const importe    = Number(d.importe)    || 0;
            const recargos   = Number(d.recargos)   || 0;
            const descuentos = Number(d.descuentos) || 0;
            const servicio   = importe - recargos;
            const neto       = importe - descuentos;

            totalImporte    += importe;
            totalRecargos   += recargos;
            totalDescuentos += descuentos;
            totalNeto       += neto;

            return [
                i + 1,
                d.folio,
                d.codigo,
                d.nombre,
                d.contrato,
                d.periodo,
                d.meses ?? 0,
                `$${servicio.toFixed(2)}`,
                `$${recargos.toFixed(2)}`,
                `$${descuentos.toFixed(2)}`,
                `$${importe.toFixed(2)}`,
                `$${neto.toFixed(2)}`
            ];
        });

        // 4. Generar PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });

        // Encabezado
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("H. AYUNTAMIENTO DE TETLA DE LA SOLIDARIDAD", pdf.internal.pageSize.width / 2, 40, { align: "center" });

        pdf.setFontSize(11);
        pdf.text("DIRECCIÓN DE AGUA POTABLE Y ALCANTARILLADO", pdf.internal.pageSize.width / 2, 58, { align: "center" });

        pdf.setFontSize(13);
        pdf.text(titulo, pdf.internal.pageSize.width / 2, 78, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(`Fecha de emisión: ${new Date().toLocaleDateString("es-MX")}`, 40, 95);

        // Línea separadora
        pdf.setDrawColor(150);
        pdf.line(40, 100, pdf.internal.pageSize.width - 40, 100);

        // Tabla
        pdf.autoTable({
            startY: 110,
            head: [[
                "#", "Folio", "Código", "Contribuyente", "Contrato",
                "Periodo", "Meses", "Servicio agua", "Recargos",
                "Descuentos", "Importe total", "Neto"
            ]],
            body: filas,
            styles: {
                fontSize: 7,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [120, 0, 0],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 8
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0:  { cellWidth: 20,  halign: "center" },
                1:  { cellWidth: 30,  halign: "center" },
                2:  { cellWidth: 55  },
                3:  { cellWidth: 110 },
                4:  { cellWidth: 40,  halign: "center" },
                5:  { cellWidth: 60,  halign: "center" },
                6:  { cellWidth: 30,  halign: "center" },
                7:  { cellWidth: 55,  halign: "right" },
                8:  { cellWidth: 50,  halign: "right" },
                9:  { cellWidth: 55,  halign: "right" },
                10: { cellWidth: 55,  halign: "right" },
                11: { cellWidth: 55,  halign: "right" }
            },
            margin: { left: 40, right: 40 }
        });

        // Totales al final
        const finalY = pdf.lastAutoTable.finalY + 15;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("RESUMEN TOTALES:", 40, finalY);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);

        const col1 = 40;
        const col2 = 200;
        const col3 = 380;
        const col4 = 540;

        pdf.text(`Total importe:      $${totalImporte.toFixed(2)}`,    col1, finalY + 15);
        pdf.text(`Total recargos:     $${totalRecargos.toFixed(2)}`,   col2, finalY + 15);
        pdf.text(`Total descuentos:   $${totalDescuentos.toFixed(2)}`, col3, finalY + 15);
        pdf.text(`Recaudación neta:   $${totalNeto.toFixed(2)}`,       col4, finalY + 15);

        // Línea final
        pdf.setDrawColor(150);
        pdf.line(40, finalY + 25, pdf.internal.pageSize.width - 40, finalY + 25);

        pdf.setFontSize(7);
        pdf.setTextColor(120);
        pdf.text(
            `Documento generado el ${new Date().toLocaleString("es-MX")} — Sistema de Recaudación`,
            pdf.internal.pageSize.width / 2,
            finalY + 38,
            { align: "center" }
        );

        // 5. Descargar
        pdf.save(`Recaudacion_${nombreMes}_${anio}.pdf`);

    } catch (error) {
        console.error(error);
        alert("Error al generar el PDF");
    }
};