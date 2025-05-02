import { Router } from "express";
import pool from "../connect.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs"; // สำหรับลบไฟล์ชั่วคราว
import Excel from "exceljs";

const router = Router();
const upload = multer({ dest: "uploads/" });
// เส้นทางสำหรับอัปโหลดไฟล์ Excel
router.post("/import-product", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  // อ่านไฟล์ Excel
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0]; // เลือกแผ่นแรก
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet); // แปลงเป็น JSON

  const connection = await pool.getConnection();
  try {
    // เริ่มต้น Transaction
    await connection.beginTransaction();

    // วนลูปข้อมูลใน Excel และทำการ INSERT ลงในฐานข้อมูล
    for (const row of data) {
      const {
        รหัสอุปกรณ์: deviceCode,
        ชื่ออุปกรณ์: deviceName,
        จำนวนอุปกรณ์: quantity,
        รายละเอียดอุปกรณ์: details,
        ประเภทอุปกรณ์: type,
      } = row;

      let sqlChkProductType = `SELECT * FROM product_type WHERE pt_type = '${type.trim()}' AND deleted_at IS NULL`;
      const [resChkProductType] = await pool.query(sqlChkProductType);

      // console.log(resChkProductType.length);

      if (resChkProductType.length) {
        let sqlInsProduct = `INSERT INTO product (p_code,p_name,p_total,p_details,pt_id,created_at)
                VALUES(?,?,?,?,?,NOW())`;
        let [resInsProduct] = await connection.query(sqlInsProduct, [
          deviceCode,
          deviceName,
          quantity,
          details,
          resChkProductType[0].pt_id,
        ]);
        // console.log("resInsProduct", resInsProduct);
        // console.log("resInsLogUp",resInsLogUp);
        if (resInsProduct.affectedRows == 1) {
          // console.log("9999",);

          let sqlInsSuccess = `INSERT INTO log_upload_excel (p_code,p_name,p_total,p_details,pt_id,pt_type,created_at,status_upload)
                        VALUES(?,?,?,?,?,?,NOW(),'Success')`;

          // console.log("sqlInsSuccess",sqlInsSuccess);

          let [resInsLogUp] = await connection.query(sqlInsSuccess, [
            deviceCode,
            deviceName,
            quantity,
            details,
            resChkProductType[0].pt_id,
            type,
          ]);
          // console.log("resInsLogUp", resInsLogUp);

          if (resInsLogUp.affectedRows == 1) {
            let sqlInsLogProduct = `INSERT INTO log_product (u_id,p_id,log_total,log_before,log_after,created_at,log_detail)
                        VALUES (?,?,?,?,?,NOW(),?)`;

            let [resInsLogProduct] = await connection.query(sqlInsLogProduct, [
              "18",
              resInsProduct.insertId,
              quantity,
              "0",
              quantity,
              "Add",
            ]);
            console.log("resInsLogProduct", resInsLogProduct);
          }
        }
      } else {
        let sqlInsFailed = `INSERT INTO log_upload_excel (p_code,p_name,p_total,p_details,pt_type,created_at,status_upload)
                VALUES(?,?,?,?,?,NOW(),'Failed')`;
        await connection.query(sqlInsFailed, [
          deviceCode,
          deviceName,
          quantity,
          details,
          type,
        ]);
      }

      // ตรวจสอบว่าข้อมูลคอลัมน์ไม่เป็นค่าว่าง
      // if (deviceCode && deviceName && quantity && details && type) {
      //     const query = `
      //         INSERT INTO product (p_code, p_name, p_total, p_details, pt_id)
      //         VALUES (?, ?, ?, ?, ?)
      //     `;
      //     await connection.query(query, [deviceCode, deviceName, quantity, details, type]);
      // } else {
      //     console.log("Invalid data row:", row);
      // }
    }

    // Commit Transaction หลังจากการ INSERT สำเร็จ
    await connection.commit();
    // await connection.rollback();

    res.send("File processed and data uploaded to database successfully");
  } catch (error) {
    // Rollback เมื่อเกิดข้อผิดพลาด
    await connection.rollback();
    console.error("Error during transaction:", error);
    res.status(500).send("Error uploading data to the database");
  } finally {
    // ปล่อยการเชื่อมต่อหลังการทำงานเสร็จสิ้น
    connection.release();

    // ลบไฟล์ Excel ที่อัปโหลดเมื่อประมวลผลเสร็จสิ้น
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });
  }
});

router.post("/get-log-upload-excel", async (req, res) => {
  try {
    let sqlLogUpExc = `SELECT * FROM log_upload_excel`;
    const [resLogUpExc] = await pool.query(sqlLogUpExc);

    if (resLogUpExc.length > 0) {
      // If data is found, send status 200 with the data
      res.status(200).json({ data: resLogUpExc });
    } else {
      // If no data is found, send status 404
      res.status(404).send({ message: "No log entries found" });
    }
  } catch (error) {
    // If there's an error, send status 500
    console.error("Error retrieving logs:", error);
    res.status(500).send({ message: "Error retrieving log data" });
  }
});

