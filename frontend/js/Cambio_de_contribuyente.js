let contribuyenteActual = null;
let accionModal = null;

/* ELEMENTOS HTML */
const formulario = document.getElementById("formContribuyente");
const botonCancelar = document.getElementById("btnCancelar");
const inputBusqueda = document.getElementById("busqueda");
const botonMenu = document.getElementById("btnMenu");
const listaResultados = document.getElementById("listaResultados");

/* BOTÓN MENÚ */
botonMenu.addEventListener("click", function(){
    mostrarModal("¿Desea regresar al menú?", function(){
        window.location.href = "menu.html";
    });
});

/* BOTÓN CANCELAR */
botonCancelar.addEventListener("click", function(){
    mostrarModal("¿Desea cancelar los cambios?", function(){
        formulario.reset();
        listaResultados.innerHTML = "";
        contribuyenteActual = null;
    });
});

/* BUSCADOR */
const botonBuscar = document.getElementById("btnBuscar");

botonBuscar.addEventListener("click", function(){
    const texto = document.getElementById("busqueda").value.trim();
    const listaResultados = document.getElementById("listaResultados");
    
    listaResultados.innerHTML = "";

    if(texto === "") {
        mostrarModal("Por favor, ingresa un código para buscar");
        return;
    }

    fetch(`http://localhost:3000/buscarContribuyente?texto=${encodeURIComponent(texto)}`)
        .then(res => res.json())
        .then(resultados => {
            if(resultados.length === 0){
                mostrarModal("No se encontró ningún contribuyente con ese código");
                return;
            }

            resultados.forEach(function(c){
                listaResultados.innerHTML += `
                    <div class="resultado-item" 
                    onclick="seleccionarContribuyente('${c.codigo_contribuyente}')"
                    style="cursor: pointer; padding: 10px; border-bottom: 1px solid #ccc;">
                        ${c.codigo_contribuyente} - ${c.rfc}
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error("Error al buscar:", err);
            mostrarModal("Error al conectar con el servidor");
        });
});

/* SELECCIONAR CONTRIBUYENTE */
function seleccionarContribuyente(codigo){
    
    fetch(`http://localhost:3000/buscarContribuyente?texto=${encodeURIComponent(codigo)}`)
        .then(res => res.json())
        .then(resultados => {
            const encontrado = resultados.find(c => c.codigo_contribuyente === codigo);
            if(!encontrado) return;

            contribuyenteActual = encontrado;

            document.getElementById("codigo").value = encontrado.codigo_contribuyente || "";
            document.getElementById("apellidoPaterno").value = encontrado.apellido_paterno || "";
            document.getElementById("apellidoMaterno").value = encontrado.apellido_materno || "";
            document.getElementById("nombre").value = encontrado.nombre || "";
            document.getElementById("estado").value = encontrado.estado || "";
            document.getElementById("municipio").value = encontrado.municipio || "";
            document.getElementById("localidad").value = encontrado.localidad || "";
            document.getElementById("colonia").value = encontrado.colonia || "";
            document.getElementById("calle").value = encontrado.calle || "";
            document.getElementById("numExt").value = encontrado.numero_exterior || "";
            document.getElementById("numInt").value = encontrado.numero_interior || "";
            document.getElementById("cp").value = encontrado.cp || "";
            document.getElementById("razonSocial").value = encontrado.razon_social || "";
            document.getElementById("rfc").value = encontrado.rfc || "";
            document.getElementById("correo").value = encontrado.correo || "";
            document.getElementById("telefono").value = encontrado.telefono || "";
            document.getElementById("regimenFiscal").value = encontrado.regimen_fiscal || "";
            document.getElementById("propietario").value = encontrado.propietario || "";
            document.getElementById("contrato").value = encontrado.contrato || "";
            document.getElementById("estatus").value = encontrado.estatus || "";

            listaResultados.innerHTML = "";
        })
        .catch(err => {
            console.error("Error al seleccionar:", err);
            mostrarModal("Error al cargar el contribuyente");
        });
}

/* GUARDAR CAMBIOS */
formulario.addEventListener("submit", function(event){
    event.preventDefault();

    if(!contribuyenteActual){
        mostrarModal("Primero busca y selecciona un contribuyente");
        return;
    }

    mostrarModal("¿Desea guardar los cambios?", function(){
        const datos = {
            codigo: document.getElementById("codigo").value,
            apellidoP: document.getElementById("apellidoPaterno").value,
            apellidoM: document.getElementById("apellidoMaterno").value,
            nombre: document.getElementById("nombre").value,
            estado: document.getElementById("estado").value,
            municipio: document.getElementById("municipio").value,
            localidad: document.getElementById("localidad").value,
            colonia: document.getElementById("colonia").value,
            calle: document.getElementById("calle").value,
            numExt: document.getElementById("numExt").value,
            numInt: document.getElementById("numInt").value,
            cp: document.getElementById("cp").value,
            razon: document.getElementById("razonSocial").value,
            rfc: document.getElementById("rfc").value,
            correo: document.getElementById("correo").value,
            telefono: document.getElementById("telefono").value,
            regimen: document.getElementById("regimenFiscal").value,
            propietario: document.getElementById("propietario").value,
            contrato: document.getElementById("contrato").value,
            estatus: document.getElementById("estatus").value
        };

        // Cambiado a ruta relativa
        fetch("http://localhost:3000/actualizarContribuyente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    
        })
        .then(res => res.text())
        .then(respuesta => {
            if(respuesta.includes("Error")){
                mostrarModal("Error al guardar: " + respuesta);
            } else {
                formulario.reset();
                listaResultados.innerHTML = "";
                contribuyenteActual = null;
                mostrarModal("Cambios guardados correctamente");
            }
        })
        .catch(err => {
            console.error("Error al guardar:", err);
            mostrarModal("Error al conectar con el servidor");
        });
    });
});

/* Funciones auxiliares de modal sin cambios */
function mostrarModal(mensaje, accion){
    document.getElementById("textoModal").textContent = mensaje;
    document.getElementById("modal").style.display = "flex";
    accionModal = accion;
    const btnCancelarModal = document.getElementById("btnCancelarModal");
    btnCancelarModal.style.display = accion ? "inline-block" : "none";
}

function cerrarModal(){
    document.getElementById("modal").style.display = "none";
    if(accionModal){
        accionModal();
        accionModal = null;
    }
}

function cancelarModal(){
    document.getElementById("modal").style.display = "none";
    accionModal = null;
}