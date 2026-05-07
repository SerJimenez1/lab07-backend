// Importa el objeto de modelos
import db from "../models/index.js";

// Importa jsonwebtoken para generar tokens JWT
import jwt from "jsonwebtoken";

// Importa bcryptjs para encriptar y comparar contraseñas
import bcrypt from "bcryptjs";

// Importa la configuración del secreto JWT
import authConfig from "../config/auth.config.js";

// Extrae los modelos User, Role y RefreshToken
const { user: User, role: Role, refreshToken: RefreshToken } = db;

// Controlador para el registro de usuarios
export const signup = async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (roles && roles.length > 0) {
            // Si se proporcionaron roles, buscarlos y asignarlos
            const foundRoles = await Role.findAll({
                where: { name: roles },
            });
            await user.setRoles(foundRoles);
        } else {
            // Por defecto asignar rol "user"
            const userRole = await Role.findOne({ where: { name: "user" } });
            await user.setRoles([userRole]);
        }

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para el inicio de sesión
export const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Busca el usuario incluyendo sus roles
        const user = await User.findOne({
            where: { username },
            include: { model: Role, as: "roles" },
        });

        if (!user) {
            return res.status(404).json({ message: "User Not found." });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({
                accessToken: null,
                message: "Invalid Password!",
            });
        }

        // Genera el access token (expira en 15 minutos)
        const token = jwt.sign({ id: user.id }, authConfig.secret, {
            expiresIn: 900, // 15 minutos
        });

        // Elimina el refresh token anterior si existe y crea uno nuevo
        await RefreshToken.destroy({ where: { userId: user.id } });
        const refreshToken = await RefreshToken.createToken(user);

        const authorities = user.roles.map((role) => `ROLE_${role.name.toUpperCase()}`);

        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: authorities,
            accessToken: token,
            refreshToken: refreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para refrescar el access token
export const refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;

    if (!requestToken) {
        return res.status(403).json({ message: "Refresh token requerido!" });
    }

    try {
        // Busca el refresh token en la base de datos
        const refreshToken = await RefreshToken.findOne({
            where: { token: requestToken },
        });

        if (!refreshToken) {
            return res.status(403).json({ message: "Refresh token no válido!" });
        }

        // Verifica si el refresh token ha expirado
        if (RefreshToken.verifyExpiration(refreshToken)) {
            await refreshToken.destroy();
            return res.status(403).json({
                message: "Refresh token expirado. Por favor inicia sesión nuevamente.",
            });
        }

        // Genera un nuevo access token
        const newAccessToken = jwt.sign(
            { id: refreshToken.userId },
            authConfig.secret,
            { expiresIn: 900 } // 15 minutos
        );

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para cerrar sesión (invalida el refresh token)
export const signout = async (req, res) => {
    try {
        const { userId } = req.body;

        // Elimina el refresh token del usuario en la base de datos
        await RefreshToken.destroy({ where: { userId: userId } });

        res.status(200).json({ message: "Sesión cerrada correctamente!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};