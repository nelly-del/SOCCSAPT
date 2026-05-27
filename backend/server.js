const express = require("express");
const cors = require("cors");
const conexion = require("./conexion");

const app = express();

app.use(cors());
app.use(express.json()); 

///////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////
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
            correo: user.correo,
            rol: user.id_rol
        },
        permisos: permisos || [] // <--- Esto evita el error si no hay nada
    });
});
    });
});
/////////////////////////////////////////////////////////////////////////////////////
// PERMISOS
app.post("/permisos", (req, res) => {
  const { id_rol, permisos } = req.body;

  // 1. Borramos permisos viejos para no duplicar
  conexion.query("DELETE FROM permisos WHERE id_rol = ?", [id_rol], (err) => {
    if (err) { console.error(err);
    return res.status(500).send("Error");
  }

    // Si no hay permisos
    if(permisos.length === 0){

        return res.send(
          "Permisos eliminados"
        );

      }
   // CREAR REGISTROS
      const valores = permisos.map(p => [
        id_rol,
        p.modulo,
        p.ver,
        p.nuevo,
        p.editar,
        p.eliminar
      ]);
      const sql = "INSERT INTO permisos (id_rol, modulo, ver, nuevo, editar, eliminar) VALUES ?";
      conexion.query(sql, [valores], (err2) => {
        if (err2){console.error(err2)
        return res.status(500).send("Error al insertar");
      
        
  }

          res.send(
            "Permisos guardados"
          );

        }
      );

    }

  );

});

// ROLES
app.get("/roles",(req,res)=>{
  conexion.query("SELECT * FROM roles",
  (err,result)=>{

      if(err){console.error(err);
        return res
        .status(500)
        .send("Error");
      }
      res.json(result);
    }

  );

});
////////////////////////////////////////////////////////
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
//EXCEL
app.get("/contribuyentes-todos", (req, res) => {
  conexion.query("SELECT * FROM contribuyentes", (err, results) => {
    if (err) return res.send("Error");
    res.json(results);
  });
});
////////////////////////////////////////////////////////////////////
//USUARIOS
app.get("/usuarios",(req,res)=>{
  const sql = `
    SELECT u.id_usuario, u.usuario, u.correo, u.estado, r.nombre_rol
    FROM usuarios u
    INNER JOIN roles r
    ON u.id_rol = r.id_rol
  `;

  conexion.query(sql,(err,results)=>{
    if(err){
      console.error(err);
      return res.send("Error");
    }
    res.json(results);
  });
});

// ELIMINAR USUARIO

app.delete("/eliminar-usuario",(req,res)=>{
  const { id_usuario } = req.body;
  conexion.query(
    `
    DELETE FROM usuarios
    WHERE id_usuario = ?
    `,
    [id_usuario], (err)=>{
    if(err){console.error(err);
        return res
        .status(500)
        .send("Error");
      }

      res.send(
        "Usuario eliminado"
      );

    }

  );

});
//RUTA OBTENER USUARIO
app.get("/usuario/:id",(req,res)=>{

  const id = req.params.id;

  conexion.query(

    `
    SELECT *
    FROM usuarios
    WHERE id_usuario = ?
    `,

    [id],

    (err,result)=>{

      if(err){

        console.error(err);

        return res.send("Error");

      }

      res.json(result[0]);

    }

  );

});
//EDITAR USUARIO
app.put("/editar-usuario",(req,res)=>{

  const {

    id_usuario,
    usuario,
    correo,
    contrasena,
    id_rol

  } = req.body;

  conexion.query(

    `

    UPDATE usuarios

    SET

    usuario = ?,
    correo = ?,
    contrasena = ?,
    id_rol = ?

    WHERE id_usuario = ?

    `,

    [

      usuario,
      correo,
      contrasena,
      id_rol,
      id_usuario

    ],

    (err)=>{

      if(err){

        console.error(err);

        return res.send("Error");

      }

      res.send(
        "Usuario actualizado"
      );

    }

  );

});

