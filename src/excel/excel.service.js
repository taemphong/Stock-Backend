import pool from "../connect.js";

const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' });

export const excelImportProductService = async (payload) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  
   
  
  
    } catch (error) {
      await connection.rollback(); // Rollback on error
      console.error(":", error);
    } finally {
      connection.release(); // Always release connection
    }
  };
  