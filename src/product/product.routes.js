import { Router } from "express";
import  * as ProductController from "./product.controller.js"

const router = Router();


router.post("/add-product",ProductController.AddProductController)
router.post("/edit-product",ProductController.EditProductTypeController)
router.post("/add-producttype",ProductController.AddProductTypeController)
router.get("/get-product",ProductController.GetProductController)
router.get("/get-producttype",ProductController.GetProductTypeController)
router.post("/update-product",ProductController.UpdateProductController)
router.post("/get-product-id",ProductController.GetProductByIdController)
router.post("/update-producttype",ProductController.UpdateProductTypeController)
router.post("/delete-producttype",ProductController.DelectProductTypeController)
router.post("/delete-product",ProductController.DelectProductController)
router.get("/get-product/:barcode",ProductController.GetProductByBarcodeController)
router.post("/update-product-scanner",ProductController.UpdateProductByBarcodeController)
router.get("/get-product-type/:p_id",ProductController.GetProductTypeByIDController)
router.post("/add-group-type-product",ProductController.AddGropTypeProductController)
router.get("/get-group-type-product",ProductController.GetGroupTypeProductController)
router.post("/update-group-product",ProductController.UpdateGroupProductTypeController)
router.get("/get-serial-product/:p_id",ProductController.GetProductSerialController)
router.get("/get-producttype-all",ProductController.GetProductTypeAllController)
router.get("/get-product-have-serial",ProductController.GetProductHaveSerialController)
router.post("/update-product-serial",ProductController.UpdateProductSerialController)
router.post("/check-product-code",ProductController.checkproductCodeController)
router.get("/get-product-carts",ProductController.getProductCartsService)


export default router

