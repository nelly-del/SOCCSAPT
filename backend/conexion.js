let mysql = require("mysql2");

let conexion = mysql.createConnection({
  host: "localhost",
  database: "proyect_agua",
  user: "root",
  password: ""
});

conexion.connect(function(err){
  if(err){
    throw err;
  }else{
    console.log("conexion exitosa");
  }
});

// conexion.end();

module.exports = conexion;