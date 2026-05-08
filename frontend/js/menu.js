
function ir(seccion) {
    
    switch (seccion) {
        case 'contrato':
            window.location.href = "contratos.html";
            break;
        case 'contribuyentes':
            window.location.href = "listado_cont.html";
            break;
        case 'pagos':
            window.location.href = "pagos.html";
            break;
        case 'reportes':
            window.location.href = "reportes.html";
            break;
        case 'configuracion':
            window.location.href = "usuarios.html";
            break;
        default:
            console.error("La sección no existe");
    }
}


function salir() {
    const modal = document.getElementById('modalSalir');
    modal.style.display = 'flex'; 
}


function cerrarModal() {
    const modal = document.getElementById('modalSalir');
    modal.style.display = 'none';
}


function confirmarSalida() {
    
    window.location.href = "login.html";
}

//Ocultar opciones
function abrirAjustes() {
    const claveSecreta = "AdminTlax2026"; // Esta es tu clave privada
    const intento = prompt("Clave de acceso para administrador:");

    if (intento === claveSecreta) {
        window.location.href = "roles.html";
    } else {
        alert("Acceso denegado: Clave incorrecta.");
    }
}
//PERMISOS
const permisos = JSON.parse(localStorage.getItem("permisos"));

const puedeVer = permisos.some(p => 
  p.modulo === "Contribuyentes" && p.ver == 1
);

if (!puedeVer) {
  document.getElementById("contribuyentes").style.display = "none";
}