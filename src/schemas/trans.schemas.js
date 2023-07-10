import Joi from "joi"

export const schemaTrans = Joi.object({
    valor: Joi.number().positive().required(),
    desc: Joi.string().max(20).required()
})