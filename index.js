const http = require("http");
const fs = require("fs");
const url = require("url");
const {leer,crear,actualizar, eliminar, transferencia, getTransferencias} = require("./db/config");
require("dotenv").config();

const server = http.createServer(async(req,res) =>{

    // leer html
    if(req.url === "/" &&  req.method == "GET" ){
        res.writeHead(200,{'Content-Type' : 'text/html'})
        fs.readFile("index.html", (err,html) =>{   
            if(err) return res.end("fallo al leer html")
            return res.end(html)
        })
    }
    // agregar nuevo usuario
    if(req.url.includes("/usuario") && req.method === "POST"){
        let body = "";
        req.on("data", (data) =>{
            body += data;
        });
        req.on("end", async () => {
            const {nombre, balance} = JSON.parse(body)
            const resultado = await crear([nombre,balance])
           
                if(!resultado.ok){
                    res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify(resultado.data));
                }
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify(resultado.data));
               
        })
    }
    // leer usuarios
    if(req.url.includes("/usuario") && req.method === "GET"){
        const resultado = await leer()
       if(!resultado.ok){
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify(resultado.data));
       }
       res.writeHead(201, { "Content-Type": "application/json" });
       res.end(JSON.stringify(resultado.data));
    }

    // actualizar
    if(req.url.includes("/usuario") && req.method === "PUT"){
        let body = "";
        req.on("data", (data) =>{
            body += data;
        });
        req.on("end", async () => {
            const {id} = url.parse(req.url,true).query
            const { name,balance} = JSON.parse(body);
            const resultado = await actualizar([balance,name,id])
           
            if(!resultado.ok){
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify(resultado.data));
            }
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(resultado.data));
        })
    }

    // eliminar
    if(req.url.includes("/usuario") && req.method === "DELETE"){
        const {id} = url.parse(req.url,true).query
        const resultado = await eliminar([id])
           
       if(!resultado.ok){
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify(resultado.data));
       }
       res.writeHead(201, { "Content-Type": "application/json" });
       res.end(JSON.stringify(resultado.data));
    }
    
    // tranferencia 
    if(req.url.includes("/transferencia") && req.method === "POST"){
        let body = "";
        req.on("data", (data) =>{
            body += data;
        });
        req.on("end", async () => {
            const {emisor,receptor,monto} = JSON.parse(body)
            const resultado = await transferencia(monto,emisor,receptor)

           if(!resultado.ok){
               
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify(resultado.data));
           }
               
           res.writeHead(201, { "Content-Type": "application/json" });
           res.end(JSON.stringify(resultado.data));
        })
    }
    // leer transferencias
    if(req.url.includes("/transferencias") && req.method === "GET"){
        const resultado = await getTransferencias()
        if(!resultado.ok){
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify(resultado.data));
        }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(resultado.data));
    }
    
    


})
server.listen(process.env.PORT, console.log("servidor activo"))