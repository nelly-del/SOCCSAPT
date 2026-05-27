const tabla =
document.getElementById(
  "tablaAdeudos"
);

// ============================
// BUSCAR CONTRATO
// ============================
document.getElementById(
  "idContrato"
).addEventListener("change",async()=>{

  const id =
  document.getElementById(
    "idContrato"
  ).value;

  if(!id){

    return;

  }

  try{

    const res = await fetch(

      `http://localhost:3000/contrato/${id}`

    );

    if(!res.ok){

      mostrarModal(
        "Contrato no encontrado"
      );

      return;

    }

    const data =
    await res.json();

    // LLENAR DATOS
    document.getElementById(
      "codigoContribuyente"
    ).value =
    data.codigo_contribuyente;

    document.getElementById(
      "contribuyente"
    ).value =
    data.nombre;

  }catch(error){

    mostrarModal(
      "Error al buscar contrato"
    );

  }

});

// ============================
// GENERAR RECIBO
// ============================
document.getElementById(
  "btnGenerar"
).onclick = async ()=>{

  const idContrato =
  document.getElementById(
    "idContrato"
  ).value;

  const servicio =
  document.getElementById(
    "servicio"
  ).value;

  const mesInicio =
  document.getElementById(
    "mesInicio"
  ).value;

  const mesFin =
  document.getElementById(
    "mesFin"
  ).value;

  const mesesMorosos =
  document.getElementById(
    "mesesMorosos"
  ).value;

  const importe =
  document.getElementById(
    "importe"
  ).value;

  const observaciones =
  document.getElementById(
    "observaciones"
  ).value;

  // VALIDACIONES
  if(

    !idContrato ||
    !servicio ||
    !mesInicio ||
    !mesFin ||
    !importe

  ){

    mostrarModal(
      "Complete todos los campos"
    );

    return;

  }

  if(mesFin < mesInicio){

    mostrarModal(
      "Ingrese un rango válido"
    );

    return;

  }

  try{

    const res = await fetch(

      "http://localhost:3000/adeudos",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          id_contrato:idContrato,
          servicio,
          mes_inicio:mesInicio,
          mes_fin:mesFin,
          meses_morosos:mesesMorosos,
          importes:importe,
          observaciones

        })

      }

    );

    const data =
    await res.json();

    mostrarModal(
      data.mensaje
    );

    cargarAdeudos();

  }catch(error){

    mostrarModal(
      "Error al generar recibo"
    );

  }

};

// ============================
// CARGAR ADEUDOS
// ============================
async function cargarAdeudos(){

  try{

    const res =
    await fetch(

      "http://localhost:3000/adeudos"
    );

    const data =
    await res.json();

    tabla.innerHTML = "";

    if(data.length === 0){

      tabla.innerHTML = `

        <tr>

          <td colspan="6">

            No existen adeudos

          </td>

        </tr>

      `;

      return;

    }

    data.forEach((a)=>{

      tabla.innerHTML += `

        <tr>

          <td>${a.id_contrato}</td>

          <td>${a.contribuyente}</td>

          <td>${a.meses_morosos}</td>

          <td>$${a.importes}</td>

          <td class="estado-pendiente">

            Pendiente

          </td>

        </tr>

      `;

    });

  }catch(error){

    mostrarModal(
      "Error al cargar adeudos"
    );

  }

}

// ============================
// MODAL
// ============================
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

// ============================
// INICIO
// ============================
cargarAdeudos();