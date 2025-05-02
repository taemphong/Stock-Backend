import exp from "constants";
import pool from "../connect.js"

export const getDatadashboardRoomService = async (payload) => {
    try {
      let filter = "";
      if (payload.w_order != "") {
        filter += `AND w.w_order LIKE '%${payload.w_order}%'`;
      }
      let sql = `
        SELECT
          r.r_id,
          r.r_name,
          pt.pt_type,
          SUM(w.w_total) AS total_withdrawn,
          SUM(p.p_total) AS total_used
        FROM
          withdraw w
        INNER JOIN
          product p ON p.p_id = w.p_id
        INNER JOIN
          verify v ON v.w_id = w.w_id
        INNER JOIN
          room r ON r.r_id = w.r_id
        INNER JOIN
          product_type pt ON pt.pt_id = p.pt_id
        WHERE
          v.s_id = 3 ${filter}
        GROUP BY
          r.r_id, pt.pt_type
      `;
      const [resData] = await pool.query(sql);
      return { data: resData };
    } catch (error) {
      return { error };
    }
  };

  export const ReportProductType = async () => {
    const sql = ` SELECT 
        pt.pt_type, 
        SUM(p.p_total) AS total_remaining
        
      FROM product p
      JOIN product_type pt ON p.pt_id = pt.pt_id
      WHERE p.deleted_at IS NULL
      GROUP BY pt.pt_type
      ORDER BY pt.pt_type;`
      const [result] = await pool.query(sql);
        return result;

  }



export const ReportAddProductService = async () => {
    try {
        let sqlReportAddProduct = `SELECT
	                    a.log_total,
	                    a.created_at,
                        b.u_prefix,
	                    b.u_firstname,
	                    b.u_lastname,
                        c.p_name,
                        c.p_details

                    FROM
	                    log_product a
	                    INNER JOIN user b ON b.u_id = a.u_id 
	                    INNER JOIN product c ON c.p_id = a.p_id
                    WHERE
	                log_detail = "Add"`;
        const [ressqlReportAddProduct] = await pool.query(sqlReportAddProduct);

        return { data: ressqlReportAddProduct }
    } catch (error) {
        return { error }
    }
}

export const ReportReserveProductService = async (payload) => {
    try {
        // let filteredResults = resTest.filter(testEntry => 
        //     resWORDER.some(order => order.w_order === testEntry.w_order)
        // );
        // console.log(filteredResults);


        let sqlWORDER = `SELECT DISTINCT w_order FROM withdraw`;
        const [resWORDER] = await pool.query(sqlWORDER);
        console.log(resWORDER);

        let sqlTest = `SELECT
	                    a.*,
	                    b.v_comment,
	                    c.s_status ,
	                    d.u_firstname,
	                    d.u_lastname
                    FROM
	                    withdraw a
	                    INNER JOIN verify b ON b.w_id = a.w_id
	                    INNER JOIN status c ON c.s_id = b.s_id 
	                    INNER JOIN user d ON d.u_id = b.u_id`

        const [resTest] = await pool.query(sqlTest);
        console.log(resTest);
        // Filter resTest based on w_order from resWORDER
        // let filteredResults = resTest.filter(testEntry => 
        //     resWORDER.some(order => order.w_order === testEntry.w_order)
        // );
        // console.log(filteredResults);


        if (resTest.length > 0) {
            for await (const [key, value] of Object.entries(resTest)) {
                console.log(value);
            }
        }

        // if (resWORDER.length > 0) {
        //     for await (const [key, value] of Object.entries(resWORDER)) {
        //         console.log(value);
        //     }
        // }


        // return { data: ressqlReportAddProduct }
    } catch (error) {
        // return { error }
    }
}


export const getMonthOfWidthdrawService = async () => {
    try {
        let sql = `SELECT DISTINCT SUBSTRING(w_order, 1, 6) AS MonthOfReport
FROM withdraw
WHERE SUBSTRING(w_order, 1, 5) = SUBSTRING(w_order, 1, 5) ;`;
        const [resData] = await pool.query(sql);

        return { data: resData }
    } catch (error) {
        return { error }
    }
}