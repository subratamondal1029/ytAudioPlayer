import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ytpl from "ytpl";
import ApiError from "../utils/apiError.js";
import { getAudio } from "../utils/index.js";
import ApiResponse from "../utils/apiResponse.js";

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
    console.log("url: ", url);

    if (!url) throw new ApiError("Url is required", 400);

    const videoDetails = await getAudio(url);

    res.json(new ApiResponse("Audio fetched successfully!", 200, videoDetails));
  })
);

export default router;
