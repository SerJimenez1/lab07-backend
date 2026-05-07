// Importa Express para definir rutas
import express from "express";

// Importa los controladores de autenticación
import { signup, signin, refreshToken, signout } from "../controllers/auth.controller.js";

// Importa los middlewares de verificación
import {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
} from "../middlewares/verifySignUp.js";

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/signup", [checkDuplicateUsernameOrEmail, checkRolesExisted], signup);

// Ruta para iniciar sesión
router.post("/signin", signin);

// Ruta para refrescar el access token
router.post("/refreshtoken", refreshToken);

// Ruta para cerrar sesión
router.post("/signout", signout);

export default router;