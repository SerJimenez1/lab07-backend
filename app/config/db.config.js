// app/config/db.config.js
export default {
    HOST: "turntable.proxy.rlwy.net",
    USER: "root",
    PASSWORD: "zZpdOwPYiUBdTbPVFuWEkDPHVDcLVZxq",
    DB: "railway",
    PORT: 57700,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};