/////////////////////////////////////////////////////////////
//CONTRATOS
app.get("/contratos", (req,res)=>{

  const pagina = parseInt(req.query.pagina) || 1;

  const limite = 10;

  const offset = (pagina - 1) * limite;

  const sql = `
  
    SELECT

  contratos.*,

  CONCAT(
    contribuyentes.nombre,' ',
    contribuyentes.apellido_paterno,' ',
    contribuyentes.apellido_materno
  ) AS nombre

FROM contratos

LEFT JOIN contribuyentes
ON contratos.codigo_contribuyente =
contribuyentes.codigo_contribuyente

LIMIT ? OFFSET ?

`;
  conexion.query(
    sql,
    [limite, offset],
    (err,results)=>{

      if(err){

        console.error(err);

        res.send("Error");

      }else{

        conexion.query(
          "SELECT COUNT(*) AS total FROM contratos",
          (err2,countResult)=>{

            res.json({

              datos: results,
              total: countResult[0].total

            });

          }
        );

      }

    }
  );

});
//TRAER TODOS LOS CONTRATOS EXCEL// TODOS LOS CONTRATOS

  app.get("/contratos-todos",(req,res)=>{

  const sql = `

  SELECT

    contratos.*,

    CONCAT(
      contribuyentes.nombre,' ',
      contribuyentes.apellido_paterno,' ',
      contribuyentes.apellido_materno
    ) AS nombre

  FROM contratos

  LEFT JOIN contribuyentes
  ON contratos.codigo_contribuyente =
  contribuyentes.codigo_contribuyente

  `;

  conexion.query(sql,(err,results)=>{

    if(err){

      console.error(err);

      res.send("Error");

    }else{

      res.json(results);

    }

  });

});

