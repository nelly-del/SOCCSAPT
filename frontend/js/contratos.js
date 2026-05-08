//Redireccionar

document.getElementById("menu").onclick = () => {
  window.location.href = "menu.html";
};


function cargarTabla() {
  const tbody = document.getElementById("tabla-body");

  datos.forEach(d => {
    let totalRec = d.recargos * d.meses;
    let importe = d.cuota * d.meses;
    let total = importe + totalRec;

    tbody.innerHTML += `
      <tr>
        <td>${d.contrato}</td>
        <td>${d.anterior}</td>
        <td>${d.nombre}</td>
        <td>${d.domProp}</td>
        <td>${d.domCont}</td>
        <td>${d.tipo}</td>
        <td>${d.inicio}</td>
        <td>${d.actual}</td>
        <td>${d.meses}</td>
        <td>$${d.cuota}</td>
        <td>$${d.recargos}</td>
        <td>$${totalRec}</td>
        <td>$${importe}</td>
        <td>$${total}</td>
      </tr>
    `;
  });
}

cargarTabla();