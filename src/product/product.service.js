import pool from "../connect.js";

import AWS from "aws-sdk";
import message from "aws-sdk/lib/maintenance_mode_message.js";
import { keyS3 } from "../../config/config_s3.js";
import fileUpload from "express-fileupload";


AWS.config.update(keyS3);
message.suppress = true;
var s3 = new AWS.S3(); //thaimed-one


export const mainGetFileS3Service = async (payload) => {
  console.log("oooo",payload)

  const params = {
    Bucket: `stock/product`,
    Key: payload,
    Expires: 100000
  };
  // console.log(req);
  try {
    const results = await s3.getSignedUrlPromise('getObject', params);
    console.log('mainGetFileS3Service', results)
    return ({ result: true, code: '200', urls3: results, errorMessage: '' })
  } catch (e) {
    return ({ result: false, code: '500', urls3: [], errorMessage: e })
  }
}

export const addProductService = async (payload) => {
  const connection = await pool.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction(); // Start a transaction
    console.log(payload);

    let chkSerials = payload.serials != null && payload.serials !== "" ? 1 : 0;
    let dateEXPPro = ""


    if (payload.p_exp != "") {
      dateEXPPro = payload.p_exp.split("-")[0] + payload.p_exp.split("-")[1] + payload.p_exp.split("-")[2]
    }




    let sqlAddProduct = `INSERT INTO product (p_code, p_name, p_total, p_details, pt_id,p_exp, p_company, p_optional,p_price, created_at) 
      VALUES ('${payload.p_code}','${payload.p_name}','${payload.p_total}','${payload.p_details}','${payload.pt_id}','${dateEXPPro}','${payload.p_company}','${chkSerials}','${payload.p_price}',NOW())`;

    const [resAddProduct] = await connection.query(sqlAddProduct);
    let PID = resAddProduct.insertId;

    if (resAddProduct.affectedRows) {
      let AddproductLog = `INSERT INTO log_product (u_id, p_id, log_total, log_before, log_after, log_detail, created_at) 
        VALUES ('${payload.u_id}','${PID}','${payload.p_total}','0','${payload.p_total}','Add',NOW())`;
      const [resAddproductLog] = await connection.query(AddproductLog);

      if (resAddproductLog.affectedRows == 1) {
        if (payload.serials) {
          for await (let i of payload.serials) {
            let sqlAddSubProduct = `INSERT INTO sub_product (p_id, sp_serial, created_at) 
              VALUES  ('${PID}','${i}',NOW())`;
            const [resAddSubProduct] = await connection.query(sqlAddSubProduct);

            if (resAddSubProduct.affectedRows != 1) {
              throw new Error("Sub-product insertion failed.");
            }
          }
        }




        // await connection.commit(); 
        // await connection.rollback();
        return { data: resAddproductLog, status: 200, p_id: resAddProduct.insertId }; // Return success status
      } else {
        throw new Error("Log insertion failed.");
      }
    } else {
      throw new Error("Product insertion failed.");
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction in case of an error
    console.error("Error occurred:", error.message);

    // ตรวจจับข้อผิดพลาดที่ซ้ำกัน
    if (error.message.includes("Duplicate entry")) {
      return { status: 204, message: "Duplicate product code." };
    } else if (error.message.includes("Product insertion failed")) {
      return { status: 400, message: "Failed to add product." };
    } else if (error.message.includes("Log insertion failed")) {
      return { status: 400, message: "Failed to log product addition." };
    } else if (error.message.includes("Sub-product insertion failed")) {
      return { status: 400, message: "Failed to add sub-product." };
    } else {
      return { status: 500, message: "Internal server error." }; // General server error
    }
  } finally {
    connection.release(); // Release the connection back to the pool
  }
};

export const addProductTypeService = async (payload) => {
  try {
    let sqlAddProductType = `INSERT INTO product_type (pt_type,created_at) VALUES  ('${payload.PType}',NOW())`;
    const [resAddProductType] = await pool.query(sqlAddProductType);
    if (resAddProductType.affectedRows == 1) {
      return { resAddProductType };
    } else {
      return { resAddProductType };
    }
  } catch (error) {
    console.log(error);

    return { err: error, sql: resAddProductType };
  }
};

//***********intern******************** */
export const getProductCartsService = async () => {
  const sql = `SELECT a.p_name,  a.p_total,  b.pt_type 
        FROM
	    product a
	    INNER JOIN product_type b
	    ON a.pt_id = b.pt_id
      WHERE a.deleted_at IS NULL`
      const [result] = await pool.query(sql);
      return result;
}


