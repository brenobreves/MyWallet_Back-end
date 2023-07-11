import { db } from "../database/database.connection.js"

export async function validadeJaCadastrado(req,res,next){
    const {nome , email , senha} = req.body
    try {
        const jacadastrado = await db.collection("users").findOne({email})
        if(jacadastrado) return res.status(409).send("E-mail já cadastrado")
        next()
    } catch (err) {
        res.status(500).send(err.message)
    }
}