import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import Joi from "joi";
import bcrypt from 'bcrypt';
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect()
    console.log("MongoDB conectado")
} catch (err) {
    (err)=> console.log(err.message)
}

export const db = mongoClient.db()

//Post sign-up

app.post("/sign-up", async(req,res) => {
    const schemaSignup = Joi.object({
        nome: Joi.string().required(),
        email: Joi.string().email().required(),
        senha: Joi.string().min(3).required()
    })
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
})

//Post sign-in

app.post("/sign-in", async(req,res) => {
    const schemaSignin = Joi.object({
        email: Joi.string().email().required(),
        senha: Joi.string().min(3).required()
    })
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
})

//Post transação

app.post("/trans/:tipo", async(req,res) => {
    let token = req.headers.token
    if(!token) return res.status(401).send("Requisição sem token de validação")
    token = token.replace("Bearer ","")
    const tipo = req.params.tipo
    if(tipo !== "saida" && tipo !== "entrada") return res.status(422).send("Tipo de operação não localizada/permitida")
    const schemaTrans = Joi.object({
        valor: Joi.number().positive().required(),
        desc: Joi.string().required()
    })

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
        const valorteste = Math.floor(valor*100)/100
        if(valor !== valorteste){
            return res.status(422).send("Valor com mais de 2 casas decimais")
        }
        const transObj = {
            email: sessao.email,
            tipo,
            valor,
            desc,
            data: dayjs().format("DD/MM")
        }
        await db.collection("trans").insertOne(transObj)
        if(tipo === "saida"){
            await db.collection("users").updateOne({email: sessao.email},{$inc:{saldo: -valor}})
            return res.status(201).send("Transação aceita, saldo atualizado")
        }else{
            await db.collection("users").updateOne({email: sessao.email},{$inc:{saldo: valor}})
            return res.status(201).send("Transação aceita, saldo atualizado")
        }

    } catch (err) {
        return res.status(500).send(err.message)
    }
    })

const port = process.env.PORT || 5000;
app.listen(port , () => console.log(`App rodando na porta ${port}`));    