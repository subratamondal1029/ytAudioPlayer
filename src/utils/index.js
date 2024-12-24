import { Audio } from "../models/audio.model.js";
import youtubedl from "youtube-dl-exec";
import ApiError from "./apiError.js";

export const createAudioDocument = async (audioData) => {
  const availableAudio = await Audio.findById(audioData._id);

  if (availableAudio) return { audio: availableAudio, available: true };

  return { audio: new Audio(audioData), available: false };
};

export const getAudio = (url) => {
  return new Promise(async (res, rej) => {
    try {
      if (!url) rej(new ApiError("Url is required", 400));

      const result = await youtubedl(url, {
        format: "bestaudio", // Best audio-only format
        skipDownload: true, // Don't download, just retrieve metadata
        dumpSingleJson: true, // Output JSON data
      });

      // Extract required details
      const details = {
        id: result.id,
        title: result.title,
        description: result.description,
        thumbnail: result.thumbnail,
        duration: parseInt(result.duration), // Duration in seconds
        url: result.url,
      };

      res(details);
    } catch (error) {
      rej(new ApiError(error.meessage || "Something went wrong", 500));
    }
  });
};
