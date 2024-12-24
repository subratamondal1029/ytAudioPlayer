import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Audio } from "../models/audio.model.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getHomeData = asyncHandler(async (req, res) => {
  const playlist = await Playlist.aggregate([
    {
      $match: {
        $or: [
          {
            public: true,
          },
          {
            createdBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 0,
              name: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        audioCount: {
          $size: "$audios",
        },
      },
    },
    {
      $project: {
        createdBy: 0,
        audios: 0,
      },
    },
  ]);

  const audios = await Audio.aggregate([
    {
      $match: {
        $or: [
          {
            public: true,
          },
          {
            createdBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 0,
              name: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        createdBy: 0,
      },
    },
  ]);

  const response = { playlist, audios };

  res.json(new ApiResponse("Data fetched successfully!", 200, response));
});
