const express = require("express");
const cors = require("cors");
const conexion = require("./conexion");

const app = express();

app.use(cors());
app.use(express.json()); 


// REGISTRO DE USUARIOS 
app.post("/registro", (req, res) => {
    // Recibimos id_rol desde el formulario del Admin
    const { usuario, correo, contrasena, id_rol } = req.body;

    const sql = `
        INSERT INTO usuarios 
        (usuario, correo, contrasena, id_rol, estado, fecha_creacion)
        VALUES (?, ?, ?, ?, 1, NOW())
    `;

    // Ahora pasamos el id_rol que el admin seleccionó
    conexion.query(sql, [usuario, correo, contrasena, id_rol], (err, result) => {
        if (err) {
            console.error("Error SQL:", err);
            res.status(500).json({ exito: false, mensaje: "Error al registrar: " + err.sqlMessage });
        } else {
            res.json({ exito: true, mensaje: "Usuario creado con éxito", id: result.insertId });
        }
    });
});

// LOGIN
app.post("/login", (req, res) => {
    const { correo, contrasena } = req.body;

    // Buscamos al usuario incluyendo su ROL y ESTADO
    const sql = `
        SELECT id_usuario, usuario, id_rol, estado 
        FROM usuarios 
        WHERE correo = ? AND contrasena = ?
    `;

    conexion.query(sql, [correo, contrasena], (err, results) => {
        if (err) return res.status(500).json({ mensaje: "Error en el servidor" });

        if (results.length === 0) {
            return res.status(401).json({ exito: false, mensaje: "Correo o contraseña incorrectos" });
        }

        const user = results[0];

        // Verificamos si el usuario está activo (Estado 1)
        if (user.estado === 0) {
            return res.status(403).json({ mensaje: "Usuario desactivado. Contacte al administrador." });
        }

        // Buscamos los permisos específicos de este usuario por su ID
        const sqlPermisos = "SELECT modulo, ver, nuevo, editar, eliminar FROM permisos WHERE id_rol = ?";
        
        // ... dentro de app.post("/login") ...
conexion.query(sqlPermisos, [user.id_rol], (err2, permisos) => {
    if (err2) {
        console.error("Error al buscar permisos:", err2);
        return res.status(500).json({ mensaje: "Error al cargar permisos" });
    }

    // Si permisos es undefined o vacío, enviamos un areglo vacío 
    res.json({ 
        exito: true,
        usuario: {
            id: user.id_usuario,
            nombre: user.usuario,
            rol: user.id_rol
        },
        permisos: permisos || [] // <--- Esto evita el error si no hay nada
    });
});
    });
});
//
// PERMISOS
app.post("/permisos", (req, res) => {
  const { usuario, permisos } = req.body;

  // 1. Borramos permisos viejos para no duplicar
  conexion.query("DELETE FROM permisos WHERE id_usuario = ?", [usuario], (err) => {
    if (err) return res.status(500).send("Error");

    // 2. Insertamos los nuevos permisos seleccionados
    if (permisos.length > 0) {
      const valores = permisos.map(p => [
        usuario, 
        p.modulo, 
        p.permiso === 'ver' ? 1 : 0, 
        p.permiso === 'nuevo' ? 1 : 0, 
        p.permiso === 'editar' ? 1 : 0, 
        p.permiso === 'eliminar' ? 1 : 0
      ]);

      const sql = "INSERT INTO permisos (id_usuario, modulo, ver, nuevo, editar, eliminar) VALUES ?";
      conexion.query(sql, [valores], (err2) => {
        if (err2) return res.status(500).send("Error al insertar");
        
        // 3. De paso, aprobamos al usuario (Estado = 1) para que ya pueda entrar
        conexion.query("UPDATE usuarios SET estado = 1 WHERE id_usuario = ?", [usuario]);
        
        res.send("Permisos actualizados y usuario aprobado");
      });
    } else {
      res.send("Permisos limpiados");
    }
  });
});

