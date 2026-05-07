// app/models/refreshToken.model.js
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";

export default (sequelize, Sequelize) => {
    const RefreshToken = sequelize.define("refreshToken", {
        token: {
            type: Sequelize.STRING,
        },
        expiryDate: {
            type: Sequelize.DATE,
        },
    });

    // Genera un refresh token único usando UUID
    RefreshToken.createToken = async function (user) {
        const expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() + 86400); // 24 horas

        const token = uuidv4();

        const refreshToken = await this.create({
            token: token,
            userId: user.id,
            expiryDate: expiredAt,
        });

        return refreshToken.token;
    };

    // Verifica si el refresh token ha expirado
    RefreshToken.verifyExpiration = (token) => {
        return token.expiryDate.getTime() < new Date().getTime();
    };

    return RefreshToken;
};