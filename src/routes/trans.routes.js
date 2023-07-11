import { Router } from "express"
import { getTrans, postTrans } from "../controllers/trans.controller.js";
import { validadeSchema } from "../middlewares/validadeSchema.js";
import { schemaTrans } from "../schemas/trans.schemas.js";
import { validadeAuth } from "../middlewares/validadeAuth.js";


const transRouter = Router()

transRouter.post("/trans/:tipo",validadeAuth,validadeSchema(schemaTrans),postTrans)
transRouter.get("/transactions",validadeAuth, getTrans)

export default transRouter