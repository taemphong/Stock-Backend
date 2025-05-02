import pool from "../connect.js";

export const addWithdrawService = async (payload) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // console.log("payload", payload);

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    let w_order = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;

    for (const i of payload.data) {
      // Insert into withdraw table
      let sqlAddWithdraw = `INSERT INTO withdraw (w_order, u_id, p_id, w_total, r_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())`;
      const [resAddWithdraw] = await connection.query(sqlAddWithdraw, [w_order, i.u_id, i.p_id, i.w_total, i.r_id]);

      if (resAddWithdraw.affectedRows) {
        // Insert into verify table
        let sqlInsVerify = `INSERT INTO verify (w_id, s_id, v_comment, u_id, created_at) VALUES (?, 1, '', ?, NOW())`;
        const [resInsVerify] = await connection.query(sqlInsVerify, [resAddWithdraw.insertId, i.u_id]);

        if (resInsVerify.affectedRows) {
          // Update sub_product serials
          for (const x of i.serials) {
            console.log("xxxx", x);

            // let sqlUpdateStatusSerial = `UPDATE sub_product SET s_id = '1' WHERE sp_serial = ?`;

            let sqlUpdateStatusSerial = `INSERT INTO log_sub_product (w_order,sp_serial,p_id,created_at) VALUES(?,?,?,NOW())`;


            const [resUpdateStatusSerial] = await connection.query(sqlUpdateStatusSerial, [w_order, x.serial_number, x.p_id2]);

            if (resUpdateStatusSerial.affectedRows !== 1) {
              throw new Error("Failed to update sub_product serial status");
            }
          }
        } else {
          throw new Error("Failed to insert into verify table");
        }
      } else {
        throw new Error("Failed to insert into withdraw table");
      }
    }

    await connection.commit();
    // await connection.rollback();
    return { msg: "Withdraw success" };
  } catch (error) {
    await connection.rollback();
    console.error("Transaction failed, rolling back:", error);
    return { error: error.message };
  } finally {
    connection.release();
  }
};

// Show Order all withdrall
export const getWithdrawService = async (payload) => {
  try {
    let sqlChkRole = `SELECT r_id AS roleID FROM user WHERE u_id = '${payload.u_id}'`;

    const [resChkRole] = await pool.query(sqlChkRole);
    // console.log(resChkRole[0].roleID);
    let sqlGetWithdraw = "";
    if (resChkRole[0].roleID == 4 || resChkRole[0].roleID == 3) {
      sqlGetWithdraw = `SELECT
            a.w_order,
                a.created_at,
                                b.v_comment,

            c.s_status,
            d.u_firstname,
            d.u_lastname,
            f.r_name
            FROM
            withdraw a
            INNER JOIN verify b ON b.w_id = a.w_id 
            INNER JOIN status c ON c.s_id = b.s_id
            INNER JOIN user d ON d.u_id = a.u_id
            INNER JOIN room f ON f.r_id = a.r_id
            GROUP BY
            a.w_order,
                a.created_at,
                b.v_comment,
            a.r_id,
            b.s_id,
            d.u_firstname,
            d.u_lastname
                ORDER BY
               a.created_at DESC;`;
    } else {
      sqlGetWithdraw = `SELECT
	                        a.w_order,
	                        a.created_at,   b.v_comment,

	                        c.s_status,
	                        d.u_firstname,
	                        d.u_lastname,
	                        f.r_name 
                        FROM
	                        withdraw a
	                        INNER JOIN verify b ON b.w_id = a.w_id
	                        INNER JOIN status c ON c.s_id = b.s_id
	                        INNER JOIN user d ON d.u_id = a.u_id
	                        INNER JOIN room f ON f.r_id = a.r_id 
	                        WHERE a.u_id = '${payload.u_id}'
                        GROUP BY
	                        a.w_order,
	                        a.created_at,
                                            b.v_comment,

	                        a.r_id,
	                        b.s_id,
	                        d.u_firstname,
	                        d.u_lastname 
                        ORDER BY
	                        a.created_at DESC;`;
    }
    // console.log("sdsds",sqlGetWithdraw);

    const [resGetWithdraw] = await pool.query(sqlGetWithdraw);
    // console.log(resGetWithdraw);
    // 
    let w_order_inlist = ""

    for await (let i of resGetWithdraw) {
      w_order_inlist += `${i.w_order},`
    }
    if (w_order_inlist !== "") {
      w_order_inlist = w_order_inlist.slice(0, -1);
    }

    // console.log("w_order_inlist", w_order_inlist);

    let sqlListW_order = `SELECT
	a.p_code,
	a.p_name,
	b.w_total ,
	b.w_order,
	c.sp_serial
FROM
	product a
	INNER JOIN withdraw b ON b.p_id = a.p_id 
LEFT JOIN log_sub_product c ON c.p_id = a.p_id AND c.w_order = b.w_order
WHERE
	b.w_order IN (${w_order_inlist}) GROUP BY   a.p_code,
        a.p_name,
        b.w_total ,
        b.w_order,
        	c.p_id,
        c.sp_serial`;
    console.log("jjj", sqlListW_order);

    const [resListW_order] = await pool.query(sqlListW_order);

    // console.log(resGetWithdraw,resListW_order);

    // 
    return { data: resGetWithdraw, listOrder: resListW_order };
  } catch (error) {
    return { error };
  }
};

