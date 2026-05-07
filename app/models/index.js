// Importamos Sequelize
import Sequelize from "sequelize";

// Importamos la configuración de la base de datos
import dbConfig from "../config/db.config.js";

// Importamos los modelos
import userModel from "./user.model.js";
import roleModel from "./role.model.js";
import refreshTokenModel from "./refreshToken.model.js";

// Creamos una instancia de Sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    port: dbConfig.PORT,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Inicializamos los modelos
db.user = userModel(sequelize, Sequelize);
db.role = roleModel(sequelize, Sequelize);
db.refreshToken = refreshTokenModel(sequelize, Sequelize);

// Relación muchos a muchos entre roles y usuarios
db.role.belongsToMany(db.user, {
    through: "user_roles",
    foreignKey: "roleId",
    otherKey: "userId",
});

db.user.belongsToMany(db.role, {
    through: "user_roles",
    foreignKey: "userId",
    otherKey: "roleId",
    as: "roles",
});

// Relación uno a uno entre usuario y refreshToken
db.refreshToken.belongsTo(db.user, {
    foreignKey: "userId",
    targetKey: "id",
});

db.user.hasOne(db.refreshToken, {
    foreignKey: "userId",
    targetKey: "id",
});

db.ROLES = ["user", "admin", "moderator"];

export default db;