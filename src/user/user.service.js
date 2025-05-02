import pool from "../connect.js";

export const getUser = async (req, res) => {
  try {
    let sql = `SELECT * FROM user`;
    const [A] = await pool.query(sql);
    console.log(A);
    return { code: "200", data: A };
  } catch (error) {
    return error;
  }
};

export const registerUser = async (payload) => {
  try {
    // console.log(payload);
    let AddUser = `INSERT INTO user (u_username,u_password,u_prefix,u_firstname,u_lastname,u_email,u_position,r_id,created_at) VALUES  ('${payload.username}',MD5('${payload.password}'),'${payload.prefix}','${payload.firstname}','${payload.lastname}','${payload.email}', '${payload.position}','1',NOW())`;
    const resRegis = await pool.query(AddUser);
    if (resRegis.affectedRows) {
      return { code: "200" };
    }
  } catch (error) {
    return error;
  }
};

export const login = async (payload) => {
  try {
    let sqlLogin = `SELECT * FROM user WHERE u_username = '${payload.username}' AND u_password = '${payload.password}'`;
    const [resLogin] = await pool.query(sqlLogin);
    // console.log(resLogin);
    if (resLogin.length === 1) {
      return { code: 200, data: resLogin[0] };
    } else {
      return { code: 201 };
    }
    // return { code: '200', data: A }
  } catch (error) {
    return error;
  }
};

export const userUpdateProfile = async (payload, userID) => {
  try {
    const { u_username, u_firstname, u_lastname, u_email, u_position } =
      payload;

    let updates = [];
    let values = [];

    if (u_username) {
      updates.push("u_username = ?");
      values.push(u_username);
    }
    if (u_firstname) {
      updates.push("u_firstname = ?");
      values.push(u_firstname);
    }
    if (u_lastname) {
      updates.push("u_lastname = ?");
      values.push(u_lastname);
    }
    if (u_email) {
      updates.push("u_email = ?");
      values.push(u_email);
    }
    if (u_position) {
      // ดึง role_id ตาม u_position
      const [roleResult] = await pool.query(
        "SELECT r_id FROM role WHERE r_name = ?",
        [u_position]
      );

      if (roleResult.length > 0) {
        const newRoleId = roleResult[0].r_id;

        // อัปเดต position ด้วย role_id ที่ดึงมา
        updates.push("r_id = ?");
        values.push(newRoleId);

        // อัปเดตตำแหน่งที่ตรงกับ role_id ที่ดึงมา
        updates.push("u_position = ?");
        values.push(u_position);
      } else {
        return { code: 400, message: "Role not found!" };
      }
    }
    if (updates.length === 0) {
        return { code: 400, message: "No fields to update" };
      }
      values.push(userID);
  
      let sql = `UPDATE user SET ${updates.join(",")} WHERE u_id =?`;
  
      const [res] = await pool.query(sql, values);
  
      if (res.affectedRows === 0) {
        return { code: 400, message: "User not found!" };
      }
  
      return { code: 200, message: "User updated successfully" };
    } catch (error) {
      console.log(error);
      return { code: 500, message: "Internal server config" };
    }
  };

  

export const getUserByID = async(payload)=>{
    const userID = payload

    const sql = `SELECT  u_id,u_username,u_prefix,u_firstname,u_lastname,u_email,u_position FROM user WHERE u_id= ?`;
    try {
        // ใช้ pool.query เพื่อส่ง SQL query ไปยังฐานข้อมูล
        const [rows] = await pool.query(sql, [userID]);

        // ตรวจสอบว่าพบผู้ใช้หรือไม่
        if (rows.length === 0) {
            return { code: 404, message: "User not found!" };
        }
        console.log(rows[0])

        // ส่งข้อมูลผู้ใช้กลับ
        return { code: 200, message: rows[0] };
    } catch (error) {
        console.error(error);
        return { code: 500, message: "Internal server error" };
    }
}