router.post("/excel-report-withdraw", async (req, res) => {
  try {
    console.log(req.body);

    let filter = "";

    if (req.body.dateStart != "" && req.body.dateStop == "") {
      filter += `AND a.w_order LIKE '%${req.body.dateStart}%'`;
    } else if (req.body.dateStop != "" && req.body.dateStart == "") {
      filter += `AND a.w_order LIKE '%${req.body.dateStop}%'`;
    } else if (req.body.dateStart == req.body.dateStop) {
      filter += `AND a.w_order LIKE '%${req.body.dateStart}%'`;
    } else if (req.body.dateStart != req.body.dateStop) {
      filter += `AND (a.w_order BETWEEN  '${req.body.dateStart}' AND '${req.body.dateStop}')`;
    } else {
    }
    if (req.body.Status != "") {
      filter += `AND c.s_id = '${req.body.Status}' `;
    }

    if (req.body.Room != "") {
      filter += `AND  e.r_id = "${req.body.Room.r_id}" `;
    }

   let sumApprove = 0;
let sumUnApprove = 0;
let sumWait = 0;
let sumAll = 0;
let sumWithdraw = 0;

    const sql = ` SELECT
	SUBSTRING(a.w_order, 1, 6) AS period,
	d.p_name,
	a.w_total,
  c.s_id,
	c.s_status ,
	d.p_total AS TotalProductNow,
	e.r_name,
    SUM(CASE WHEN c.s_id = '3' THEN a.w_total ELSE 0 END) AS sum_approve,
    SUM(CASE WHEN c.s_id = '2' THEN a.w_total ELSE 0 END) AS sum_unapprove,
    SUM( CASE WHEN c.s_id = '1' THEN a.w_total ELSE 0 END ) AS sum_wait 
FROM
	withdraw a
	INNER JOIN verify b ON b.w_id = a.w_id
	INNER JOIN status c ON c.s_id = b.s_id
	INNER JOIN product d ON d.p_id = a.p_id
	INNER JOIN room e ON e.r_id = a.r_id
	WHERE a.deleted_at IS NULL ${filter}
  GROUP BY
    period, d.p_name, a.w_total, c.s_id, c.s_status, d.p_total, e.r_name;`;

    // console.log(sql);
    const [resData] = await pool.query(sql);
    // console.log(resData);


    if (resData.length > 0) {
      let ResPond = [];
      let row = 1;

      resData.forEach(item => {
        sumApprove += parseInt(item.sum_approve);
        sumUnApprove += parseInt(item.sum_unapprove);
        sumWait += parseInt(item.sum_wait);
        sumAll += parseInt(item.sum_approve) + parseInt(item.sum_unapprove) + parseInt(item.sum_wait);
        sumWithdraw += parseInt(item.w_total);
      });
      


      for await (const i of resData) {
        // console.log(i);
        let Objs = {
          row: row,
          period: i.period,
          p_name: i.p_name,
          w_total: i.w_total,
          s_status: i.s_status,
          total_product_now: i.TotalProductNow,
          r_name: i.r_name,
        };
        ResPond.push(Objs);
        row++;
      }
      let arrHead = [
        "ลำดับ",
        "เดือน",
        "อุปกรณ์",
        "จำนวนเบิก",
        "สถานะการเบิก",
        "จำนวนคงเหลือปัจจุบัน",
        "ห้องตรวจ",
      ];
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet("some-worksheet");
      worksheet.addRow(arrHead);
      worksheet.columns = [
        { key: "row", width: 10},
        { key: "period", width: 20 },
        { key: "p_name", width: 40 },
        { key: "w_total", width: 25 },
        { key: "s_status", width: 25 },
        { key: "total_product_now", width: 25},
        { key: "r_name", width: 15 },
      ];

      for await (const d of ResPond) {
        let arrRow = [
          d.row,
          d.period,
          d.p_name,
          d.w_total,
          d.s_status,
          d.total_product_now,
          d.r_name,
        ];
        worksheet.addRow(arrRow);
      }


      console.log(sumApprove,sumUnApprove,sumWait,sumAll,sumWithdraw);
      let arrEmpty= [
        "", "", "", "", "", "", "",
      ]
      let arrHeadSum = [
        "รวม", "จำนวนรายการทั้งหมด", "จำนวนการเบิก", "จำนวนรายการอนุมัติ", "จำนวนรายการไม่อนุมัติ", "จำนวนรายการรออนุมัติ", "",
      ]
      let arrSum = [
        "",sumAll , sumWithdraw, sumApprove, sumUnApprove, sumWait, "",
      ]
      worksheet.addRow(arrEmpty);
      worksheet.addRow(arrHeadSum);
      worksheet.addRow(arrSum);
      
      worksheet.eachRow((row, rowNumber) => {
        row.alignment = { vertical: "middle", horizontal: "center" };
        // row.fill = {
        //   type: "pattern",
        //   pattern: "solid",
        //   fgColor: { argb: "ffffff" }, // Yellow fill
        //   bgColor: { argb: "FF0000FF" }, // Blue background
        // };
      });

      res.writeHead(200, {
        "Content-Disposition": 'attachment; filename="file.xlsx"',
        "Transfer-Encoding": "chunked",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      workbook.xlsx.write(res).then(() => {
        res.end();
      });
    } else {
      res
        .status(204)
        .send({ result: false, errorMessage: "Data Not Found.", data: [] });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .send({ result: false, errorMessage: "Internal Server Error", data: [] });
  }
});

export default router;
