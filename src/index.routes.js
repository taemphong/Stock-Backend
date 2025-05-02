import { Router } from "express";
import userRouter from "./user/user.routes.js"
import productRouter from "./product/product.routes.js"
import roomRouter from "./room/room.routes.js"
import withdrawRouter from "./withdraw/withdraw.routes.js"
import reportRouter from "./report/report.routes.js"
import excelRouter from "./excel/excel.routes.js"
import uploadimage from "./controllerUploadImg/uploadimage.routes.js"

const router = Router();

router.use("/user",userRouter)
router.use("/product",productRouter)
router.use("/room",roomRouter)
router.use("/withdraw",withdrawRouter)
router.use("/report",reportRouter)
router.use("/excel",excelRouter)
router.use("/imgupload",uploadimage)


export default router