export const getWithdrawByOrderService = async (payload) => {
  try {
    console.log(payload);

    let sqlWP = `SELECT a.p_code,a.p_name,b.w_total FROM product a INNER JOIN withdraw b  ON b.p_id = a.p_id WHERE b.w_order = '${payload.w_order}'`;
    const [resWP] = await pool.query(sqlWP);
    // console.log(resGetWithdraw.length);
    return { data: resWP };
  } catch (error) {
    return { error };
  }
};

export const approveWithdrawService = async (payload) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let sqlSe = `SELECT w_id,w_total,p_id FROM withdraw WHERE w_order = '${payload.w_order}'`;
    const [resSe] = await connection.query(sqlSe);

    // console.log(resSe);

    let success = true; // Flag to track transaction success
    for (const i of resSe) {
      // console.log(i);

      let sqlChageStatusVerify = `UPDATE verify set s_id = '3' WHERE w_id = '${i.w_id}'`;
      // console.log(sqlChageStatusVerify);

      const [resChageStatusVerify] = await connection.query(
        sqlChageStatusVerify
      );
      if (!resChageStatusVerify.affectedRows) {
        success = false; // Set flag to false if update fails
        break; // Exit loop on failure
      } else {
        // console.log(i.w_total);
        let sqlChkProTotal = `SELECT p_total FROM product WHERE p_id = '${i.p_id}'`;
        const [resChkProTotal] = await connection.query(sqlChkProTotal);

        console.log(resChkProTotal[0].p_total, "-", i.w_total);
        if (resChkProTotal[0].p_total - i.w_total >= 0) {
          // console.log("up");

          let sqlUpdateProduct = `UPDATE product SET p_total =  p_total - ${i.w_total} WHERE p_id = '${i.p_id}'`;
          const [resUpdateProduct] = await connection.query(sqlUpdateProduct);
          if (!resUpdateProduct.affectedRows) {
            success = false;
            break;
          } else {
            let sqlChkProduct = `SELECT * FROM product WHERE p_id = '${i.p_id}'`;
            const [resChkProduct] = await connection.query(sqlChkProduct);
            let sqlInslogpro = `INSERT INTO log_product (u_id,p_id,log_total,log_before,log_after,log_detail ,created_at) VALUES  ('${payload.u_id
              }','${i.p_id}','${i.w_total}','${parseInt(resChkProduct[0].p_total) + parseInt(i.w_total)
              }','${resChkProduct[0].p_total}','Withdraw',NOW()); `;
            const [resInslogpro] = await connection.query(sqlInslogpro);
            if (!resInslogpro.affectedRows) {
              success = false;
              break;
            } else {
              console.log("i.serialsi.serials", payload);

              if (payload.serials.length != 0) {

                for await (let z of payload.serials) {
                  let sqlUpdateSubProduct = `UPDATE sub_product SET deleted_at = (NOW()) WHERE sp_serial = '${z.serial}'`
                  const [resUpdateSubProduct] = await connection.query(sqlUpdateSubProduct);
                  // console.log("sqlUpdateSubProduct",sqlUpdateSubProduct);

                  if (!resUpdateSubProduct.affectedRows) {
                    success = false;
                    break;
                  }

                }

              }

            }

            // console.log("resInslogpro",resInslogpro);
          }
        } else {
          console.log("under");
          success = false;
          break;
        }
      }
    }

    if (success) {
      // await connection.rollback();
      await connection.commit();
      return { code: 200, msg: "Withdraw Success" };
    } else {
      await connection.rollback(); // Rollback transaction if any operation fails
      return { code: 202, msg: "Withdraw Fail" };
    }
  } catch (error) {
    await connection.rollback(); // Rollback on error
    console.error("Transaction error:", error);
  } finally {
    connection.release(); // Always release connection
  }
};

