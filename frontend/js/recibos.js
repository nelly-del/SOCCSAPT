const tabla = document.getElementById("tablaAdeudos");

// ============================
// VARIABLES GLOBALES DE CONTROL
// ============================
let porcentajeDescuento = 0;

// ============================
// BUSCAR CONTRATO
// ============================
document.getElementById("idContrato").addEventListener("change", async () => {
  const id = document.getElementById("idContrato").value;

  if (!id) return;

  try {
    const res = await fetch(`http://localhost:3000/contrato/${id}`);

    if (!res.ok) {
      mostrarModal("Contrato no encontrado");
      return;
    }

    const data = await res.json();

    document.getElementById("codigoContribuyente").value = data.codigo_contribuyente;
    document.getElementById("contribuyente").value = data.nombre;

  } catch (error) {
    mostrarModal("Error al buscar contrato");
  }
});

// ============================
// EVENTOS PARA EL IMPORTE MANUAL
// ============================
document.getElementById("importe").addEventListener("input", () => {
  // Guardamos el valor limpio que escribe el usuario como base original
  const valorIngresado = parseFloat(document.getElementById("importe").value);
  if (!isNaN(valorIngresado) && valorIngresado > 0) {
    document.getElementById("importe").setAttribute("data-original", valorIngresado);
  }
});

// ============================
// CONTROLADOR DE DESCUENTOS
// ============================
document.getElementById("descuento").addEventListener("change", () => {
  const selectDescuento = document.getElementById("descuento");
  const option = selectDescuento.selectedOptions[0];
  
  if (!option || !option.value) {
    porcentajeDescuento = 0;
    return;
  }

  porcentajeDescuento = parseFloat(option.dataset.valor || 0);
});

// ============================
// GENERAR RECIBO + ADEUDO + TICKET
// ============================
document.getElementById("btnGenerar").onclick = async () => {
  const idContrato = document.getElementById("idContrato").value;
  const servicio = document.getElementById("servicio").value;
  const mesInicio = document.getElementById("mesInicio").value;
  const mesFin = document.getElementById("mesFin").value;
  const mesesMorosos = document.getElementById("mesesMorosos").value;
  const observaciones = document.getElementById("observaciones").value;
  const idDescuentoRaw = document.getElementById("descuento").value;
  const idDescuento = (idDescuentoRaw && idDescuentoRaw !== "") ? idDescuentoRaw : null;

  // El importe digitado por el usuario es nuestra base original
  const importeCaja = parseFloat(document.getElementById("importe").value) || 0;

  if (!idContrato || !servicio || !mesInicio || !mesFin || importeCaja <= 0) {
    mostrarModal("Complete todos los campos con importes válidos");
    return;
  }

  if (mesFin < mesInicio) {
    mostrarModal("Ingrese un rango válido");
    return;
  }

  // Calculamos el cobro neto real final que irá a la base de datos
  const totalFinalCalculado = importeCaja - (importeCaja * (porcentajeDescuento / 100));

  try {
    const res = await fetch("http://localhost:3000/adeudos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_contrato: idContrato,
        servicio,
        mes_inicio: mesInicio,
        mes_fin: mesFin,
        meses_morosos: mesesMorosos,
        importes: totalFinalCalculado.toFixed(2), // Se guarda el neto con descuento
        observaciones,
        id_descuento: idDescuento
      })
    });

    const data = await res.json();
    mostrarModal(data.mensaje);

    if (res.ok) {
      cargarAdeudos();

      const textoDescuento = document.getElementById("descuento").selectedOptions[0].text;

      // GENERAR TICKET (PDF ANGOSTO)
      await generarTicketPDF({
        contrato: idContrato,
        codigo: document.getElementById("codigoContribuyente").value,
        contribuyente: document.getElementById("contribuyente").value,
        servicio,
        periodo: `${mesInicio} al ${mesFin}`,
        meses: mesesMorosos,
        importe: importeCaja.toFixed(2), // Tus 300 base
        descuento: porcentajeDescuento > 0 ? textoDescuento : "Ninguno",
        total: totalFinalCalculado.toFixed(2) // El total neto real
      });

      // Limpieza de formulario básica opcional si la requieres
      document.getElementById("importe").removeAttribute("data-original");
    }

  } catch (error) {
    mostrarModal("Error al generar recibo");
  }
};

