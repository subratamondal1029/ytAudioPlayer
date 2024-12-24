import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import ytpl from "ytpl";
import { createAudioDocument } from "../utils/index.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { Audio } from "../models/audio.model.js";
import { savefrom } from "@bochilteam/scraper-savefrom";
import { getAudio } from "../utils/index.js";

const getDurationInSeconds = (duration) => {
  const [hours, minutes, seconds] = duration.split(":");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
};

const getPlaylist = asyncHandler(async (req, res) => {
  const id = req.query?.id;

  if (!id) throw new ApiError("Id is required Required", 400);

  let playlist = await Playlist.findOne({
    $or: [
      {
        _id: id,
      },
      {
        ytId: id,
      },
    ],
  });

  if (!playlist) {
    const playlistData = await ytpl(
      `https://www.youtube.com/playlist?list=${id}`
    );

    playlist = {
      _id: playlistData?.id || crypto.randomUUID(),
      ytId: playlistData?.id || crypto.randomUUID(),
      title: playlistData?.title || "Not Available",
      description: playlistData?.description || "Not Available",
      thumbnail: playlistData?.bestThumbnail?.url,
      audios: playlistData.items.map((audio, index) => ({
        _id: audio.id || crypto.randomUUID(),
        ytId: audio.id || crypto.randomUUID(),
        index,
        title: audio?.title,
        thumbnail: audio?.bestThumbnail?.url,
        duration: parseInt(audio?.durationSec),
        url: audio?.shortUrl,
      })),
      createdBy: null,
    };
  }

  res.json(new ApiResponse("Playlist Fetched Successfully", 200, playlist));
});

const createPlaylist = asyncHandler(async (req, res) => {
  const {
    isCustom = false,
    url,
    limit = 100,
    audioUrls = [],
    title,
    description,
    isPublic = false,
  } = req.body;

  let playlistData;
  let audioPromises;

  // TODO: write thumbnail upload code in mongodb

  if (!isCustom) {
    if (!url)
      throw new ApiError(
        "Url is Required to create playlist from youtube",
        400
      );

    playlistData = await ytpl(url, { pages: Infinity, limit });
    playlistData = {
      ...playlistData,
      thumb:
        playlistData?.bestThumbnail?.url ||
        playlistData?.items?.[0]?.bestThumbnail?.url,
    };

    audioPromises = playlistData.items.map((item) =>
      createAudioDocument({
        ytId: item?.id,
        title: item?.title,
        index: parseInt(item?.index),
        thumbnail: item?.bestThumbnail?.url,
        duration: parseInt(item.durationSec),
        url: item?.shortUrl,
      })
    );
  } else {
    if (!title || !description) {
      throw new ApiError(
        "Title and Description is Requied for creating custom playlist",
        400
      );
    }

    if (audioUrls.length == 0) {
      throw new ApiError("Atleast one Audio Url required", 400);
    }

    const audioDetails = await Promise.all(
      audioUrls.map(async (url) => getAudio(url)) //TODO: change the savefrom with cutom build method
    );

    audioDetailsPromises = audioDetails.map((audio, index) =>
      createAudioDocument({
        ytId: audio?.id,
        audioUrl: audio?.url,
        duration: audio?.duration,
        title: audio?.title,
        description: audio?.description,
        thumbnail: audio?.thumbnail,
      })
    );
  }

  const audioDocuments = await Promise.all(audioPromises);

  const audios = audioDocuments
    .sort((a, b) => a.audio?.index - b.audio?.index) //Cross check for get proper indexing
    .map((a) => new mongoose.Types.ObjectId(a.audio._id));

  const creatableAudioDocument = audioDocuments
    .filter((audio) => !audio.available)
    .map((a) => a.audio);

  console.log("audio Ids: ", audios);
  console.log("Audio Documents to create: ", creatableAudioDocument);

  if (creatableAudioDocument.length > 0) {
    await Audio.insertMany(creatableAudioDocument);
  }

  const playlist = await Playlist.create({
    ytId: playlistData?.id || "",
    title: title || playlistData?.title,
    description: description || playlistData?.description,
    thumbnail: playlistData?.thumb, //TODO: add uploaded thumbnail of first video thumbnail
    audios,
    createdBy: req?.user._id,
    public: isPublic,
  });

  if (playlist && playlist.audios.length > 0) {
    res.json(new ApiResponse("Playlist created successfully!", 201, playlist));
  } else {
    throw new ApiError("Error During Playlist Creation", 500);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {});

export { createPlaylist, getPlaylist, deletePlaylist };
