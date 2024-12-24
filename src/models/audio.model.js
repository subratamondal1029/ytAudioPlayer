import { Schema, model } from "mongoose";

const audioSchema = new Schema(
  {
    ytId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    index: {
      type: Number,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Audio = model("Audio", audioSchema);