//******************************************* */


export const getProductService = async () => {
  try {
    let sqlGetProduct = `SELECT  a.p_id,  a.p_code,  a.p_name,  a.p_total,  a.p_details , a.path_img	, a.p_optional, b.pt_type ,b.pt_id
        FROM
	    product a
	    INNER JOIN product_type b
	    ON a.pt_id = b.pt_id
      WHERE a.deleted_at IS NULL`;
    const [resGetProduct] = await pool.query(sqlGetProduct);
    // console.log("resGetProduct", resGetProduct);
    // let objImg = {}
    let arrWithURLImg = []


    for await (let i of resGetProduct) {
      let tempObj = {
        p_id: "",
        p_code: "",
        p_name: "",
        p_total: "",
        p_details: "",
        path_img: "",
        p_optional: "",
        pt_type: "",
        pt_id: "",
        url_img: ""
      }
      // console.log("i",i);


      if (i.path_img != null && i.path_img != "null") {
   
        // console.log(await mainGetFileS3Service(i.path_img));
        
        // console.log("have",i.path_img);
        tempObj.p_id = i.p_id
        tempObj.p_code = i.p_code
        tempObj.p_name = i.p_name
        tempObj.p_total = i.p_total
        tempObj.p_details = i.p_details
        tempObj.path_img = i.path_img
        tempObj.p_optional = i.p_optional
        tempObj.pt_type = i.pt_type
        tempObj.pt_id = i.pt_id
        tempObj.url_img = await mainGetFileS3Service(i.path_img)
        arrWithURLImg.push(tempObj)




      } else {
        // console.log(i.p_id);
        
        tempObj.p_id = i.p_id
        tempObj.p_code = i.p_code
        tempObj.p_name = i.p_name
        tempObj.p_total = i.p_total
        tempObj.p_details = i.p_details
        tempObj.path_img = i.path_img
        tempObj.p_optional = i.p_optional
        tempObj.pt_type = i.pt_type
        tempObj.pt_id = i.pt_id
        tempObj.url_img = ""
        arrWithURLImg.push(tempObj)

      }





    }

    // console.log(arrWithURLImg);


    let chkOptional = ""

    const filteredProducts = resGetProduct.filter(
      (product) => product.p_optional == 1
    );

    // console.log(filteredProducts.length);
    let p_id_inlist = "";
    let [resGetSerial] = ''
    let sqlGetSerial = ""

    if (filteredProducts.length == 0) {
      chkOptional = 0
    } else {
      chkOptional = 1
      for await (let i of filteredProducts) {
        p_id_inlist += `${i.p_id},`;
      }

      if (p_id_inlist !== "") {
        p_id_inlist = p_id_inlist.slice(0, -1);
      }
      // console.log("u",p_id_inlist);

      sqlGetSerial = `SELECT * FROM sub_product WHERE p_id IN (${p_id_inlist}) AND deleted_at IS NULL`;

    }
    // console.log("96666",sqlGetSerial);
    if (sqlGetSerial != "") {
      [resGetSerial] = await pool.query(sqlGetSerial);
    }






    console.log("ssss",resGetSerial);

    return { data: arrWithURLImg, product_serials: chkOptional == 0 ? [] : resGetSerial };
  } catch (error) {
    // console.log("mmmm",error);

    // return { error };
  }
};

export const getProductTypeService = async () => {
  try {
    let sqlGetProductType = `SELECT a.*, SUM(b.p_total) AS pt_total FROM product_type a INNER JOIN product b ON a.pt_id = b.pt_id GROUP BY a.pt_id;`;
    const [resGetProductType] = await pool.query(sqlGetProductType);
    // console.log(resGetProductType);
    return resGetProductType;
  } catch (error) {
    return { error };
  }
};

