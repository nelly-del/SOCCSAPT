let datos = [];

// ==================== OBTENER DATOS ====================
async function obtenerDatos() {
  try {
    // Usar endpoint específico para reportes que filtra solo adeudos pendientes
    const respuesta = await fetch("http://localhost:3000/reporte-adeudos");
    datos = await respuesta.json();
    cargarTabla(datos);
    cargarCalles();
    renderizarGrafica(datos);
  } catch (error) {
    console.error(error);
    alert("Error al cargar adeudos");
  }
}

// ==================== CARGAR CALLES ====================
function cargarCalles() {
  const select = document.getElementById("calle");
  const calles = [...new Set(datos.map(d => d.domCont).filter(Boolean))];
  select.innerHTML = '<option value="">Seleccione</option>';
  calles.forEach(calle => {
    const option = document.createElement("option");
    option.value = calle;
    option.textContent = calle;
    select.appendChild(option);
  });
}

// ==================== CARGAR TABLA ====================
function cargarTabla(lista) {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  lista.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.contrato}</td>
       
        <td>${item.nombre}</td>
        <td>${item.domProp || ""}</td>
        <td>${item.domCont || ""}</td>
        <td>${item.tipo || ""}</td>
        <td>—</td>
        <td>—</td>
        <td>${item.meses || 0}</td>
        <td>$0.00</td>
        <td>$0.00</td>
        <td>$0.00</td>
        <td>$${Number(item.importes || 0).toFixed(2)}</td>
        <td>$${Number(item.importes || 0).toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("infoRegistros").textContent = `Existen ${lista.length} registros en total`;
}

// ==================== GRÁFICA DE ADEUDOS ====================
function renderizarGrafica(lista) {
  const canvas = document.getElementById("graficaAdeudos");
  if (!canvas) return;

  // Agrupar por tipo de servicio
  const grupos = {};
  lista.forEach(item => {
    const tipo = item.tipo || "Sin tipo";
    if (!grupos[tipo]) grupos[tipo] = { meses: 0, importe: 0, contratos: 0 };
    grupos[tipo].meses    += Number(item.meses || 0);
    grupos[tipo].importe  += Number(item.importes || 0);
    grupos[tipo].contratos++;
  });

  const etiquetas = Object.keys(grupos);
  const importes  = etiquetas.map(k => grupos[k].importe);
  const colores   = ["#3b82f6","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4"];

  if (window.graficaAdeudosInstance) window.graficaAdeudosInstance.destroy();

  window.graficaAdeudosInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: etiquetas,
      datasets: [{
        label: "Total adeudado ($)",
        data: importes,
        backgroundColor: colores.slice(0, etiquetas.length),
        borderColor: colores.slice(0, etiquetas.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: true, text: "Adeudos por tipo de uso" }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => "$" + v.toFixed(2) }
        }
      }
    }
  });
}

// ==================== INICIO ====================
window.onload = () => { obtenerDatos(); };

document.getElementById("menu").onclick = () => { window.location.href = "menu.html"; };
document.getElementById("regresar").onclick = () => { history.back(); };

document.getElementById("limpiar").onclick = () => {
  document.getElementById("fechaCorte").value = "";
  document.getElementById("calle").selectedIndex = 0;
  cargarTabla(datos);
  renderizarGrafica(datos);
};

document.getElementById("buscar").onclick = () => {
  const calle = document.getElementById("calle").value;
  if (calle === "") { cargarTabla(datos); renderizarGrafica(datos); return; }
  const filtrados = datos.filter(d => d.domCont === calle);
  cargarTabla(filtrados);
  renderizarGrafica(filtrados);
};

document.getElementById("descargar").onclick = () => {
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Adeudos");
  XLSX.writeFile(wb, "reporte_adeudos.xlsx");
};
