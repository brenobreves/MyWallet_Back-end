import dayjs from "dayjs";
import { db } from "../database/database.connection.js";


export async function postTrans(req,res){
    const tipo = req.params.tipo
    if(tipo !== "saida" && tipo !== "entrada") return res.status(422).send("Tipo de operação não localizada/permitida")
    let {valor , desc} = req.body
    try {         
        valor = Number(valor)     
        let valorteste = Math.floor(valor*100)/100
        if(valor !== valorteste){
            return res.status(422).send("Valor com mais de 2 casas decimais")
        }
        const transObj = {
            email: sessao.email,
            tipo,
            valor: valor.toFixed(2),
            desc,
            data: dayjs().format("DD/MM")
        }
        await db.collection("trans").insertOne(transObj)
        if(tipo === "saida"){
            await db.collection("users").updateOne({email: sessao.email},{$inc:{saldo: -valor}})
        }else{
            await db.collection("users").updateOne({email: sessao.email},{$inc:{saldo: valor}})
        }
        const usuario = await db.collection("users").findOne({email: sessao.email})
        delete usuario._id
        delete usuario.senha
        return res.status(201).send(usuario)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function getTrans(req,res){
    try {
        const trans = (await db.collection("trans").find({email: sessao.email}).toArray()).reverse()
        return res.send(trans)
    } catch (err) {
        return res.status(500).send(err.message)   
    }
}