// --- GUARDAR CONTRATO ---
app.post("/guardar-contrato", (req, res) => {
  const d = req.body;

  // Incluimos todos los campos marcados como obligatorios (NOT NULL) en tu BD
  const sql = `
    INSERT INTO contratos (
      codigo_contribuyente,
      nombre,
      ultimo_pago,
      creacion_contrato,
      contrato_anterior,
      unidad,
      estatus,
      bomba,
      tipo_de_uso
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Mapeamos correctamente asegurando consistencia
  const valores = [
    d.codigo_contribuyente,
    d.nombre_contribuyente, // Recibido del formulario dinámico
    null,                   // Ultimo pago inicia en null
    d.fecha || new Date().toISOString().split('T')[0], // Si viene vacío, usa la fecha actual
    d.contrato_anterior || null,
    d.unidad,
    1,                      // Estatus activo por defecto
    d.bomba === "Principal" ? 1 : 2, // Conversión a TINYINT según tu BD (1=Principal, 2=Manantial)
    d.tipo_uso
  ];

  conexion.query(sql, valores, (err, result) => {
    if (err) {
      console.error("ERROR MYSQL:", err);
      res.status(500).send("Error al guardar contrato: " + err.sqlMessage);
    } else {
      res.send("Contrato guardado correctamente");
    }
  });
});

// --- BUSCAR CONTRIBUYENTE ---
app.get("/buscar-contribuyente/:codigo", (req, res) => {
  const codigo = req.params.codigo;
  
  // Concatenamos el nombre completo desde la consulta para facilitar el Front
  const sql = `
    SELECT *, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) AS nombre_completo
    FROM contribuyentes
    WHERE codigo_contribuyente = ?
  `;

  conexion.query(sql, [codigo], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error");
    }
    if (result.length === 0) {
      return res.json(null); // No se encontró
    }
    res.json(result[0]);
  });
});

// CAMBIAR ESTATUS CONTRATO
app.put("/cambiar-estatus-contrato", (req,res)=>{

  const { id_contrato } = req.body;

  if(!id_contrato){

    return res
    .status(400)
    .send("Falta ID");

  }

  const sql = `
  
  UPDATE contratos

  SET estatus =
  CASE
    WHEN estatus = 1 THEN 0
    ELSE 1
  END

  WHERE id_contrato = ?
  
  `;

  conexion.query(sql,[id_contrato],(err,result)=>{

    if(err){

      console.error(err);

      return res
      .status(500)
      .send("Error");

    }

    if(result.affectedRows === 0){

      return res
      .status(404)
      .send("Contrato no encontrado");

    }

    res.send("Estatus actualizado");

  });

});
////////////////////////////////////////////////////////////////////////////////////
// VALIDAR SI EL CONTRATO TIENE ADEUDOS
app.get("/validar-adeudos/:id", (req,res)=>{

  const id = req.params.id;

  const sql = `

    SELECT * FROM pagos
    WHERE id_contrato = ?
    AND pagado = 0

  `;

  conexion.query(sql,[id],(err,result)=>{

    if(err){

      console.error(err);

      return res.status(500).send("Error");

    }

    // SI EXISTEN ADEUDOS
    if(result.length > 0){

      return res.json({
        tieneAdeudos:true
      });

    }

    // SI NO EXISTEN
    res.json({
      tieneAdeudos:false
    });

  });

});
//////////////////////////////////////////////////////////////////////
//DATOS DE LICENCIA
const multer = require("multer");
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"uploads/");
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
  }
});
const upload = multer({storage});

app.post(
  "/licencia",
  upload.fields([

    { name:"archivo_cer" },
    { name:"archivo_key" }

  ]),

  (req,res)=>{

    const datos = req.body;

    const archivoCer =
    req.files["archivo_cer"][0].filename;

    const archivoKey =
    req.files["archivo_key"][0].filename;

    const sql = `

    INSERT INTO datos_licencia (

      folio_licencia,
      rfc,
      razon_social,
      fecha_inicio,
      fecha_fin,
      estado,
      municipio,
      localidad,
      colonia,
      calle,
      numero_exterior,
      numero_interior,
      cp,
      referencia,
      serie,
      regimen_fiscal,
      password_certificado,
      archivo_cer,
      archivo_key

    )

    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)

    `;
    conexion.query(
      sql,

      [

        datos.folio_licencia,
        datos.rfc,
        datos.razon_social,
        datos.fecha_inicio,
        datos.fecha_fin,
        datos.estado,
        datos.municipio,
        datos.localidad,
        datos.colonia,
        datos.calle,
        datos.numero_exterior,
        datos.numero_interior,
        datos.cp,
        datos.referencia,
        datos.serie,
        datos.regimen_fiscal,
        datos.password_certificado,
        archivoCer,
        archivoKey

      ],

      (error)=>{

        if(error){

          console.log(error);

          return res.json({

            mensaje:
            "Error al guardar los datos"

          });

        }

        res.json({

          mensaje:
          "Datos guardados correctamente"

        });

      }

    );

  }

);
//////////////////////////////////////////////
// ADEUDOS

app.post(
  "/adeudos",
  (req,res)=>{

    const{

      id_contrato,
      contribuyente,
      servicio,
      mes_inicio,
      mes_fin,
      meses_morosos,
      importes,
      observaciones

    } = req.body;

    const sql = `

      INSERT INTO adeudos(

        id_contrato,
        importes,
        meses_morosos,
        fecha_adeudo,
        estado

      )

      VALUES(

        ?,
        ?,
        ?,
        NOW(),
        0

      )

    `;

    conexion.query(

      sql,

      [

        id_contrato,
        importes,
        meses_morosos

      ],

      (error,result)=>{

        if(error){

          console.log(error);

          return res.status(500).json({

            mensaje:
            "Error al generar el adeudo"

          });

        }

        res.json({

          mensaje:
          "Recibo generado correctamente"

        });

      }

    );

  }
);

// OBTENER ADEUDOS

app.get(
  "/adeudos",
  (req,res)=>{

    const sql = `

      SELECT *

      FROM adeudos

      ORDER BY id_adeudo DESC

    `;

    conexion.query(

      sql,

      (error,result)=>{

        if(error){

          return res.status(500).json({

            mensaje:
            "Error al cargar adeudos"

          });

        }

        res.json(result);

      }

    );

  }
);
//Obtener contrato por ID

app.get(
  "/contrato/:id",
  async(req,res)=>{

    try{

      const [rows] =
      await conexion.promise().query(

        `
        SELECT

          c.id_contrato,
          c.codigo_contribuyente,
          ct.nombre

        FROM contratos c

        LEFT JOIN contribuyentes ct
        ON c.codigo_contribuyente =
        ct.codigo_contribuyente

        WHERE c.id_contrato = ?
        `,
        [req.params.id]

      );

      if(rows.length === 0){

        return res.status(404).json({

          mensaje:
          "Contrato no encontrado"

        });

      }

      res.json(rows[0]);

    }catch(error){

      console.log(error);

      res.status(500).json({

        mensaje:
        "Error del servidor"

      });

    }

});
//////////////Crear adeudo 
app.post(
  "/adeudos",
  async(req,res)=>{

    try{

      const {

        id_contrato,
        servicio,
        mes_inicio,
        mes_fin,
        meses_morosos,
        importes,
        observaciones

      } = req.body;

      await conexion.promise().query(

        `
        INSERT INTO adeudos(

          id_contrato,
          importes,
          meses_morosos,
          fecha_adeudo,
          estado

        )

        VALUES(?,?,?,?,?)
        `,
        [

          id_contrato,
          importes,
          meses_morosos,
          new Date(),
          0

        ]

      );

      res.json({

        mensaje:
        "Recibo generado correctamente"

      });

    }catch(error){

      console.log(error);

      res.status(500).json({

        mensaje:
        "Error al generar recibo"

      });

    }

});