export const unapproveWithdrawService = async (payload) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let sqlSe = `SELECT w_id,w_total,p_id FROM withdraw WHERE w_order = '${payload.w_order}'`;
    const [resSe] = await connection.query(sqlSe);
    let success = true; // Flag to track transaction success
    for (const i of resSe) {
      // console.log(i);
      let sqlChageStatusVerify = `UPDATE verify set s_id = '2' , v_comment ='${payload.v_comment}' WHERE w_id = '${i.w_id}'`;
      console.log(sqlChageStatusVerify);

      const [resChageStatusVerify] = await connection.query(
        sqlChageStatusVerify
      );
      if (!resChageStatusVerify.affectedRows) {
        success = false; // Set flag to false if update fails
        break; // Exit loop on failure
      }
    }
    if (success) {
      await connection.commit(); // Commit transaction if all operations succeed
      return { code: 200, msg: "Unapprove Success" };
      // await connection.rollback();
    } else {
      await connection.rollback(); // Rollback transaction if any operation fails
      return { code: 202, msg: "Unapprove Fail" };
    }
  } catch (error) {
    return error;
  } finally {
    console.log("release");

    connection.release();
  }
};


export const approveSomeItemWithdrawService = async (payload) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let sqlUpdateStatus = ``;
    const [resSqlUpdateStatus] = await connection.query(sqlUpdateStatus);
    console.log(resSqlUpdateStatus);


  } catch (error) {
    await connection.rollback(); // Rollback on error
    console.error("Transaction error:", error);
  } finally {
    connection.release(); // Always release connection
  }
};


export const getSerialProductService = async (payload) => {
  try {
    // console.log(payload);
    let statuss = ''
    // let sql = `SELECT * FROM sub_product WHERE sp_serial= '${payload.code}' AND deleted_at IS NULL`;
    let sql = `SELECT a.sp_id,a.p_id,a.sp_serial,a.created_at,a.deleted_at ,b.p_name, b.p_total , b.p_price FROM sub_product a INNER JOIN product b ON b.p_id = a.p_id WHERE a.sp_serial = '${payload.code}' AND a.deleted_at IS NULL`

    const [res] = await pool.query(sql);
    let res_data = []
    if (res.length == 0) {
      let sqlProduct = `SELECT * FROM product WHERE p_code = '${payload.code}' AND deleted_at IS NULL`;
      const [resProduct] = await pool.query(sqlProduct);

      if (resProduct.length != 0) {
        res_data = resProduct
        statuss = 'TBproduct'
        console.log(resProduct);
      }
      else {
        statuss = '201'
      }




    } else {
      res_data = res
      statuss = 'TBsub_product'
    }
    // console.log(res);
    return { data: res_data, TB: statuss };
  } catch (error) {
    return { error };
  }
};

