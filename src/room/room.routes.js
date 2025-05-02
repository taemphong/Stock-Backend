import { Router } from "express";
import * as RoomController from "./room.controller.js"


const router = Router();


router.post("/add-room",RoomController.AddRoomController)
router.get("/get-room",RoomController.GetRoomController)
router.post("/update-room",RoomController.UpdateRoomController)
router.post("/delete-room",RoomController.DelectRoomeController)
export default router