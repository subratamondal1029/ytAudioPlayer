import { Router } from "express";
import {
  addVideo,
  getPlaylist,
  removeVideo,
  createPlaylist,
} from "../controllers/playlist.controllers.js";
import verifyUser from "../middlewares/verifyuser.middleware.js";

const router = Router();

router.get("/:id", verifyUser, getPlaylist);
router.route("/").post(createPlaylist).put(verifyUser, addVideo);

export default router;
