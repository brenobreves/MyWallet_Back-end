import { db } from "../database/database.connection.js"

export async function validadeAuth(req,res,next){
    const {authorization} = req.headers
    const token = authorization?.replace("Bearer ","")
    if(!token) return res.status(401).send("Requisição sem token de validação")
    try {
        const sessao = await db.collection("sessoes").findOne({token}) 
        if(!sessao) return res.status(401).send("Token inválido ou inativo")
        next()
    } catch (err) {
        res.status(500).send(err.message)
    }
}