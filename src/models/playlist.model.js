import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    ytId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    audios: [
      {
        type: Schema.Types.ObjectId,
        ref: "Audio",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    public: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Playlist = model("Playlist", playlistSchema);
