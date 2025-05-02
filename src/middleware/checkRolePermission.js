import pool from "../connect.js"

export const checkRolePermission = async (req, res, next) => {
    const { userID } = req.body;
    console.log(req.body)
    
  
    try {
      // ดึงข้อมูล role ของผู้ใช้จากฐานข้อมูล
      const [userResult] = await pool.query("SELECT r_id,u_position FROM user WHERE u_id = ?", [userID]);
  
      if (userResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const {r_id ,u_position} = userResult[0];
  
      if(r_id !== 4 && u_position !== "superadmin"){
       return res.status(401).json({ message: "You do not have permission to update the profile!!" });
      }
      next()
    
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
