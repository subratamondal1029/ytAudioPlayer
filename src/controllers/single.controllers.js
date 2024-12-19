import { Audio } from "../models/audio.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";

const getAudio = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let audioData;
    audioData = await Audio.findById(id);

    if (!audioData) {
      const url = `https://www.youtube.com/watch?v=${id}`;
      const videoDetails = await savefrom(videoUrl);
      const audioUrl = videoDetails[0].url.find((url) =>
        url.name.toLowerCase().includes("audio")
      );
      audioData = audioUrl;
    }

    res.json(new ApiResponse("Audio fetched successfully!", 200, audioData));
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
});

export { getAudio };