//REGISTRO DE UN CONTRIBUYENTE

app.post("/guardar", (req, res) => {
  const d = req.body;

  const sql = `
    INSERT INTO contribuyentes (
      codigo_contribuyente,
      apellido_paterno,
      apellido_materno,
      nombre,
      estado,
      municipio,
      localidad,
      colonia,
      calle,
      numero_exterior,
      numero_interior,
      cp,
      razon_social,
      rfc,
      correo,
      telefono,
      regimen_fiscal,
      propietario,
      contrato
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    d.codigo,
    d.apellidoP,
    d.apellidoM,
    d.nombre,
    d.estado,
    d.municipio,
    d.localidad,
    d.colonia,
    d.calle,
    d.numExt,
    d.numInt,
    d.cp,
    d.razon,
    d.rfc,
    d.correo,
    d.telefono,
    d.regimen,
    d.propietario,
    d.contrato
  ];

  console.log("SQL:", sql);
console.log("VALORES:", valores);


  conexion.query(sql, valores, (err, result) => {
    if (err) {
      console.error("ERROR SQL:", err);
res.send("Error: " + err.sqlMessage);
    } else {
      res.send("Guardado correctamente");
    }
  });
});

app.listen(3000, () => {
console.log("Servidor corriendo en http://localhost:3000");
});

app.get("/contribuyentes", (req, res) => {

  const pagina = parseInt(req.query.pagina) || 1;
  const limite = 10;
  const offset = (pagina - 1) * limite;

  const sql = `
    SELECT * FROM contribuyentes
    LIMIT ? OFFSET ?
  `;

  conexion.query(sql, [limite, offset], (err, results) => {
    if (err) {
      console.error(err);
      res.send("Error");
    } else {

      // contar total
      conexion.query("SELECT COUNT(*) AS total FROM contribuyentes", (err2, countResult) => {

        res.json({
          datos: results,
          total: countResult[0].total
        });

      });

    }
  });

});
//DAR DE BAJA A UN CONTRIBUYENTE
app.post("/estatus", (req, res) => {
  const { codigo, estatus } = req.body;

  const sql = `
    UPDATE contribuyentes 
    SET estatus = ?
    WHERE codigo_contribuyente = ?
  `;

  conexion.query(sql, [estatus, codigo], (err) => {
    if (err) {
      console.error(err);
      res.send("Error al cambiar estatus");
    } else {
      res.send("Estatus actualizado");
    }
  });
});
//BUSCAR UN CONTRIBUYENTE
app.get("/buscarRFC", (req, res) => {

  const rfc = req.query.rfc;

  const sql = `
    SELECT * FROM contribuyentes
    WHERE rfc LIKE ?
  `;

  conexion.query(sql, [`%${rfc}%`], (err, results) => {
    if (err) {
      console.error(err);
      res.send("Error");
    } else {
      res.json(results);
    }
  });

});
//USUARIOS
app.get("/usuarios", (req, res) => {

  conexion.query("SELECT usuario, correo FROM usuarios", (err, results) => {
    if (err) {
      console.error(err);
      res.send("Error");
    } else {
      res.json(results);
    }
  });

});
//PROTEGER BACKEND 
app.post("/eliminar-contribuyente", (req, res) => {

  const { id_usuario } = req.body;

  // consultar permisos
  conexion.query(
    "SELECT eliminar FROM permisos WHERE id_usuario = ? AND modulo = 'Contribuyentes'",
    [id_usuario],
    (err, result) => {

      if (!result || result[0].eliminar == 0) {
        return res.status(403).send("No autorizado");
      }

    }
  );
});
//EXCEL
app.get("/contribuyentes-todos", (req, res) => {
  conexion.query("SELECT * FROM contribuyentes", (err, results) => {
    if (err) return res.send("Error");
    res.json(results);
  });
});