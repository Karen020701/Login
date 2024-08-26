require('dotenv').config();
const { Pool } = require('pg');


const clientDbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME1,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};


const veterinaryDbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME2,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const clientPool = new Pool(clientDbConfig);
const veterinaryPool = new Pool(veterinaryDbConfig);

module.exports = { clientPool, veterinaryPool };
