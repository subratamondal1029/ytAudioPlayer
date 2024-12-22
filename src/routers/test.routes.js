import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ytpl from "ytpl";

const router = Router();

router.get(
  "/p",
  asyncHandler(async (req, res) => {
    const { url, limit = 100 } = req.query;
    const playlistData = await ytpl(url, { pages: Infinity, limit });

    res.json(playlistData);
  })
);

router.get(
  "/v",
  asyncHandler(async (req, res) => {
    const { url } = req.query;
    const videoDetails = await savefrom(url);
    res.json(videoDetails);
  })
);

export default router;
