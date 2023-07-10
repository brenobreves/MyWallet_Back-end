import Joi from "joi"

export const schemaSignup = Joi.object({
    nome: Joi.string().required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(3).required()
})

export const schemaSignin = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().min(3).required()
})