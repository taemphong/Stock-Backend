import { Router } from "express";
import * as UploadImageController from "./uploadimage.controller.js"

const router = Router();



router.post("/upload-img-product",UploadImageController.uploadImageProduct)

router.post("/get-img-product",UploadImageController.getImageProductController)


export default router
