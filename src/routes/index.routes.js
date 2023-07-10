import { Router } from "express";
import transRouter from "./trans.routes.js";
import userRouter from "./users.routes.js";

const router = Router()

router.use(transRouter)
router.use(userRouter)

export default router