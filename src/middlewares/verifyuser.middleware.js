import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import { User } from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyUser = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!token) throw new ApiError("Access Denied", 401);

  const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decoded._id).select("-password");

  if (!user) throw new ApiError("User not found", 404);

  req.user = user;

  next();
});

export default verifyUser;
