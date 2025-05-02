import { Router } from "express";

import { checkRolePermission } from '../middleware/checkRolePermission.js';
import * as userController from "./user.controller.js"


const router = Router();

router.get("/all-user",userController.getUserController)
router.get("/user/:id",userController.getUserByID)

router.post("/add-user",userController.AddUserController)
router.post("/login",userController.LoginController)
router.put("/user/:id",checkRolePermission,userController.updateUserController)

// router.post("/",userController.createUser)
// router.patch("/",userController.updateUser)

export default router