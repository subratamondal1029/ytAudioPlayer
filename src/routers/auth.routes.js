import { Router } from "express";
import {
  createUser,
  checkUsernameConflict,
  loginUser,
  getCurrentUser,
  reGenerateAccessToken,
  changePassword,
  logoutUser,
} from "../controllers/auth.controllers.js";

import verifyUser from "../middlewares/verifyuser.middleware.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);

router
  .route("/")
  .post(createUser)
  .get(verifyUser, getCurrentUser)
  .delete(verifyUser, logoutUser);

router.patch("/change-password", verifyUser, changePassword);
router.patch("/regenerate-access-token", verifyUser, reGenerateAccessToken);

router.get("/check-username", checkUsernameConflict);

export default router;
