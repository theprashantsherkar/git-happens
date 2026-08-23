import express from "express";
import {
    changePasswordController,
    getMe,
    getUserProfile,
    landingAPI,
    loginController,
    logoutController,
    registerUserController,
    updateUserProfile
} from "../controllers/userControllers.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", landingAPI);
router.post("/login", loginController);
router.post("/register", registerUserController);
router.get("/me", isAuthenticated, getMe);
router.get("/get-user-profile/:id", getUserProfile);
router.put("/update-user-profile", isAuthenticated, updateUserProfile);
router.put("/change-password", isAuthenticated, changePasswordController);
router.get("/logout", logoutController);

export default router;
