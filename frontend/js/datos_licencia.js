
// BOTON REGRESAR


document.querySelector(
  ".btn-regresar"
).onclick = ()=>{

  window.location.href =
  "menu.html";

};


// MOSTRAR NOMBRE ARCHIVOS

document.getElementById(
  "archivoCer"
).addEventListener("change",(e)=>{

  document.getElementById(
    "nombreCer"
  ).textContent =

  e.target.files[0]?.name ||

  "Ningún archivo seleccionado";

});

document.getElementById(
  "archivoKey"
).addEventListener("change",(e)=>{

  document.getElementById(
    "nombreKey"
  ).textContent =

  e.target.files[0]?.name ||

  "Ningún archivo seleccionado";

});


// BOTON GUARDAR


document.getElementById(
  "guardar"
).onclick = async ()=>{

  
  // OBTENER DATOS


  const folioLicencia =
  document.getElementById(
    "foliolicencia"
  ).value;

  const rfc =
  document.getElementById(
    "rfc"
  ).value;

  const razon =
  document.getElementById(
    "razon"
  ).value;

  const fechaInicio =
  document.getElementById(
    "fechaInicio"
  ).value;

  const fechaFin =
  document.getElementById(
    "fechaFin"
  ).value;

  const estado =
  document.getElementById(
    "estado"
  ).value;

  const municipio =
  document.getElementById(
    "municipio"
  ).value;

  const localidad =
  document.getElementById(
    "localidad"
  ).value;

  const colonia =
  document.getElementById(
    "colonia"
  ).value;

  const calle =
  document.getElementById(
    "calle"
  ).value;

  const numExterior =
  document.getElementById(
    "numExterior"
  ).value;

  const numInterior =
  document.getElementById(
    "numInterior"
  ).value;

  const cp =
  document.getElementById(
    "cp"
  ).value;

  const referencia =
  document.getElementById(
    "referencia"
  ).value;

  const serie =
  document.getElementById(
    "serie"
  ).value;

  const regimen =
  document.getElementById(
    "regimen"
  ).value;

  const passwordCert =
  document.getElementById(
    "passwordCert"
  ).value;

  const archivoCer =
  document.getElementById(
    "archivoCer"
  ).files[0];

  const archivoKey =
  document.getElementById(
    "archivoKey"
  ).files[0];

 
  // VALIDACIONES


  if(rfc.length !== 13){

    mostrarModal(
      "Ingrese un RFC válido de 13 caracteres"
    );

    return;

  }

  if(fechaFin < fechaInicio){

    mostrarModal(
      "La fecha de término no puede ser menor a la de inicio"
    );

    return;

  }

  if(cp.length !== 5){

    mostrarModal(
      "El código postal debe contener 5 dígitos"
    );

    return;

  }

  if(!archivoCer || !archivoKey){

    mostrarModal(
      "Debe adjuntar los archivos de certificación"
    );

    return;

  }

  if(passwordCert.trim() === ""){

    mostrarModal(
      "Ingrese la contraseña de la llave privada"
    );

    return;

  }

 
  // FORMDATA


  const formData = new FormData();

  formData.append(
    "folio_licencia",
    folioLicencia
  );

  formData.append(
    "rfc",
    rfc
  );

  formData.append(
    "razon_social",
    razon
  );

  formData.append(
    "fecha_inicio",
    fechaInicio
  );

  formData.append(
    "fecha_fin",
    fechaFin
  );

  formData.append(
    "estado",
    estado
  );

  formData.append(
    "municipio",
    municipio
  );

  formData.append(
    "localidad",
    localidad
  );

  formData.append(
    "colonia",
    colonia
  );

  formData.append(
    "calle",
    calle
  );

  formData.append(
    "numero_exterior",
    numExterior
  );

  formData.append(
    "numero_interior",
    numInterior
  );

  formData.append(
    "cp",
    cp
  );

  formData.append(
    "referencia",
    referencia
  );

  formData.append(
    "serie",
    serie
  );

  formData.append(
    "regimen_fiscal",
    regimen
  );

  formData.append(
    "password_certificado",
    passwordCert
  );

  formData.append(
    "archivo_cer",
    archivoCer
  );

  formData.append(
    "archivo_key",
    archivoKey
  );


  // ENVIAR


  try{

    const res = await fetch(

      "http://localhost:3000/licencia",

      {

        method:"POST",

        body:formData

      }

    );

    const data =
    await res.json();

    mostrarModal(
      data.mensaje
    );

    // LIMPIAR FORMULARIO


    document.querySelectorAll(
      ".campo input"
    ).forEach(input=>{

      input.value = "";

    });

    document.getElementById(
      "nombreCer"
    ).textContent =
    "Ningún archivo seleccionado";

    document.getElementById(
      "nombreKey"
    ).textContent =
    "Ningún archivo seleccionado";

  }catch(error){

    mostrarModal(
      "Error al guardar los datos de la licencia"
    );

  }

};


// FUNCIONES MODAL


function mostrarModal(mensaje){

  document.getElementById(
    "mensajeModal"
  ).textContent = mensaje;

  document.getElementById(
    "modal"
  ).style.display = "flex";

}

function cerrarModal(){

  document.getElementById(
    "modal"
  ).style.display = "none";

}