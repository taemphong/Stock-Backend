import AWS from "aws-sdk";
import pool from "../connect.js";
import message from "aws-sdk/lib/maintenance_mode_message.js";
import { keyS3 } from "../../config/config_s3.js";
import fileUpload from "express-fileupload";

// const upload = multer({ dest: "uploads/" });

AWS.config.update(keyS3);
message.suppress = true;
var s3 = new AWS.S3(); //thaimed-one

export const mainGetFileS3Service = async (req, res) => {
  // console.log(req)

  const params = {
    Bucket: `stock/product`,
    Key: req,
    Expires: 100000,
  };
  // console.log(req);
  try {
    const results = await s3.getSignedUrlPromise("getObject", params);
    console.log("mainGetFileS3Service", results);
    return { result: true, code: "200", urls3: results, errorMessage: "" };
  } catch (e) {
    return { result: false, code: "500", urls3: [], errorMessage: e };
  }
};

export const InsertFileS3Services = async (fileName, buffer, filetype) => {
  console.log(fileName, buffer, filetype);

  const params = {
    Bucket: `stock/product`,
    Key: fileName, // Use full path in Key
    Body: buffer, // File content
    ContentDisposition: "inline",
    ContentType: filetype,
  };

  try {
    const results = await s3.upload(params).promise();
    return {
      result: true,
      code: "200",
      data: results,
      errorMessage: "",
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return {
      result: false,
      code: "500",
      data: "",
      errorMessage: "Error INSERT FILE S3",
    };
  }
};

export const uploadImageProductService = async (req, res) => {
  try {
    // console.log(req);

    // const { fileName, fileType } = req.params;
    console.log("bidy", req.body);
    const base64Image = req.body.file.split(",")[1]; // Remove the data:image part
    const buffer = Buffer.from(base64Image, "base64");

    // const file = req.files?.file; // Get file content from request (ensure file middleware is in place)
    // const p_id = "215";

    const p_id = req.body.p_id; // Example Product ID

    const fileName = req.body.filename;
    const filetype = req.body.filetype;
    // if (!file) {
    //     return {
    //         status: 400,
    //         message: "File not provided",
    //     };
    // }

    // Upload file to S3
    const s3Response = await InsertFileS3Services(fileName, buffer, filetype); // Pass the file content
    if (!s3Response.result) {
      return res.status(500).send(s3Response);
    }

    // Update database

    console.log("s3Response", s3Response);
    console.log("test");

    const sql = `UPDATE product SET path_img = ? WHERE p_id = ? LIMIT 1`;
    console.log("sql", sql);

    const values = [s3Response.data.Key.split("/")[1], p_id]; // Use parameterized queries

    console.log("val", values);

    const [response] = await pool.query(sql, values);
    console.log("[response]", [response]);

    if (response.affectedRows > 0) {
      return {
        status: 200,
        data: response,
        message: "Update successful",
      };
    } else {
      return {
        status: 400,
        message: "Failed to update database",
      };
    }
  } catch (error) {
    console.error("Upload Image Product Service Error:", error);
    return {
      status: 500,
      message: "Internal Server Error",
    };
  }
};

export const getImageProductService = async (req, res) => {
  try {
    const sql = `SELECT * FROM product WHERE deleted_at IS NULL AND path_img IS NOT NULL`;
    const [response] = await pool.query(sql);
    console.log("response", response);

    // console.log("testtt",response);
    if (response) {
      const url_img_ceo = await mainGetFileS3Service(response[1].path_img);

      console.log("res32IMG", url_img_ceo);
      // res.status(200).send({ result: false, data: response[0], url_img_ceo, url_img_secretary, url_img_chairman, url_img_eobenefit, url_img_eoaccount, url_img_eocollectmoney, url_img_eoregister, url_img_treasurer,url_img_payee, errorMessage: '', code: '200' })
    }
    // else {
    //     res.status(400).send({ result: false, data: response, errorMessage: '', code: '400' })
    // }
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .send({ result: false, data: "", errorMessage: "", code: "401" });
  }
};

// export const getImageProduct = async (req, res) => {
//     try {
//         const sql = `SELECT * FROM product`
//         const response = await pool.query(sql)

//         // console.log("testtt",response);
//         if (response) {
//             const url_img_ceo = await mainGetFileS3Service(response[0].Ceo1Img);
//             const url_img_secretary = await mainGetFileS3Service(response[0].SecretaryImg);
//             const url_img_chairman = await mainGetFileS3Service(response[0].ChairmanImg);
//             const url_img_eobenefit = await mainGetFileS3Service(response[0].EOBenefitImg);
//             const url_img_eoaccount = await mainGetFileS3Service(response[0].EOAccountImg);
//             const url_img_eocollectmoney = await mainGetFileS3Service(response[0].EOCollectMoneyImg);
//             const url_img_eoregister = await mainGetFileS3Service(response[0].EORegisterImg);
//             const url_img_treasurer = await mainGetFileS3Service(response[0].TreasurerImg);
//             const url_img_payee= await mainGetFileS3Service(response[0].PayeeImg);
//             // console.log("res32IMG",results32);
//             res.status(200).send({ result: false, data: response[0], url_img_ceo, url_img_secretary, url_img_chairman, url_img_eobenefit, url_img_eoaccount, url_img_eocollectmoney, url_img_eoregister, url_img_treasurer,url_img_payee, errorMessage: '', code: '200' })
//         } else {
//             res.status(400).send({ result: false, data: response, errorMessage: '', code: '400' })
//         }
//     } catch (error) {
//         console.log(error)
//         res.status(401).send({ result: false, data: '', errorMessage: '', code: '401' })
//     }
// }
