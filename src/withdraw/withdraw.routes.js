import { Router } from "express";
import * as withdrawController from "./withdraw.controller.js";

const router = Router();

router.post("/add-withdraw", withdrawController.AddWithdrawController);
router.post("/get-withdraw", withdrawController.GetWithdrawController);
router.post(
  "/get-withdraw-order-id",
  withdrawController.GetWithdrawOrderIDController
);

router.post("/approve-withdraw", withdrawController.ApproveWithdrawController);
router.post("/unapprove-withdraw", withdrawController.UnapproveWithdrawController);
router.post("/approve-some-item-withdraw", withdrawController.ApproveSomeItemWithdrawController);

router.post("/get-serial-product", withdrawController.GetSerialProductController);
router.post("/add-withdraw-by-barcode", withdrawController.AddWithdrawByBarcodeController);


export default router;
