import dayjs from "dayjs";
import { schemaTrans } from "../schemas/trans.schemas.js";
import { db } from "../database/database.connection.js";

export async function postTrans(req,res){
    let token = req.headers.authorization
    if(!token) return res.status(401).send("Requisição sem token de validação")
    token = token.replace("Bearer ","")
    const tipo = req.params.tipo
    if(tipo !== "saida" && tipo !== "entrada") return res.status(422).send("Tipo de operação não localizada/permitida")
    let {valor , desc} = req.body
    try {
        const sessao = await db.collection("sessoes").findOne({token}) 
        if(!sessao) return res.status(401).send("Token inválido ou inativo")
        const validation = schemaTrans.validate(req.body, {abortEarly: false});
        if(validation.error){
            const errors = validation.error.details.map(detail => detail.message);
            return res.status(422).send(errors); 
        }
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
    let token = req.headers.authorization
    if(!token) return res.status(401).send("Requisição sem token de validação")
    token = token.replace("Bearer ","")
    try {
        const sessao = await db.collection("sessoes").findOne({token}) 
        if(!sessao) return res.status(401).send("Token inválido ou inativo")
        const trans = (await db.collection("trans").find({email: sessao.email}).toArray()).reverse()
        return res.send(trans)
    } catch (err) {
        return res.status(500).send(err.message)   
    }
}