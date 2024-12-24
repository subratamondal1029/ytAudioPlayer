import { Router } from "express";
import { createPlaylist } from "../controllers/playlist.controllers.js";
import verifyUser from "../middlewares/verifyuser.middleware.js";

const router = Router();

// router.get("/:id", verifyUser, getPlaylist);
router.route("/").post(verifyUser, createPlaylist);

export default router;
