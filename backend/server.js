const express = require("express");
const cors = require("cors");
const conexion = require("./conexion");

const app = express();

app.use(cors());
app.use(express.json()); 

///////////////////////////////////////////////////////////////////////////////////////////////////
// REGISTRO DE USUARIOS 
app.post("/registro", (req, res) => {
    const { usuario, correo, contrasena, id_rol } = req.body;
    const sql = `INSERT INTO usuarios (usuario, correo, contrasena, id_rol, estado, fecha_creacion) VALUES (?, ?, ?, ?, 1, NOW())`;
    conexion.query(sql, [usuario, correo, contrasena, id_rol], (err, result) => {
        if (err) {
            console.error("Error SQL:", err);
            res.status(500).json({ exito: false, mensaje: "Error al registrar: " + err.sqlMessage });
        } else {
            res.json({ exito: true, mensaje: "Usuario creado con éxito", id: result.insertId });
        }
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
// LOGIN
app.post("/login", (req, res) => {
    const { correo, contrasena } = req.body;
    const sql = `SELECT id_usuario, usuario, id_rol, estado FROM usuarios WHERE correo = ? AND contrasena = ?`;
    conexion.query(sql, [correo, contrasena], (err, results) => {
        if (err) return res.status(500).json({ mensaje: "Error en el servidor" });
        if (results.length === 0) return res.status(401).json({ exito: false, mensaje: "Correo o contraseña incorrectos" });
        const user = results[0];
        if (user.estado === 0) return res.status(403).json({ mensaje: "Usuario desactivado. Contacte al administrador." });
        const sqlPermisos = "SELECT modulo, ver, nuevo, editar, eliminar FROM permisos WHERE id_rol = ?";
        conexion.query(sqlPermisos, [user.id_rol], (err2, permisos) => {
            if (err2) { console.error("Error al buscar permisos:", err2); return res.status(500).json({ mensaje: "Error al cargar permisos" }); }
            res.json({ exito: true, usuario: { id: user.id_usuario, nombre: user.usuario, correo: user.correo, rol: user.id_rol }, permisos: permisos || [] });
        });
    });
});

/////////////////////////////////////////////////////////////////////////////////////
// PERMISOS
app.post("/permisos", (req, res) => {
  const { id_rol, permisos } = req.body;
  conexion.query("DELETE FROM permisos WHERE id_rol = ?", [id_rol], (err) => {
    if (err) { console.error(err); return res.status(500).send("Error"); }
    if (permisos.length === 0) return res.send("Permisos eliminados");
    const valores = permisos.map(p => [id_rol, p.modulo, p.ver, p.nuevo, p.editar, p.eliminar]);
    const sql = "INSERT INTO permisos (id_rol, modulo, ver, nuevo, editar, eliminar) VALUES ?";
    conexion.query(sql, [valores], (err2) => {
      if (err2) { console.error(err2); return res.status(500).send("Error al insertar"); }
      res.send("Permisos guardados");
    });
  });
});

// ROLES
app.get("/roles", (req, res) => {
  conexion.query("SELECT * FROM roles", (err, result) => {
    if (err) { console.error(err); return res.status(500).send("Error"); }
    res.json(result);
  });
});

////////////////////////////////////////////////////////
// REGISTRO DE UN CONTRIBUYENTE
app.post("/guardar", (req, res) => {
  const d = req.body;
  const sql = `INSERT INTO contribuyentes (codigo_contribuyente, apellido_paterno, apellido_materno, nombre, estado, municipio, localidad, colonia, calle, numero_exterior, numero_interior, cp, razon_social, rfc, correo, telefono, regimen_fiscal, propietario, contrato) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const valores = [d.codigo, d.apellidoP, d.apellidoM, d.nombre, d.estado, d.municipio, d.localidad, d.colonia, d.calle, d.numExt, d.numInt, d.cp, d.razon, d.rfc, d.correo, d.telefono, d.regimen, d.propietario, d.contrato];
  conexion.query(sql, valores, (err, result) => {
    if (err) { console.error("ERROR SQL:", err); res.send("Error: " + err.sqlMessage); }
    else res.send("Guardado correctamente");
  });
});

app.listen(3000, () => { console.log("Servidor corriendo en http://localhost:3000"); });

app.get("/contribuyentes", (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = 10;
  const offset = (pagina - 1) * limite;
  const sql = `SELECT * FROM contribuyentes LIMIT ? OFFSET ?`;
  conexion.query(sql, [limite, offset], (err, results) => {
    if (err) { console.error(err); res.send("Error"); }
    else {
      conexion.query("SELECT COUNT(*) AS total FROM contribuyentes", (err2, countResult) => {
        res.json({ datos: results, total: countResult[0].total });
      });
    }
  });
});

// DAR DE BAJA A UN CONTRIBUYENTE
app.post("/estatus", (req, res) => {
  const { codigo, estatus } = req.body;
  const sql = `UPDATE contribuyentes SET estatus = ? WHERE codigo_contribuyente = ?`;
  conexion.query(sql, [estatus, codigo], (err) => {
    if (err) { console.error(err); res.send("Error al cambiar estatus"); }
    else res.send("Estatus actualizado");
  });
});

// BUSCAR UN CONTRIBUYENTE
app.get("/buscarRFC", (req, res) => {
  const rfc = req.query.rfc;
  const sql = `SELECT * FROM contribuyentes WHERE rfc LIKE ?`;
  conexion.query(sql, [`%${rfc}%`], (err, results) => {
    if (err) { console.error(err); res.send("Error"); }
    else res.json(results);
  });
});

// EXCEL
app.get("/contribuyentes-todos", (req, res) => {
  conexion.query("SELECT * FROM contribuyentes", (err, results) => {
    if (err) return res.send("Error");
    res.json(results);
  });
});

////////////////////////////////////////////////////////////////////
// USUARIOS
app.get("/usuarios", (req, res) => {
  const sql = `SELECT u.id_usuario, u.usuario, u.correo, u.estado, r.nombre_rol FROM usuarios u INNER JOIN roles r ON u.id_rol = r.id_rol`;
  conexion.query(sql, (err, results) => {
    if (err) { console.error(err); return res.send("Error"); }
    res.json(results);
  });
});

app.delete("/eliminar-usuario", (req, res) => {
  const { id_usuario } = req.body;
  conexion.query(`DELETE FROM usuarios WHERE id_usuario = ?`, [id_usuario], (err) => {
    if (err) { console.error(err); return res.status(500).send("Error"); }
    res.send("Usuario eliminado");
  });
});

app.get("/usuario/:id", (req, res) => {
  const id = req.params.id;
  conexion.query(`SELECT * FROM usuarios WHERE id_usuario = ?`, [id], (err, result) => {
    if (err) { console.error(err); return res.send("Error"); }
    res.json(result[0]);
  });
});

app.put("/editar-usuario", (req, res) => {
  const { id_usuario, usuario, correo, contrasena, id_rol } = req.body;
  conexion.query(`UPDATE usuarios SET usuario = ?, correo = ?, contrasena = ?, id_rol = ? WHERE id_usuario = ?`, [usuario, correo, contrasena, id_rol, id_usuario], (err) => {
    if (err) { console.error(err); return res.send("Error"); }
    res.send("Usuario actualizado");
  });
});

/////////////////////////////////////////////////////////////
// CONTRATOS — listado con pago más reciente desde tabla pagos
app.get("/contratos", (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = 10;
  const offset = (pagina - 1) * limite;
  const sql = `
    SELECT
      contratos.*,
      CONCAT(contribuyentes.nombre,' ',contribuyentes.apellido_paterno,' ',contribuyentes.apellido_materno) AS nombre,
      p.mes_inicio AS pago_mes_inicio,
      p.mes_fin    AS pago_mes_fin
    FROM contratos
    LEFT JOIN contribuyentes ON contratos.codigo_contribuyente = contribuyentes.codigo_contribuyente
    LEFT JOIN pagos p ON p.id_pagos = (
      SELECT id_pagos FROM pagos
      WHERE id_contrato = contratos.id_contrato
      ORDER BY id_pagos DESC LIMIT 1
    )
    LIMIT ? OFFSET ?
  `;
  conexion.query(sql, [limite, offset], (err, results) => {
    if (err) { console.error(err); res.send("Error"); }
    else {
      conexion.query("SELECT COUNT(*) AS total FROM contratos", (err2, countResult) => {
        res.json({ datos: results, total: countResult[0].total });
      });
    }
  });
});

// TODOS LOS CONTRATOS EXCEL
app.get("/contratos-todos", (req, res) => {
  const sql = `
    SELECT
      contratos.*,
      CONCAT(contribuyentes.nombre,' ',contribuyentes.apellido_paterno,' ',contribuyentes.apellido_materno) AS nombre,
      p.mes_inicio AS pago_mes_inicio,
      p.mes_fin    AS pago_mes_fin
    FROM contratos
    LEFT JOIN contribuyentes ON contratos.codigo_contribuyente = contribuyentes.codigo_contribuyente
    LEFT JOIN pagos p ON p.id_pagos = (
      SELECT id_pagos FROM pagos
      WHERE id_contrato = contratos.id_contrato
      ORDER BY id_pagos DESC LIMIT 1
    )
  `;
  conexion.query(sql, (err, results) => {
    if (err) { console.error(err); res.send("Error"); }
    else res.json(results);
  });
});

// GUARDAR CONTRATO
app.post("/guardar-contrato", (req, res) => {
  const d = req.body;
  const sql = `INSERT INTO contratos (codigo_contribuyente, nombre, ultimo_pago, creacion_contrato, contrato_anterior, unidad, estatus, bomba, tipo_de_uso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const valores = [d.codigo_contribuyente, d.nombre_contribuyente, null, d.fecha || new Date().toISOString().split('T')[0], d.contrato_anterior || null, d.unidad, 1, d.bomba === "Principal" ? 1 : 2, d.tipo_uso];
  conexion.query(sql, valores, (err, result) => {
    if (err) { console.error("ERROR MYSQL:", err); res.status(500).send("Error al guardar contrato: " + err.sqlMessage); }
    else res.send("Contrato guardado correctamente");
  });
});

// BUSCAR CONTRIBUYENTE
app.get("/buscar-contribuyente/:codigo", (req, res) => {
  const codigo = req.params.codigo;
  const sql = `SELECT *, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) AS nombre_completo FROM contribuyentes WHERE codigo_contribuyente = ?`;
  conexion.query(sql, [codigo], (err, result) => {
    if (err) { console.error(err); return res.status(500).send("Error"); }
    if (result.length === 0) return res.json(null);
    res.json(result[0]);
  });
});

// CAMBIAR ESTATUS CONTRATO
app.put("/cambiar-estatus-contrato", (req,res)=>{
const {id_contrato, estatus } = req.body;
const sql = `
        UPDATE contratos
        SET estatus = ?
        WHERE id_contrato = ?
    `;
    conexion.query(sql,[estatus,id_contrato],(err,result)=>{if(err){return res.status(500).send("Error" );}
            res.send(
                "Estatus actualizado"
            );
        }
    );
});

////////////////////////////////////////////////////////////////////////////////////
// VALIDAR SI EL CONTRATO TIENE ADEUDOS
app.get("/validar-adeudos/:id", (req, res) => {
    const idContrato = req.params.id;
    const sql = `
        SELECT COUNT(*) AS total FROM adeudos WHERE id_contrato = ?
        AND estado = 1
    `;
    conexion.query(sql, [idContrato], (err, resultado) => {
        if(err){return res.status(500).json({error: err});}
        res.json({tieneAdeudos: resultado[0].total > 0});});
});

//////////////////////////////////////////////////////////////////////
// DATOS DE LICENCIA
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "uploads/"); },
  filename: (req, file, cb) => { cb(null, Date.now() + "-" + file.originalname); }
});
const upload = multer({ storage });

app.post("/licencia", upload.fields([{ name: "archivo_cer" }, { name: "archivo_key" }]), (req, res) => {
  const datos = req.body;
  const archivoCer = req.files["archivo_cer"][0].filename;
  const archivoKey = req.files["archivo_key"][0].filename;
  const sql = `INSERT INTO datos_licencia (folio_licencia, rfc, razon_social, fecha_inicio, fecha_fin, estado, municipio, localidad, colonia, calle, numero_exterior, numero_interior, cp, referencia, serie, regimen_fiscal, password_certificado, archivo_cer, archivo_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  conexion.query(sql, [datos.folio_licencia, datos.rfc, datos.razon_social, datos.fecha_inicio, datos.fecha_fin, datos.estado, datos.municipio, datos.localidad, datos.colonia, datos.calle, datos.numero_exterior, datos.numero_interior, datos.cp, datos.referencia, datos.serie, datos.regimen_fiscal, datos.password_certificado, archivoCer, archivoKey], (error) => {
    if (error) { console.log(error); return res.json({ mensaje: "Error al guardar los datos" }); }
    res.json({ mensaje: "Datos guardados correctamente" });
  });
});

//////////////////////////////////////////////////////////////////
// ============================================================
// ADEUDOS - POST (crear adeudo / recibo)
// ============================================================
app.post("/adeudos", async (req, res) => {
  try {
    const { id_contrato, servicio, mes_inicio, mes_fin, meses_morosos, importes, observaciones, id_descuento } = req.body;
    const sql = `INSERT INTO adeudos (id_contrato, servicio, importes, meses_morosos, fecha_adeudo, estado, timbrado, id_descuento) VALUES (?, ?, ?, ?, NOW(), 0, 0, ?)`;
    await conexion.promise().query(sql, [id_contrato, servicio, importes, meses_morosos, id_descuento || null]);
    res.json({ mensaje: "Recibo generado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al generar el adeudo" });
  }
});


// ============================================================
// ADEUDOS - GET (para módulo reportes/adeudos)
// ============================================================
app.get("/adeudos", (req, res) => {
  const sql = `
    SELECT
      c.id_contrato AS contrato,
      c.contrato_anterior,
      CONCAT(ct.nombre,' ',ct.apellido_paterno,' ',ct.apellido_materno) AS nombre,
      CONCAT(ct.calle,' ',IFNULL(ct.numero_exterior,''),', ',ct.colonia) AS domProp,
      CONCAT(ct.calle,' ',IFNULL(ct.numero_exterior,''),', ',ct.colonia) AS domCont,
      c.tipo_de_uso AS tipo,
      a.meses_morosos,
      a.importes,
      a.id_adeudo,
      a.id_contrato,
      a.servicio,
      a.timbrado,
      a.estado,
      a.fecha_adeudo,
      a.id_descuento,
      ct.nombre AS nombre_contribuyente,
      ct.codigo_contribuyente
    FROM adeudos a
    INNER JOIN contratos c ON a.id_contrato = c.id_contrato
    INNER JOIN contribuyentes ct ON c.codigo_contribuyente = ct.codigo_contribuyente
    ORDER BY a.id_adeudo DESC
  `;
  conexion.query(sql, (error, result) => {
    if (error) { console.log(error); return res.status(500).json({ mensaje: "Error al cargar adeudos" }); }
    res.json(result);
  });
});

// Obtener contrato por ID — para timbrado (pago_agua)
app.get("/contrato/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await conexion.promise().query(`
      SELECT
        c.id_contrato,
        c.codigo_contribuyente,
        c.ultimo_pago,
        c.unidad,
        c.tipo_de_uso,
        c.estatus,
        c.bomba,
        ct.nombre,
        ct.apellido_paterno,
        ct.apellido_materno,
        ct.estado,
        ct.municipio,
        ct.localidad,
        ct.calle,
        ct.colonia,
        ct.numero_exterior,
        ct.numero_interior,
        ct.cp,
        ct.rfc,
        ct.correo,
        ct.telefono,
        a.id_adeudo,
        a.importes,
        a.meses_morosos,
        a.servicio,
        a.id_descuento
      FROM contratos c
      INNER JOIN contribuyentes ct ON c.codigo_contribuyente = ct.codigo_contribuyente
      LEFT JOIN adeudos a ON a.id_adeudo = (
        SELECT id_adeudo FROM adeudos
        WHERE id_contrato = c.id_contrato AND timbrado = 0
        ORDER BY id_adeudo DESC LIMIT 1
      )
      WHERE c.id_contrato = ? OR c.codigo_contribuyente = ?
      LIMIT 1
    `, [id, id]);

    if (rows.length === 0) return res.status(404).json({ mensaje: "Contrato no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
});

// DESCUENTOS
app.get("/descuentos", (req, res) => {
  conexion.query("SELECT * FROM descuentos", (error, result) => {
    if (error) return res.status(500).json({ mensaje: "Error" });
    res.json(result);
  });
});

// ============================================================
// PAGOS — listado principal (lee de tabla pagos)
// ============================================================
app.get("/pagos", (req, res) => {
  const sql = `
    SELECT
      p.id_pagos,
      p.id_contrato,
      p.servicio,
      p.mes_inicio,
      p.mes_fin,
      p.meses,
      p.cajero,
      p.recargos_meses,
      p.recargos,
      p.importe,
      p.estatus,
      p.timbrado,
      p.id_descuento,
      p.total_recaudado,
      p.fecha_pago,
      c.codigo_contribuyente,
      CONCAT(ct.nombre,' ',ct.apellido_paterno,' ',ct.apellido_materno) AS nombre,
      a.meses_morosos,
      da.tipo AS descuento,
      da.valor AS porcentaje_descuento
    FROM pagos p
    LEFT JOIN contratos c ON p.id_contrato = c.id_contrato
    LEFT JOIN contribuyentes ct ON c.codigo_contribuyente = ct.codigo_contribuyente
    LEFT JOIN adeudos a ON a.id_adeudo = (
      SELECT id_adeudo FROM adeudos
      WHERE id_contrato = p.id_contrato
      AND timbrado = 1
      ORDER BY id_adeudo DESC LIMIT 1
    )
    LEFT JOIN descuentos da ON a.id_descuento = da.id_descuento
    ORDER BY p.id_pagos DESC
  `;
  conexion.query(sql, (error, result) => {
    if (error) { console.log(error); return res.status(500).json({ mensaje: "Error al cargar pagos" }); }
    res.json(result);
  });
});
// CAMBIAR ESTATUS DE PAGOS
app.put("/pagos/estado/:id", (req, res) => {
  const { estado } = req.body;
  conexion.query(`UPDATE pagos SET estatus = ? WHERE id_pagos = ?`, [estado, req.params.id], (error) => {
    if (error) return res.status(500).json({ mensaje: "Error al actualizar estado" });
    res.json({ mensaje: "Estado actualizado" });
  });
});

// TIMBRADO
app.put("/pagos/timbrado/:id", (req, res) => {
  const { timbrado } = req.body;
  conexion.query(`UPDATE pagos SET timbrado = ? WHERE id_pagos = ?`, [timbrado, req.params.id], (error) => {
    if (error) return res.status(500).json({ mensaje: "Error al actualizar timbrado" });
    res.json({ mensaje: "Timbrado actualizado" });
  });
});
// BUSQUEDA DE PAGOS
app.get("/pagos/busqueda", async (req, res) => {
  try {
    const { fechaInicio, fechaFin, contrato, contribuyente, servicio, vigente, noTimbrado } = req.query;
    let sql = `
      SELECT p.*,
        CONCAT(ct.nombre,' ',ct.apellido_paterno,' ',ct.apellido_materno) AS nombre,
        c.codigo_contribuyente,
        a.meses_morosos,
        da.tipo AS descuento,
        da.valor AS porcentaje_descuento
      FROM pagos p
      INNER JOIN contratos c ON p.id_contrato = c.id_contrato
      INNER JOIN contribuyentes ct ON c.codigo_contribuyente = ct.codigo_contribuyente
      LEFT JOIN adeudos a ON a.id_adeudo = (
        SELECT id_adeudo FROM adeudos
        WHERE id_contrato = p.id_contrato
        AND timbrado = 1
        ORDER BY id_adeudo DESC LIMIT 1
      )
      LEFT JOIN descuentos da ON a.id_descuento = da.id_descuento
      WHERE 1=1
    `;
    const valores = [];
    if (fechaInicio)   { sql += ` AND DATE(p.fecha_pago) >= ?`; valores.push(fechaInicio); }
    if (fechaFin)      { sql += ` AND DATE(p.fecha_pago) <= ?`; valores.push(fechaFin); }
    if (contrato)      { sql += ` AND p.id_contrato = ?`;       valores.push(contrato); }
    if (contribuyente) { sql += ` AND c.codigo_contribuyente = ?`; valores.push(contribuyente); }
    if (servicio)      { sql += ` AND p.servicio = ?`;          valores.push(servicio); }
    if (vigente === "1")    { sql += ` AND p.estatus = 1`; }
    if (noTimbrado === "1") { sql += ` AND p.timbrado = 0`; }
    sql += ` ORDER BY p.id_pagos DESC`;
    const [rows] = await conexion.promise().query(sql, valores);
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al buscar pagos" });
  }
});
// LISTADO DE SELECCION DE CONTRATOS EN PAGOS
app.get("/contratos/listado", (req, res) => {
  conexion.query(`SELECT id_contrato FROM contratos ORDER BY id_contrato`, (error, result) => {
    if (error) return res.status(500).json({ mensaje: "Error" });
    res.json(result);
  });
});

// CONTRIBUYENTES SELECCION
app.get("/contribuyentes/listado", (req, res) => {
  conexion.query(`SELECT codigo_contribuyente, CONCAT(nombre,' ',apellido_paterno,' ',apellido_materno) AS nombre FROM contribuyentes ORDER BY nombre`, (error, result) => {
    if (error) return res.status(500).json({ mensaje: "Error" });
    res.json(result);
  });
});

// CAMBIO DE CONTRIBUYENTE - buscar
app.get("/buscarContribuyente", (req, res) => {
    const texto = req.query.texto;
    const sql = `SELECT * FROM contribuyentes WHERE codigo_contribuyente LIKE ? OR rfc LIKE ?`;
    conexion.query(sql, [`%${texto}%`, `%${texto}%`], (err, results) => {
        if (err) return res.status(500).send("Error");
        res.json(results);
    });
});

// CAMBIO DE CONTRIBUYENTE - actualizar
app.post("/actualizarContribuyente", (req, res) => {
    const d = req.body;
    const sql = `UPDATE contribuyentes SET apellido_paterno = ?, apellido_materno = ?, nombre = ?, estado = ?, municipio = ?, localidad = ?, colonia = ?, calle = ?, numero_exterior = ?, numero_interior = ?, cp = ?, razon_social = ?, rfc = ?, correo = ?, telefono = ?, regimen_fiscal = ?, propietario = ?, contrato = ?, estatus = ? WHERE codigo_contribuyente = ?`;
    const valores = [d.apellidoP, d.apellidoM, d.nombre, d.estado, d.municipio, d.localidad, d.colonia, d.calle, d.numExt, d.numInt, d.cp, d.razon, d.rfc, d.correo, d.telefono, d.regimen, d.propietario, d.contrato, d.estatus, d.codigo];
    conexion.query(sql, valores, (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error al actualizar"); }
        res.send("Actualizado correctamente");
    });
});

// MODIFICAR CONTRATO - buscar
app.get("/buscarContrato/:valor", (req, res) => {
    const valor = req.params.valor;
    const sql = `
        SELECT c.*, con.estado, con.municipio, con.localidad, con.colonia, con.calle, con.numero_exterior, con.numero_interior, con.cp
        FROM contratos c
        LEFT JOIN contribuyentes con ON c.codigo_contribuyente = con.codigo_contribuyente
        WHERE c.id_contrato = ? OR c.codigo_contribuyente = ?
    `;
    conexion.query(sql, [valor, valor], (err, results) => {
        if (err) return res.status(500).json({ error: "Error de servidor" });
        if (results.length === 0) return res.json({ error: "No encontrado" });
        res.json(results);
    });
});

// MODIFICAR CONTRATO - actualizar
app.put("/actualizarContrato", (req, res) => {
    const d = req.body;
    const sql = `UPDATE contratos SET codigo_contribuyente = ?, nombre = ?, creacion_contrato = ?, contrato_anterior = ?, unidad = ?, bomba = ?, tipo_de_uso = ? WHERE id_contrato = ?`;
    conexion.query(sql, [d.codigo_contribuyente, d.nombre, d.creacion_contrato, d.contrato_anterior, d.unidad, d.bomba, d.tipo_de_uso, d.id_contrato], (err) => {
        if (err) return res.status(500).send("Error al actualizar en BD");
        res.send("Contrato actualizado exitosamente");
    });
});

/////// RECAUDACION /////////////
app.get("/recaudacion", (req, res) => {
    const { inicio, fin, cajero } = req.query;

    let sql = `
        SELECT 
            p.id_pagos AS folio,
            p.cajero,
            c.codigo_contribuyente AS codigo,
            CONCAT(con.nombre,' ',con.apellido_paterno,' ',con.apellido_materno) AS nombre,
            c.id_contrato AS contrato,
            CONCAT(MONTHNAME(p.mes_inicio),'-',MONTHNAME(p.mes_fin)) AS periodo,
            a.meses_morosos AS meses,
            p.importe,
            IFNULL(p.recargos_meses, 0) AS recargos,
            IFNULL(ROUND(p.importe * d.valor / 100, 2), 0) AS descuentos
        FROM pagos p
        INNER JOIN contratos c ON p.id_contrato = c.id_contrato
        INNER JOIN contribuyentes con ON c.codigo_contribuyente = con.codigo_contribuyente
        LEFT JOIN adeudos a ON a.id_adeudo = (
            SELECT id_adeudo FROM adeudos
            WHERE id_contrato = p.id_contrato
            AND timbrado = 1
            ORDER BY id_adeudo DESC LIMIT 1
        )
        LEFT JOIN descuentos d ON a.id_descuento = d.id_descuento
        WHERE 1=1
    `;

    const params = [];
    if (inicio) { sql += ` AND DATE(p.fecha_pago) >= ?`; params.push(inicio); }
    if (fin)    { sql += ` AND DATE(p.fecha_pago) <= ?`; params.push(fin); }
    if (cajero) { sql += ` AND p.cajero = ?`;            params.push(cajero); }

    sql += ` ORDER BY p.id_pagos DESC`;

    conexion.query(sql, params, (err, resultados) => {
        if (err) { console.log(err); return res.status(500).json({ error: "Error en consulta" }); }
        res.json(resultados);
    });
});
///// REPORTE DE ADEUDOS (con todos los campos necesarios para tabla y gráfica)
app.get("/reporte-adeudos", (req, res) => {
    const sql = `
        SELECT
            c.id_contrato AS contrato,
            c.contrato_anterior,
            CONCAT(ct.nombre,' ',ct.apellido_paterno,' ',ct.apellido_materno) AS nombre,
            CONCAT(ct.calle,' ',IFNULL(ct.numero_exterior,''),', ',ct.colonia) AS domProp,
            CONCAT(ct.calle,' ',IFNULL(ct.numero_exterior,''),', ',ct.colonia) AS domCont,
            c.tipo_de_uso AS tipo,
            a.meses_morosos AS meses,
            a.importes,
            a.servicio
        FROM adeudos a
        INNER JOIN contratos c ON a.id_contrato = c.id_contrato
        INNER JOIN contribuyentes ct ON c.codigo_contribuyente = ct.codigo_contribuyente
        WHERE a.estado = 0
    `;
    conexion.query(sql, (err, resultados) => {
        if (err) { console.log(err); return res.status(500).json(err); }
        res.json(resultados);
    });
});

////// REPORTE DE CORTE
app.get("/reporte-corte", (req, res) => {
    const { inicio, fin, cajero } = req.query;

    let sql = `
        SELECT
            p.servicio,
            COUNT(*) AS pagos,
            SUM(IFNULL(p.recargos_meses, 0)) AS recargos,
            IFNULL(SUM(ROUND(p.importe * d.valor / 100, 2)), 0) AS descuentos,
            SUM(IFNULL(p.importe, 0)) AS importe
        FROM pagos p
        LEFT JOIN adeudos a ON a.id_adeudo = (
            SELECT id_adeudo FROM adeudos
            WHERE id_contrato = p.id_contrato
            AND timbrado = 1
            ORDER BY id_adeudo DESC LIMIT 1
        )
        LEFT JOIN descuentos d ON a.id_descuento = d.id_descuento
        WHERE 1=1
    `;

    const params = [];
    if (inicio) { sql += ` AND DATE(p.fecha_pago) >= ?`; params.push(inicio); }
    if (fin)    { sql += ` AND DATE(p.fecha_pago) <= ?`; params.push(fin); }
    if (cajero && cajero !== "Seleccione") { sql += ` AND p.cajero = ?`; params.push(cajero); }

    sql += ` GROUP BY p.servicio ORDER BY p.servicio`;

    conexion.query(sql, params, (err, resultados) => {
        if (err) { console.log(err); return res.status(500).json({ error: "Error al consultar pagos" }); }
        res.json(resultados);
    });
});

// ============================================================
// PROCESAR TIMBRADO: actualiza adeudo E inserta en pagos
// ============================================================
app.put("/pagos/procesar-timbrado/:id", async (req, res) => {
    const id_adeudo = req.params.id;
    const { recargos, importes, cajero, fecha_pago } = req.body;

    try {
        // 1. Obtener datos del adeudo ANTES de modificarlo
        const [adeudoRows] = await conexion.promise().query(
            `SELECT a.*, c.id_contrato, c.codigo_contribuyente
             FROM adeudos a
             INNER JOIN contratos c ON a.id_contrato = c.id_contrato
             WHERE a.id_adeudo = ?`, [id_adeudo]
        );
        if (adeudoRows.length === 0) return res.status(404).json({ mensaje: "Adeudo no encontrado" });
        const a = adeudoRows[0];

        // Guardamos meses_morosos antes de que se modifique
        const mesesMorosos = a.meses_morosos || 1;
        const idDescuento  = a.id_descuento || null;

        // 2. Marcar adeudo como timbrado
       
        await conexion.promise().query(
            `UPDATE adeudos SET timbrado = 1, estado = 1 WHERE id_adeudo = ?`,
            [id_adeudo]
        );

        // 3. Verificar si ya existe un registro en pagos para este contrato
        const [existePago] = await conexion.promise().query(
            `SELECT id_pagos FROM pagos WHERE id_contrato = ?`, [a.id_contrato]
        );

        const mesInicio = fecha_pago || new Date().toISOString().split('T')[0];
        const mesFin    = fecha_pago || new Date().toISOString().split('T')[0];

        if (existePago.length > 0) {
            
            await conexion.promise().query(
                `UPDATE pagos SET
                   servicio = ?, mes_inicio = ?, mes_fin = ?, meses = ?,
                   cajero = ?, recargos_meses = ?, recargos = ?, importe = ?,
                   total_recaudado = ?, total_recargos = ?, timbrado = 1,
                   estatus = 1, fecha_pago = ?, id_descuento = ?
                 WHERE id_contrato = ?`,
                [a.servicio, mesInicio, mesFin, mesesMorosos,
                 cajero || 'Cajero', recargos, recargos, importes,
                 importes, recargos, fecha_pago, idDescuento,
                 a.id_contrato]
            );
        } else {
            
            await conexion.promise().query(
                `INSERT INTO pagos
                   (id_contrato, serie, id_unidad, servicio, mes_inicio, mes_fin, meses,
                    cajero, recargos_meses, recargos, importe, estatus, timbrado,
                    id_descuento, descripcion, numero_pagos, total_servicio_agua,
                    total_recaudado, total_recargos, tarifa, fecha_pago)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,1,1,?,?,1,?,?,?,?,?)`,
                [a.id_contrato, 'S/N', 1, a.servicio, mesInicio, mesFin,
                 mesesMorosos, cajero || 'Cajero', recargos, recargos,
                 importes, idDescuento,
                 `Pago ${a.servicio}`, importes - recargos,
                 importes, recargos, importes - recargos, fecha_pago]
            );
        }

        // 4. Actualizar último pago del contrato
        await conexion.promise().query(
            `UPDATE contratos SET ultimo_pago = ? WHERE id_contrato = ?`,
            [fecha_pago, a.id_contrato]
        );

        res.json({ mensaje: "Pago procesado y timbrado correctamente.", id_adeudo });

    } catch (error) {
        console.error("Error al procesar timbrado:", error);
        res.status(500).json({ error: "Error interno al procesar el timbrado.", detalle: error.message });
    }
});
// HISTORIAL DE PAGOS (desde tabla pagos)
app.get("/historial-pagos", (req, res) => {
    const sql = `
        SELECT 
            p.fecha_pago AS fecha,
            CONCAT(ct.nombre,' ',ct.apellido_paterno,' ',ct.apellido_materno) AS nombre,
            p.id_contrato AS contrato,
            p.total_recaudado AS monto,
            p.servicio,
            p.cajero
        FROM pagos p
        LEFT JOIN contratos c ON p.id_contrato = c.id_contrato
        LEFT JOIN contribuyentes ct ON c.codigo_contribuyente = ct.codigo_contribuyente
        ORDER BY p.id_pagos DESC
    `;
    conexion.query(sql, (err, results) => {
        if (err) { console.error(err); return res.status(500).json({ mensaje: "Error al cargar historial" }); }
        res.json(results);
    });
});

// DETALLE DE PAGO POR CONTRATO (informacion de pagos)
app.get("/pagos/detalle/:id_contrato", async (req, res) => {
    try {
        const id_contrato = req.params.id_contrato;
        const [rows] = await conexion.promise().query(`
            SELECT
                p.id_pagos,
                p.id_contrato,
                p.serie,
                p.id_unidad,
                p.servicio,
                p.mes_inicio,
                p.mes_fin,
                p.meses,
                p.cajero,
                p.recargos_meses,
                p.importe,
                p.estatus,
                p.timbrado,
                p.id_descuento,
                p.descripcion,
                p.numero_pagos,
                p.total_servicio_agua,
                p.total_recaudado,
                p.total_recargos,
                p.tarifa,
                p.fecha_pago,
                CONCAT(ct.nombre,' ',ct.apellido_paterno,' ',ct.apellido_materno) AS nombre,
                ct.rfc,
                ct.correo,
                ct.telefono,
                d.tipo  AS descuento,
                d.valor AS porcentaje_descuento
            FROM pagos p
            LEFT JOIN contratos c  ON p.id_contrato = c.id_contrato
            LEFT JOIN contribuyentes ct ON c.codigo_contribuyente = ct.codigo_contribuyente
            LEFT JOIN descuentos d ON p.id_descuento = d.id_descuento
            WHERE p.id_contrato = ?
            ORDER BY p.id_pagos DESC
            LIMIT 1
        `, [id_contrato]);

        if (rows.length === 0) return res.status(404).json({ mensaje: "No se encontró información del pago" });
        res.json(rows[0]);
    } catch (error) {
        console.log("ERROR /pagos/detalle:", error);
        res.status(500).json({ mensaje: "Error del servidor", detalle: error.message });
    }
});

// RECARGOS — insertar recargo desde timbrado
app.post("/recargos", async (req, res) => {
    try {
        const { id_contrato, id_adeudo, monto_recargo, cajero, fecha_pago, servicio } = req.body;
        // Insertar en tabla recargos si existe, sino en adeudos como registro de recargo
        // Por simplicidad guardamos en adeudos con servicio=Recargo
        const sql = `INSERT INTO adeudos (id_contrato, servicio, importes, meses_morosos, fecha_adeudo, estado, timbrado) VALUES (?, ?, ?, 0, NOW(), 1, 1)`;
        await conexion.promise().query(sql, [id_contrato, 'Recargo-' + servicio, monto_recargo]);
        res.json({ mensaje: "Recargo registrado" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: "Error al registrar recargo" });
    }
});
// ============================================================
// CORTE DE PAGOS
// ============================================================

app.get("/reporte-corte", (req, res) => {

  const { inicio, fin, cajero } = req.query;

  let sql = `
    SELECT
      servicio,
      COUNT(*) AS pagos,
      SUM(IFNULL(recargos,0)) AS recargos,
      SUM(
        IFNULL(importe,0)
        - IFNULL(total_recaudado, importe)
      ) AS descuentos,
      SUM(IFNULL(total_recaudado,0)) AS importe
    FROM pagos
    WHERE 1=1
  `;

  const params = [];

  if(inicio){
    sql += ` AND fecha_pago >= ?`;
    params.push(inicio);
  }

  if(fin){
    sql += ` AND fecha_pago <= ?`;
    params.push(fin);
  }

  if(cajero && cajero !== "Seleccione"){
    sql += ` AND cajero = ?`;
    params.push(cajero);
  }

  sql += `
    GROUP BY servicio
    ORDER BY servicio
  `;

  conexion.query(sql, params, (err, result) => {

    if(err){
      console.log(err);
      return res.status(500).json({
        mensaje:"Error"
      });
    }

    res.json(result);

  });

});

//ADEUDOS POR CALLE
app.get("/calles-adeudos", (req, res) => {

    const buscar = req.query.buscar || "";

    let sql = `
        SELECT
            ct.calle,
            COUNT(*) AS numero_contratos,
            SUM(a.importes) AS importes
        FROM adeudos a
        INNER JOIN contratos c
            ON a.id_contrato = c.id_contrato
        INNER JOIN contribuyentes ct
            ON c.codigo_contribuyente = ct.codigo_contribuyente
        WHERE a.estado = 1
    `;

    const valores = [];

    if (buscar) {
        sql += ` AND ct.calle LIKE ? `;
        valores.push(`%${buscar}%`);
    }

    sql += `
        GROUP BY ct.calle
        ORDER BY importes DESC
    `;

    conexion.query(sql, valores, (err, result) => {

        if(err){
            console.log(err);
            return res.status(500).json({
                total:0,
                datos:[]
            });
        }

        res.json({
            total: result.length,
            datos: result
        });

    });

});