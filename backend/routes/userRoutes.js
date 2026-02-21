import express from "express";
import { changePasswordController, getUserProfile, landingAPI, loginController, logoutController, registerUserController, updateUserProfile } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/", landingAPI);
router.post("/login", loginController)
router.post("/register", registerUserController);
router.get("/get-user-profile/:id", getUserProfile);
router.put("udpate-user-profile/:id", updateUserProfile);
router.put("/change-password", changePasswordController);
router.get("/logout", logoutController);


export default router;
