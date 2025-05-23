import mysql from "mysql2"

const pool = mysql.createPool({
    host:  process.env.DB_HOST,
    database: process.env.DB_NAME,
    user:  process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 3306,
    connectionLimit: 10

}).promise()

export default pool