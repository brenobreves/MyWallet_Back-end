import { Router } from "express"
import { signIn, signUp } from "../controllers/users.controller.js";
import { validadeSchema } from "../middlewares/validadeSchema.js";
import { schemaSignin, schemaSignup } from "../schemas/users.schemas.js";
import { validadeJaCadastrado } from "../middlewares/validadeJaCadastrado.js";

const userRouter = Router()

userRouter.post("/sign-up",validadeSchema(schemaSignup),validadeJaCadastrado, signUp)
userRouter.post("/sign-in",validadeSchema(schemaSignin), signIn)

export default userRouter