export const withdrawByBarcodeService = async (payload) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // console.log("payload", payload);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    let w_order = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
    // console.log("8888", w_order);

    if (payload.TB == "TBsub_product") {

      let sql_updatesub = `UPDATE sub_product set deleted_at = NOW() WHERE sp_serial = '${payload.sp_serial}' LIMIT 1`
      const [resupdatesub] = await connection.query(sql_updatesub);
      if (resupdatesub.affectedRows !== 1) {
        throw new Error("Failed to update");
      } else {
        let sql_update_product = `UPDATE product SET p_total = p_total - 1 WHERE p_id = '${payload.p_id}' LIMIT 1`
        const [resupdate_product] = await connection.query(sql_update_product);
        if (resupdate_product.affectedRows !== 1) {
          throw new Error("Failed to update");
        } else {

          let slq_insert_withdraw = `INSERT INTO withdraw (w_order,u_id,p_id,w_total,r_id,created_at) VALUES  ('${w_order}','${payload.u_id}','${payload.p_id}','1','36',NOW())`
          const [resinsert_withdraw] = await connection.query(slq_insert_withdraw);
          if (resinsert_withdraw.affectedRows !== 1) {
            throw new Error("Failed to update");
          } else {

            console.log("resinsert_withdraw", resinsert_withdraw.insertId);
            let sql_insert_verify = `INSERT INTO verify (w_id,s_id,v_comment,u_id,created_at) VALUES   ('${resinsert_withdraw.insertId}','3','Sale','${payload.u_id}',NOW())`
            const [resinsert_verify] = await connection.query(sql_insert_verify);

            if (resinsert_verify.affectedRows !== 1) {
              throw new Error("Failed to update");
            } else {
              let sql_insert_log_subproduct = `INSERT INTO log_sub_product (w_order,sp_serial,p_id,created_at) VALUES ('${w_order}','${payload.sp_serial}','${payload.p_id}',NOW())`
              const [resinsert_log_subproduct] = await connection.query(sql_insert_log_subproduct);
              if (resinsert_log_subproduct.affectedRows !== 1) {
                throw new Error("Failed to update");
              } else {

                let sql_insert_product = `INSERT INTO log_product (u_id,p_id,log_total,log_before,log_after,log_detail,created_at) VALUES ('${payload.u_id}','${payload.p_id}','${payload.log_total}','${payload.log_before}','${payload.log_after}','Sale',NOW())`
              
                const [resinsert_product] = await connection.query(sql_insert_product);
                if (resinsert_product.affectedRows !== 1) {
                  throw new Error("Failed to update");
                }
              
              }

            }



          }





        }


      }


      console.log("TB sub");

    } else if (payload.TB == "TBproduct") {
      // console.log("TB pro");
      let sqlupdate_product = `UPDATE product SET p_total = p_total - 1 WHERE p_id = '${payload.p_id}' LIMIT 1`
      const [resupdate_product] = await connection.query(sqlupdate_product);
      if (resupdate_product.affectedRows !== 1) {
        throw new Error("Failed to update");
      } else {
        let slq_insert_withdraw_product = `INSERT INTO withdraw (w_order,u_id,p_id,w_total,r_id,created_at) VALUES  ('${w_order}','${payload.u_id}','${payload.p_id}','1','36',NOW())`
        const [resinsert_withdrawproduct] = await connection.query(slq_insert_withdraw_product);

        if (resinsert_withdrawproduct.affectedRows !== 1) {
          throw new Error("Failed to update");
        } else {
          let sql_insert_verify = `INSERT INTO verify (w_id,s_id,v_comment,u_id,created_at) VALUES   ('${resinsert_withdrawproduct.insertId}','3','Sale','${payload.u_id}',NOW())`
          const [resinsert_verify] = await connection.query(sql_insert_verify);

          if (resinsert_verify.affectedRows !== 1) {
            throw new Error("Failed to update");
          } else {
            let sql_insert_log_product = `INSERT INTO log_product (u_id,p_id,log_total,log_before,log_after,log_detail,created_at) VALUES   ('${payload.u_id}','${payload.p_id}','${payload.log_total}','${payload.log_before}','${payload.log_after}','Sale',NOW())`
            const [resinsert_log_product] = await connection.query(sql_insert_log_product);


            if (resinsert_log_product.affectedRows !== 1) {
              throw new Error("Failed to update");
            } else {
              console.log("not err");

            }
          }

        }


      }


    }






    await connection.commit();
    // await connection.rollback();
    return { msg: "Withdraw success" };
  } catch (error) {
    await connection.rollback();
    console.error("Transaction failed, rolling back:", error);
    return { error: error.message };
  } finally {
    connection.release();
  }
};