export const updateProductService = async (payload) => {
  try {
    let sqlChkProduct = `SELECT p_id, p_code, p_name, p_total, p_details, p_id FROM product WHERE p_id = '${payload.p_id}'`;
    let [resChkProduct] = await pool.query(sqlChkProduct);

    let filter = "";
    if (payload.p_code) {
      filter += `p_code = '${payload.p_code}',`;
    }
    if (payload.p_name) {
      filter += `p_name = '${payload.p_name}',`;
    }
    if (payload.p_details) {
      filter += `p_details = '${payload.p_details}',`;
    }
    if (payload.log_total) {
      filter += `p_total = '${payload.log_total}',`;
    }
    if (payload.pt_id) {
      filter += `pt_id = '${payload.pt_id}',`;
    }
    if (payload.p_price) {
      filter += `p_price = '${payload.p_price}',`;
    }

    if (filter !== "") {
      filter = filter.slice(0, -1);
    }

    // Increase
    if (resChkProduct[0].p_total < payload.log_total) {
      let sqlAdd = `INSERT INTO log_product (u_id, p_id, log_total, log_before, log_after, log_detail, created_at) 
                    VALUES ('${payload.u_id}', '${payload.p_id}', '${payload.log_total
        }', '${resChkProduct[0].p_total}', 
                    '${parseInt(payload.log_total) -
        parseInt(resChkProduct[0].p_total)
        }', 'Increase', NOW())`;

      const [resIncrease] = await pool.query(sqlAdd);

      if (resIncrease.affectedRows) {
        let sqlUpdateProductTotal = `UPDATE product SET ${filter} WHERE p_id = '${payload.p_id}' LIMIT 1;`;
        const [resUpdateProductTotal] = await pool.query(sqlUpdateProductTotal);

        if (resUpdateProductTotal.affectedRows == 1) {
          return { code: 200, msg: "Increase success" };
        } else {
          return { code: 201, msg: "Increase failed" };
        }
      }
    }
    // Decrease
    else if (resChkProduct[0].p_total > payload.log_total) {
      let sqlDecrease = `INSERT INTO log_product (u_id, p_id, log_total, log_before, log_after, log_detail, created_at) 
                         VALUES ('${payload.u_id}', '${payload.p_id}', '${payload.log_total
        }', '${resChkProduct[0].p_total}', 
                         '${parseInt(resChkProduct[0].p_total) -
        parseInt(payload.log_total)
        }', 'Decrease', NOW())`;

      const [resDecrease] = await pool.query(sqlDecrease);

      if (resDecrease.affectedRows == 1) {
        let sqlUpdateProductTotal = `UPDATE product SET ${filter} WHERE p_id = '${payload.p_id}' LIMIT 1;`;
        const [resUpdateProductTotal] = await pool.query(sqlUpdateProductTotal);

        if (resUpdateProductTotal.affectedRows == 1) {
          return { code: 200, msg: "Decrease success" };
        } else {
          return { code: 201, msg: "Decrease failed" };
        }
      }
    }
    // Just Update
    else {
      let sqlUpdateDetailProduct = `UPDATE product SET ${filter} WHERE p_id = '${payload.p_id}' LIMIT 1;`;

      const [resUpdateDetailProduct] = await pool.query(sqlUpdateDetailProduct);

      if (resUpdateDetailProduct.affectedRows) {
        return { code: 200, msg: "Update Success" };
      } else {
        return { code: 201, msg: "Update Failed" };
      }
    }
  } catch (error) {
    console.log(error);
    return { code: 500, msg: "An error occurred" };
  }
};

export const getProductByIdService = async (payload) => {
  try {
    let sqlGetProduct = `SELECT  *   FROM product WHERE p_id='  ${payload.p_id}'  `;
    const [resGetProduct] = await pool.query(sqlGetProduct);
    console.log(resGetProduct);
    return { data: resGetProduct };
  } catch (error) {
    return { error };
  }
};

export const updateProductTypeService = async (payload) => {
  try {
    let sqlUpdateProductType = `UPDATE product_type SET pt_type = '${payload.pt_type}' WHERE pt_id = ${payload.pt_id}`;
    const [resUpdateProductType] = await pool.query(sqlUpdateProductType);
    if (resUpdateProductType.affectedRows == 1) {
      console.log("Update successfully.");
      return { code: 200, msg: "Increase success" };
    } else {
      console.log("Update Fail.");
      return { code: 201, msg: "failed" };
    }
  } catch (error) {
    return error;
  }
};
export const deleteProductTypeService = async (payload) => {
  try {
    let sqlDelectProductType = `UPDATE product_type SET deleted_at  = NOW() WHERE pt_id = ${payload.pt_id} LIMIT 1`;
    const [resDelectProductType] = await pool.query(sqlDelectProductType);
    if (resDelectProductType.affectedRows == 1) {
      return { code: 200, msg: "success" };
    } else {
      return { code: 201, msg: "failed" };
    }
  } catch (error) {
    return { code: 500, msg: "An error occurred" };
  }
};

export const deleteProductService = async (payload) => {
  try {
    let sqlDelectProduct = `UPDATE product SET deleted_at  = NOW() WHERE p_id = ${payload.p_id} LIMIT 1`;
    const [resDelectProduct] = await pool.query(sqlDelectProduct);
    if (resDelectProduct.affectedRows == 1) {
      return { code: 200, msg: "success" };
    } else {
      return { code: 201, msg: "failed" };
    }
  } catch (error) {
    return error;
  }
};

