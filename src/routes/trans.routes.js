import { Router } from "express"
import { getTrans, postTrans } from "../controllers/trans.controller.js";


const transRouter = Router()

transRouter.post("/trans/:tipo",postTrans)
transRouter.get("/transactions", getTrans)

export default transRouter