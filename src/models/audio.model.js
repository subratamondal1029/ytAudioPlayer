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
      required: true,
    },
    audioUrl: {
      type: String,
    },
    public: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Audio = model("Audio", audioSchema);