export const getProductByBarCodeService = async (payload) => {
  try {
    console.log("lllkl", payload);

    let sqlGetProduct = `SELECT  *   FROM product WHERE p_code = '${payload.barcode}'`;
    const [resGetProduct] = await pool.query(sqlGetProduct);
    console.log(resGetProduct);
    return { data: resGetProduct };
  } catch (error) {
    return { error };
  }
};
export const updateProductByBarCodeService = async (payload) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for await (const i of payload) {
      console.log("Processing item:", i);

      let sqlChkProductTotal = `SELECT p_total AS pro_total FROM product WHERE p_id = ?`;
      const [resChkProductTotal] = await connection.query(sqlChkProductTotal, [
        i.p_id,
      ]);

      if (resChkProductTotal.length === 0) {
        // Product not found, rollback and return an error
        await connection.rollback();
        return { error: `Product with ID ${i.p_id} not found` };
      }

      console.log("Current product total:", resChkProductTotal);

      if (i.p_total > resChkProductTotal[0].pro_total) {
        let sqlUpdateProduct = `UPDATE product SET p_total = ? WHERE p_id = ?`;
        const [resUpdateProduct] = await connection.query(sqlUpdateProduct, [
          i.p_total,
          i.p_id,
        ]);

        if (resUpdateProduct.affectedRows !== 1) {
          // Update failed, rollback and return an error
          await connection.rollback();
          return { error: `Failed to update product with ID ${i.p_id}` };
        }

        let sqlInsLogProduct = `INSERT INTO log_product (u_id, p_id, log_total, log_before, log_after, log_detail, created_at) 
          VALUES (?, ?, ?, ?, ?, 'Increase', NOW())`;
        const [resInsLogProduct] = await connection.query(sqlInsLogProduct, [
          i.u_id,
          i.p_id,
          i.p_total,
          resChkProductTotal[0].pro_total,
          i.p_total - resChkProductTotal[0].pro_total,
        ]);

        if (resInsLogProduct.insertId) {
          console.log("Update and log insertion successful");
        } else {
          // Log insertion failed, rollback and return an error
          await connection.rollback();
          return {
            error: `Failed to insert log for product with ID ${i.p_id}`,
          };
        }
      } else {
        // The new total is less than or equal to the current total, rollback and return an error
        await connection.rollback();
        return {
          error: `New total cannot be less than or equal to the current total for product with ID ${i.p_id}`,
        };
      }
    }

    // If everything is successful, commit the transaction
    await connection.commit();
    // await connection.rollback();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    return { error: `Transaction failed: ${error.message}` };
  } finally {
    connection.release();
  }
};

export const getProductTypeByIDService = async (payload) => {
  try {
    console.log("mmm", payload.p_id);

    let sqlGetProductTypeByID = `SELECT a.*,b.pt_type FROM product a INNER JOIN product_type b ON a.pt_id = b.pt_id WHERE a.pt_id = '${payload.p_id}'`;
    console.log(sqlGetProductTypeByID);

    const [resGetProductTypeByID] = await pool.query(sqlGetProductTypeByID);
    console.log(resGetProductTypeByID);
    return { data: resGetProductTypeByID };
  } catch (error) {
    return { resGetProductTypeByID };
  }
};

export const addGroupTypeProductService = async (payload) => {
  try {
    let sqlAddGroupTypeProduct = `INSERT INTO group_type_product (pt_id,g_name,created_at) VALUES  ('${payload.pt_id}','${payload.g_name}',NOW())`;
    const [resAddGroupTypeProduct] = await pool.query(sqlAddGroupTypeProduct);
    if (resAddGroupTypeProduct.affectedRows == 1) {
      return { resAddGroupTypeProduct };
    } else {
      return { resAddGroupTypeProduct };
    }
  } catch (error) {
    console.log(error);

    return { err: error, sql: resAddGroupTypeProduct };
  }
};

export const getGroupTypeProductService = async () => {
  try {
    let sqlGetGroupTypeProduct = `SELECT * FROM  group_type_product`;
    const [resGetGroupTypeProduct] = await pool.query(sqlGetGroupTypeProduct);

    return { data: resGetGroupTypeProduct };
  } catch (error) {
    console.log(error);

    return { err: error };
  }
};

