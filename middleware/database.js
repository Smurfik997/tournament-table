const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql'
});

module.exports = sequelize;