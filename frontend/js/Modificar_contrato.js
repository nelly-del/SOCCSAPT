/* MODIFICAR CONTRATO.JS */

let contratoActual = null;

// Elementos del DOM
const formulario = document.getElementById("formContrato");
const inputBusqueda = document.getElementById("busqueda");
const btnBuscar = document.getElementById("btnBuscar");
const btnRegresar = document.getElementById("regresar");
const btnGuardar = document.getElementById("guardar");
const btnCancelar = document.getElementById("cancelar");
const modal = document.getElementById("modal");
const textoModal = document.getElementById("textoModal");

// BUSCAR (HÍBRIDO: Por ID de Contrato o Código de Contribuyente)
btnBuscar.addEventListener("click", buscarContrato);
inputBusqueda.addEventListener("keypress", (e) => { if (e.key === "Enter") buscarContrato(); });

async function buscarContrato() {
    const valor = inputBusqueda.value.trim();
    if (valor === "") { mostrarModal("Ingrese un ID de contrato o Código"); return; }

    try {
        const respuesta = await fetch(`http://localhost:3000/buscarContrato/${valor}`);
        const data = await respuesta.json();

        if (data.error) {
            mostrarModal("No se encontró ningún contrato con ese dato");
            formulario.reset();
            return;
        }

        // Si es un array, cargamos el primero
        contratoActual = Array.isArray(data) ? data[0] : data;
        cargarDatos(contratoActual);
    } catch (error) {
        mostrarModal("Error al conectar con el servidor");
    }
}

function cargarDatos(c) {
    document.getElementById("id_contrato").value = c.id_contrato || "";
    document.getElementById("codigo_contribuyente").value = c.codigo_contribuyente || "";
    document.getElementById("descripcion").value = c.nombre || "";
    document.getElementById("fecha").value = c.creacion_contrato ? c.creacion_contrato.split('T')[0] : "";
    document.getElementById("contrato_anterior").value = c.contrato_anterior ? c.contrato_anterior.split('T')[0] : "";
    document.getElementById("bomba").value = c.bomba || "";
    document.getElementById("tipo_uso").value = c.tipo_de_uso || "";
    document.getElementById("unidad").value = c.unidad || "";

    // Datos del contribuyente
    document.getElementById("estado").value = c.estado || "";
    document.getElementById("municipio").value = c.municipio || "";
    document.getElementById("localidad").value = c.localidad || "";
    document.getElementById("colonia").value = c.colonia || "";
    document.getElementById("calle").value = c.calle || "";
    document.getElementById("numExt").value = c.numero_exterior || "";
    document.getElementById("numInt").value = c.numero_interior || "";
    document.getElementById("cp").value = c.cp || "";
}

// GUARDAR
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!contratoActual) { mostrarModal("Busque un contrato primero"); return; }

    const datos = {
        id_contrato: document.getElementById("id_contrato").value,
        codigo_contribuyente: document.getElementById("codigo_contribuyente").value,
        nombre: document.getElementById("descripcion").value,
        creacion_contrato: document.getElementById("fecha").value,
        contrato_anterior: document.getElementById("contrato_anterior").value,
        unidad: document.getElementById("unidad").value,
        bomba: document.getElementById("bomba").value,
        tipo_de_uso: document.getElementById("tipo_uso").value
    };

    const res = await fetch("http://localhost:3000/actualizarContrato", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });
    const msg = await res.text();
    mostrarModal(msg);
});

// MODALES
function mostrarModal(mensaje) {
    textoModal.textContent = mensaje;
    modal.style.display = "flex";
}

function cerrarModal() { modal.style.display = "none"; }
function cancelarModal() { modal.style.display = "none"; }

btnRegresar.addEventListener("click", () => window.history.back());
btnCancelar.addEventListener("click", () => { formulario.reset(); contratoActual = null; });