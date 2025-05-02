import pool from "../connect.js"

export const addRoomService = async (payload) => {

    try {

        let sqlChkRoomName = `SELECT REPLACE(r_name, ' ', '')  FROM room  WHERE r_name = '${payload.r_name}' AND deleted_at IS NULL`
        const [resChChkRoomName] = await pool.query(sqlChkRoomName);
        console.log(resChChkRoomName.length);

        if (resChChkRoomName.length == 0) {
            let sqlAddRoom = `INSERT INTO room (r_name,created_at) VALUES  ('${payload.r_name}',NOW())`;
            const [resAddRoom] = await pool.query(sqlAddRoom);
            if (resAddRoom.affectedRows == 1) {
                return { code: 200, msg: "success" };
            } else {
                return { code: 201, msg: "failed" };
            }
        } else {
            return { code: 202, msg: "failed Duplicate r_name" };
        }

    } catch (error) {
        return error
    }

}



export const getRoomService = async () => {
    try {
        let sqlGetRoom = `SELECT * FROM room WHERE deleted_at IS NULL`;
        const [resGetRoom] = await pool.query(sqlGetRoom);
        // console.log(resGetRoom);
        return { data: resGetRoom }
    } catch (error) {
        return { error }
    }
}


export const updateRoomService = async (payload) => {

    try {

        let sqlUpdateRoom = `UPDATE room SET r_name = '${payload.r_name}' WHERE r_id = ${payload.r_id}`;
        const [resUpdateRoom] = await pool.query(sqlUpdateRoom);
        if (resUpdateRoom.affectedRows == 1) {

            return { code: 200, msg: "success" };
        } else {
            return { code: 201, msg: "failed" };
        }
    } catch (error) {
        return error
    }
}


export const deleteRoomService = async (payload) => {

    try {

        let sqlDelectRoom = `UPDATE room SET deleted_at  = NOW() WHERE r_id = ${payload.r_id} LIMIT 1`;
        const [resDelectRoom] = await pool.query(sqlDelectRoom);
        if (resDelectRoom.affectedRows == 1) {
            return { code: 200, msg: "success" };
        } else {
            return { code: 201, msg: "failed" };
        }
    } catch (error) {
        return error
    }

}
