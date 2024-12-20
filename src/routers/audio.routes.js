import { Router } from "express";
import { getAudio } from "../controllers/audio.controllers.js";

const router = Router();

router.get("/:id", getAudio);

export default router;