// ============================
// GENERAR FORMATO TICKET (PDF OCHO CENTÍMETROS)
// ============================
async function generarTicketPDF(datos) {
  const { jsPDF } = window.jspdf;
  
  // Creamos un PDF con tamaño personalizado de Ticket (80mm de ancho x 150mm de alto)
  // 80mm = 226pt  |  150mm = 425pt
  const pdf = new jsPDF("p", "pt", [226, 425]);
  
  // Configuración de estilos para el ticket térmico
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("TETLA", 113, 30, { align: "center" });
  
  pdf.setFontSize(10);
  pdf.text("TICKET DE PAGO", 113, 45, { align: "center" });
  pdf.text("------------------------------------------", 113, 55, { align: "center" });
  
  // Cuerpo del Ticket (Alineación clásica Izquierda - Derecha)
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  
  let y = 70;
  const alineacionDatos = [
    { label: "Fecha:", val: new Date().toLocaleDateString("es-MX") },
    { label: "Contrato:", val: datos.contrato },
    { label: "Código:", val: datos.codigo },
    { label: "Contribuyente:", val: datos.contribuyente.substring(0, 25) }, // Evita que se desborde el nombre
    { label: "Servicio:", val: datos.servicio },
    { label: "Periodo:", val: datos.periodo },
    { label: "Meses Morosos:", val: datos.meses }
  ];

  alineacionDatos.forEach(item => {
    pdf.setFont("helvetica", "bold");
    pdf.text(item.label, 15, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(item.val), 210, y, { align: "right" });
    y += 15;
  });

  pdf.setFont("helvetica", "bold");
  pdf.text("------------------------------------------", 113, y, { align: "center" });
  y += 15;

  // Valores Económicos
  pdf.text("Importe Base:", 15, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(`$${datos.importe}`, 210, y, { align: "right" });
  y += 15;

  pdf.setFont("helvetica", "bold");
  pdf.text("Descuento:", 15, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(datos.descuento, 210, y, { align: "right" });
  y += 20;

  // Total Destacado
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("TOTAL FINAL:", 15, y);
  pdf.text(`$${datos.total}`, 210, y, { align: "right" });
  y += 25;

  // Pie de ticket administrativo
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "italic");
  pdf.text("¡Gracias por tu pago realizado!", 113, y, { align: "center" });
  y += 10;
  pdf.text("Conserve este comprobante", 113, y, { align: "center" });

  // Descarga directa del archivo PDF compilado desde código sin depender de HTML externos
  pdf.save(`Ticket_Contrato_${datos.contrato}.pdf`);
}

// ============================
// CARGAR ADEUDOS
// ============================
async function cargarAdeudos() {
  try {
    const res = await fetch("http://localhost:3000/adeudos");
    const data = await res.json();

    const tabla = document.getElementById("tablaAdeudos");
    tabla.innerHTML = "";

    if (data.length === 0) {
      tabla.innerHTML = `<tr><td colspan="6">No existen adeudos</td></tr>`;
      return;
    }

    data.forEach(a => {
      const servicioTexto = a.servicio || "Agua";
      const importeFormateado = parseFloat(a.importes || 0).toFixed(2);

      tabla.innerHTML += `
        <tr>
          <td>${a.id_contrato}</td>
          <td>${a.nombre || "Sin Nombre"}</td>
          <td>${servicioTexto}</td>
          <td>${a.meses_morosos}</td>
          <td>$${importeFormateado}</td>
          <td class="${a.timbrado == 1 ? 'estado-pagado' : 'estado-pendiente'}">
        ${a.timbrado == 1 ? 'Pagado' : 'Pendiente'}
      </td>
        </tr>`;
    });

  } catch (error) {
    console.error("Error al cargar adeudos:", error);
  }
}

// ============================
// DESCUENTOS & INICIALIZACIÓN
// ============================
async function cargarDescuentos() {
  try {
    const res = await fetch("http://127.0.0.1:3000/descuentos");
    const descuentos = await res.json();

    const select = document.getElementById("descuento");
    select.innerHTML = '<option value="">Sin descuento</option>';

    descuentos.forEach(d => {
      select.innerHTML += `
        <option value="${d.id_descuento}" data-valor="${d.valor}">
          ${d.tipo} (${d.valor}%)
        </option>`;
    });
  } catch (error) {
    console.error("Error al cargar descuentos:", error);
  }
}

// MODAL CONTROLES
function mostrarModal(mensaje) {
  document.getElementById("mensajeModal").textContent = mensaje;
  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// EJECUTAR AL INICIAR
cargarAdeudos();
cargarDescuentos();