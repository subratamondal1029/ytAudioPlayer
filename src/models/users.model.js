import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    lastVisit: {
      type: Date,
      default: new Date(),
      index: true,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
