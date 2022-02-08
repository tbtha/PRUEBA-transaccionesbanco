const {Pool} = require("pg");
const moment = require("moment");
require("dotenv").config();

const config = {
    user: process.env.USER ,
    password:process.env.PASSWORD ,
    host:"localhost" ,
    port:process.env.PORTDB ,
    database:process.env.DBNAME,
}

const pool = new Pool(config);

// insert
const crear = async (datos) =>{
    const query = {
        text: "INSERT INTO usuarios (nombre,balance) VALUES ($1, $2) RETURNING *;",
        values: datos,
        };

    const client = await pool.connect()
    try {
        const result = await client.query(query)
        return {
            ok:true,
            data:result.rows,
        }
        // return  result.rows;
        
    } catch (error) {
        console.log("Error en DB :" + error);
        return {
            ok:false,
            data:"error en db",
        }
    }finally{
        client.release()   
    }
}

// read
const leer = async () =>{
    const client = await pool.connect()
    try {
        const result = await client.query("SELECT * FROM usuarios;")
        return {
            ok:true,
            data:result.rows,
        }
        // return  result.rows;
    } catch (error) {
        console.log("Error en DB :" + error);
        return {
            ok:false,
            data:"error en db"
        }
    }finally{
        client.release()   
    }
}

// update
const actualizar = async (datos) =>{
    const query = {
        text: "UPDATE usuarios SET balance = $1, nombre = $2 WHERE id = $3 RETURNING*",
        values: datos,
        };
    const client = await pool.connect()
    try {
        const result = await client.query(query)
        return {
            ok:true,
            data:result.rows,
        }
        // return  result.rows;
        
    } catch (error) {
        console.log("Error en DB : " + error);
        return {
            ok:false,
            data:"error en db"
        }
           
    }finally{
        client.release()   
    }
}

// delete
const eliminar = async (datos) =>{
    const query = {
        text: "DELETE FROM usuarios WHERE id = $1 RETURNING*",
        values: datos,
        };
    const client = await pool.connect()
    try {
        const result = await client.query(query)
        return {
            ok:true,
            data:result.rows,
        }
        // return  result.rows;
        
    } catch (error) {
        console.log("Error en DB : " + error);
        return{
            ok:false,
            data:"error de db"
        }
           
    }finally{
        client.release()   
    }
}

// 
const transferencia = async(monto,emisor,receptor) => {
    const client = await pool.connect()
    const queryEmisor = {
        text:"SELECT * FROM usuarios WHERE nombre = $1",
        values: [emisor]
    }
    const queryReceptor = {
        text:"SELECT * FROM usuarios WHERE nombre = $1",
        values: [receptor]
    }

    try {
        const fecha = moment().format() 

        await client.query("BEGIN;");
        const {id: idEmisor} = (await client.query(queryEmisor)).rows[0]
        const {id: idReceptor} = (await client.query(queryReceptor)).rows[0]
        const queryI = {
        text: "INSERT INTO transferencias (emisor,receptor,monto,fecha) VALUES ($1,$2,$3,$4) RETURNING*;",
        values:[idEmisor,idReceptor,monto,fecha]
        }
        const queryDescuento = {
            text: "UPDATE usuarios set balance = balance - $1 where nombre = $2;",
            values:[monto, emisor]
        }
            const queryAcreditacion = {
        text: "UPDATE usuarios set balance = balance + $1 where nombre = $2;",
        values:[monto,receptor]
         };
        
        const insertar = (await client.query(queryI)).rows[0]
        const descuento = (await client.query(queryDescuento)).rows[0]
        const acreditacion = (await client.query(queryAcreditacion)).rows[0]
        
        await client.query("COMMIT;");
        
        return  {
            ok:true,
            data : "Transaccion exitosa",
        }
        
    } catch (error) {
        console.log("Error en DB transferencia: " + error);
        await client.query("ROLLBACK;")
        return {
            ok:false,
            data: "transaccion fallida",
        }
    }finally{
        client.release()   
    }
}
const getTransferencias = async () =>{
    const client = await pool.connect()
    const queryGet = {
        text:"SELECT * FROM transferencias;",
        rowMode: "array"
    }
    try {
        const result = await client.query(queryGet)
        return {
            ok:true,
            data:result.rows,
        }
        // return  result.rows;
        
    } catch (error) {
        console.log("Error en DB :" + error);
        return {
            ok:false,
            data:"error en db"
        }
    }finally{
        client.release()   
    }
}

module.exports = {leer,crear,actualizar,eliminar,transferencia,getTransferencias}