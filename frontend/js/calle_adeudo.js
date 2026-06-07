document.addEventListener("DOMContentLoaded", () => {
    const selectSeccion = document.getElementById("usuarioSelect");
    const barraBusqueda = document.querySelector(".barra-busqueda");
    const inputFecha = document.getElementById("fechaCorte");
    const tablaBody = document.querySelector("table tbody");
    const totalRegistrosTxt = document.querySelector(".tabla-container p strong");

    // Función principal para pedir los datos filtrados al servidor
    function cargarAdeudos() {
        const seccion = selectSeccion ? selectSeccion.value : "";
        const buscar = barraBusqueda ? barraBusqueda.value.trim() : "";
        const fecha = inputFecha ? inputFecha.value : "";

        if (!tablaBody) return; 

        // Construimos la URL con los parámetros que procesará el Server
        const url = `http://localhost:3000/calles-adeudos?seccion=${encodeURIComponent(seccion)}&buscar=${encodeURIComponent(buscar)}&fecha=${fecha}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Error en la respuesta del servidor");
                return response.json();
            })
            .then(data => {
                // 1. Actualizar el contador total de calles
                if (totalRegistrosTxt) {
                    totalRegistrosTxt.textContent = `Existen ${data.total || 0} registros en total`;
                }

                // 2. Limpiar filas anteriores de la tabla
                tablaBody.innerHTML = "";

                if (!data.datos || data.datos.length === 0) {
                    tablaBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Sin adeudos encontrados para este filtro</td></tr>`;
                    actualizarGraficaVacia();
                    return;
                }

                // 3. Inyectar las nuevas filas calculadas por la BD
                data.datos.forEach((item, index) => {
                    const row = document.createElement("tr");
                    const importeFormateado = item.importes ? parseFloat(item.importes).toFixed(2) : "0.00";
                    
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${item.calle || 'No especificada'}</td>
                        <td>${item.numero_contratos || 0}</td>
                        <td>$${importeFormateado}</td>
                    `;
                    tablaBody.appendChild(row);
                });

                // 4. Actualizar el contenedor de la gráfica con la calle con mayor adeudo
                actualizarGraficaVisual(data.datos);
            })
            .catch(error => {
                console.error("Error al obtener adeudos:", error);
                tablaBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Error al cargar datos de la base de datos</td></tr>`;
            });
    }

    // Escuchar eventos de interacción para recargar de forma automática
    if (selectSeccion) selectSeccion.addEventListener("change", cargarAdeudos);
    if (inputFecha) inputFecha.addEventListener("change", cargarAdeudos);
    
    if (barraBusqueda) {
        let temporizadorBusqueda;
        barraBusqueda.addEventListener("input", () => {
            clearTimeout(temporizadorBusqueda);
            temporizadorBusqueda = setTimeout(cargarAdeudos, 400); // Debounce de 400ms
        });
    }   

    function actualizarGraficaVisual(datos) {
        const graficaContenedor = document.querySelector(".grafica-vacia");
        if (graficaContenedor && datos.length > 0) {
            graficaContenedor.style.border = "1px solid #8B0000";
            graficaContenedor.style.background = "#fff8f8";
            graficaContenedor.innerHTML = `
                <div style="color:#8B0000; padding:15px; text-align:left; font-size:14px;">
                    <strong><i class="fa-solid fa-chart-bar"></i> Resumen de Adeudos:</strong><br><br>
                    <span style="font-size:12px; color:#555;">Calle con Mayor Adeudo:</span><br>
                    <strong>${datos[0].calle || 'N/A'}</strong><br>
                    <span style="color:#c0392b; font-size:16px;">$${parseFloat(datos[0].importes).toFixed(2)}</span>
                </div>`;
        }
    }

    function actualizarGraficaVacia() {
        const graficaContenedor = document.querySelector(".grafica-vacia");
        if (graficaContenedor) {
            graficaContenedor.style.border = "2px dashed #ccc";
            graficaContenedor.style.background = "white";
            graficaContenedor.innerHTML = "Sin datos";
        }
    }

    // Primera carga al abrir la pantalla
    cargarAdeudos();
});