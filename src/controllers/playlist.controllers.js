import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Audio } from "../models/audio.model.js";
import { savefrom } from "@bochilteam/scraper-savefrom";
import ytpl from "ytpl";

const getDurationInSeconds = (duration) => {
  const [hours, minutes, seconds] = duration.split(":");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
};

const createAudio = async (audioData) => {
  const audio = Audio.findById(audioData._id);
  if (audio) return Promise.resolve(audio);

  Promise.resolve(Audio.create(audioData)).catch((error) => {
    throw new ApiError(error.message || "Error During Audio Creation", 500);
  });
};

const getPlaylist = asyncHandler(async (req, res) => {
  const id = req.params?.id;
  try {
    if (!id) throw new ApiError("Id is Required", 400);

    const playlist = await Playlist.findById(id);

    console.log("playlist Data: ", playlist);

    res.json(new ApiResponse("Playlist fetched successfully!", 200, playlist));
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
});

const addVideo = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.body;

    const playlistData = await Playlist.findById(playlistId);
    if (!playlistData) {
      throw new ApiError("Playlist not found", 404);
    }
    const ifAudioExists = playlistData.audios.some(
      (audio) => audio._id == videoId
    );

    if (ifAudioExists) {
      throw new ApiError("Audio already exists in playlist", 409);
    }

    let audioData = await Audio.findById(videoId);

    if (!audioData) {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const videoDetails = await savefrom(url);
      const audioUrl = videoDetails[0].url.find((url) =>
        url.name.toLowerCase().includes("audio")
      ).url;

      audioData = await createAudio({
        _id: videoId,
        title: videoDetails[0].meta.title,
        thumbnail: videoDetails[0].thumb,
        duration: getDurationInSeconds(videoDetails[0].meta.duration),
        url: audioUrl,
      });

      if (!audioData) {
        throw new ApiError("Audio not found", 404);
      } else {
        playlistData.audios.push(audioData._id);
        await playlistData.save();
      }
    }
    res.json(new ApiResponse("Audio fetched successfully!", 200, audioData));
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
});

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const url = req.body?.url;

    const playlistData = await ytpl(url, { pages: 1 });
    console.log("Playlist: ", playlistData);

    const audioPromises = playlistData.items.map((item) =>
      createAudio({
        _id: item.id,
        title: item.title,
        index: parseInt(item.index),
        thumbnail: item.bestThumbnail.url,
        duration: getDurationInSeconds(item.duration),
        url: item.shortUrl,
      })
    );

    const audios = await (
      await Promise.all(audioPromises)
    ).map((audio) => audio._id);

    const playlist = await Playlist.create({
      _id: playlistData.id,
      title: playlistData.title,
      description: playlistData.description,
      thumbnail: playlistData.bestThumbnail.url,
      audios,
      createdBy: req.userId,
    });
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
});

const removeVideo = asyncHandler(async (req, res) => {});

export { createPlaylist, getPlaylist, addVideo, removeVideo };