export const updateGroupProductTypeService = async (payload) => {
  try {
    console.log("uuuu", payload);

    // let sqlAddGroupTypeProduct = `INSERT INTO group_type_product (pt_id,g_name,created_at) VALUES  ('${payload.pt_id}','${payload.g_name}',NOW())`;
    // const [resAddGroupTypeProduct] = await pool.query(sqlAddGroupTypeProduct);
    // if (resAddGroupTypeProduct.affectedRows == 1) {
    //   return { resAddGroupTypeProduct };
    // } else {

    //   return { resAddGroupTypeProduct };
    // }
  } catch (error) {
    // console.log(error);
    // return { err: error, sql: resAddGroupTypeProduct };
  }
};

export const getProductSerialService = async (payload) => {
  try {
    let sqlGetProductSerial = `SELECT a.*,b.sp_serial FROM product a INNER JOIN sub_product b ON b.p_id = a.p_id WHERE a.p_id = '${payload.p_id}' AND  a.deleted_at IS NULL AND b.deleted_at IS NULL`;

    const [resGetProductSerial] = await pool.query(sqlGetProductSerial);
    console.log(resGetProductSerial);
    return { data: resGetProductSerial };
  } catch (error) {
    return { resGetProductSerial };
  }
};

export const getProductTypeAllService = async () => {
  try {
    let sqlGetProductType = `SELECT * FROM product_type WHERE deleted_at IS NULL;`;
    const [resGetProductType] = await pool.query(sqlGetProductType);
    // console.log(resGetProductType);
    return resGetProductType;
  } catch (error) {
    return { error };
  }
};

export const getProductHaveSerialService = async () => {
  try {
    let sqlGetProductHaveSerial = `SELECT * FROM product WHERE p_optional IS NOT NULL AND deleted_at IS NULL;`;
    const [resGetProductHaveSerial] = await pool.query(sqlGetProductHaveSerial);
    console.log(resGetProductHaveSerial);
    return resGetProductHaveSerial;
  } catch (error) {
    return { error };
  }
};
export const updateSerialService = async (payload) => {
  const connection = await pool.getConnection();
  try {
    // Start transaction
    await connection.beginTransaction();

    // Fetch the current product total
    const sqlChkProductTotal = "SELECT p_total FROM product WHERE p_id = ?";
    const [resChkProductTotal] = await connection.query(sqlChkProductTotal, [
      payload.p_id,
    ]);

    if (resChkProductTotal.length === 0) {
      await connection.rollback();
      return { success: false, message: "Product not found." };
    }

    // Insert log entry for the product update
    const logBefore = parseInt(resChkProductTotal[0].p_total);
    const logAfter = parseInt(payload.p_total) - logBefore;

    const sqlInsLogPro = `
      INSERT INTO log_product (u_id, p_id, log_total, log_before, log_after, log_detail, created_at)
      VALUES (?, ?, ?, ?, ?, 'Increase', NOW())`;

    const [resInsLogPro] = await connection.query(sqlInsLogPro, [
      payload.u_id,
      payload.p_id,
      payload.p_total,
      logBefore,
      logAfter,
    ]);

    if (resInsLogPro.affectedRows !== 1) {
      await connection.rollback();
      return { success: false, message: "Failed to insert log entry." };
    }

    // Update product total
    const sqlUpdateProductTotal =
      "UPDATE product SET p_total = ? WHERE p_id = ? LIMIT 1";
    const [resUpdateProductTotal] = await connection.query(
      sqlUpdateProductTotal,
      [payload.p_total, payload.p_id]
    );

    if (resUpdateProductTotal.affectedRows !== 1) {
      await connection.rollback();
      return { success: false, message: "Failed to update product total." };
    }

    // Insert each serial in the sub_product table
    for (let serial of payload.serial) {
      const sqlInsSubPro =
        "INSERT INTO sub_product (p_id, sp_serial, created_at) VALUES (?, ?, NOW())";
      await connection.query(sqlInsSubPro, [payload.p_id, serial.sp_serial]);
    }

    // Commit the transaction if everything is successful
    await connection.commit();
    return { success: true };
  } catch (error) {
    // Rollback transaction in case of error
    await connection.rollback();
    return { success: false, error: error.message };
  } finally {
    // Always release the connection
    connection.release();
  }
};


export const checkproductCodeService = async (payload) => {
  try {
    let sqlCheckproductCode = `SELECT * FROM product WHERE p_code ='${payload.p_code}' AND deleted_at IS NULL;`;
    const [resCheckproductCode] = await pool.query(sqlCheckproductCode);
    console.log("sql",sqlCheckproductCode);
    
    console.log(resCheckproductCode);
    return resCheckproductCode;
  } catch (error) {
    return { error };
  }
};