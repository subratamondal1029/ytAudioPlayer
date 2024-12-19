import { Router } from "express";
import { getAudio } from "../controllers/single.controllers.js";

const router = Router();

router.get("/:id", getAudio);

export default router;
