import { Router } from "express";
import * as reportController   from "./report.controller.js"



const router = Router();

router.get("/report-add-product", reportController.ReportController);
router.post("/report-reserve", reportController.ReportReserveController);
router.get("/peiod-widthdraw", reportController.getMonthOfWidthdrawController);

//***************Intern************************************* */
router.get("/report-room-withdraw", reportController.reportroomwithdrawController);
router.post("/report-product-type", reportController.ReportProductTypeController);
router.post("/report-withdraw-room", reportController.reportroomwithdrawController);

export default router;