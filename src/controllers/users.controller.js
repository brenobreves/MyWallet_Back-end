import bcrypt from 'bcrypt';
import { schemaSignin, schemaSignup } from '../schemas/users.schemas.js';
import { v4 as uuid } from "uuid";
import { db } from '../database/database.connection.js';

export async function signUp(req,res){
    const validation = schemaSignup.validate(req.body, {abortEarly: false});
    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors); 
    }
    const {nome , email , senha} = req.body
    try {
        const jacadastrado = await db.collection("users").findOne({email})
        if(jacadastrado) return res.status(409).send("E-mail já cadastrado")
        const senhaCript = bcrypt.hashSync(senha, 10)
        await db.collection("users").insertOne({nome , email , senha: senhaCript , saldo: 0})
        res.status(201).send("Usuário registrado")
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function signIn(req,res){
    const validation = schemaSignin.validate(req.body, {abortEarly: false});
    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors); 
    }
    const {email , senha} = req.body
    try {
        const user = await db.collection("users").findOne({email})
        if(!user) return res.status(404).send("E-mail não registrado")
        if(!bcrypt.compareSync(senha, user.senha)) return res.status(401).send("Senha incorreta")
        const token = uuid()
        await db.collection("sessoes").insertOne({email, token})
        delete user.senha
        res.status(200).send({...user, token})

    } catch (err) {
        return res.status(500).send(err.message)
    } 
}