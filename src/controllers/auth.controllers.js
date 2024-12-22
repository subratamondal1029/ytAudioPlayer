import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { User } from "../models/users.model.js";

const generateRefreshAndAccessTokens = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  user.save({
    validateBeforeSave: false,
  });

  return { accessToken, refreshToken };
};

const getCookieExpiryMs = (expiry) => {
  const day = parseInt(expiry.split("d")[0]);
  return day * 24 * 60 * 60 * 1000;
};

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
};

const createUser = asyncHandler(async (req, res) => {
  const { username, password, name } = req.body;

  if (!password?.trim() || !username?.trim() || !name?.trim()) {
    throw new ApiError("All Fields are required", 400);
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) throw new ApiError("User already exists", 409);

  const user = await User.create({
    username: username.trim().toLowerCase(),
    password,
    name,
  });
  if (!user) throw new ApiError("Error During User Creation", 500);

  const createdUser = await User.findById(user._id).select("-password");

  res
    .status(201)
    .json(new ApiResponse("User created successfully!", 201, createdUser));
});

const checkUsernameConflict = asyncHandler(async (req, res) => {
  const username = req.query?.username;

  if (!username) throw new ApiError("Username is required", 400);

  const user = await User.findOne({ username });

  // TODO: Send 5 username suggestion
  if (!user)
    res.json(
      new ApiResponse("Username not Found", 200, { usernameAvailable: true })
    );

  throw new ApiError("Username Match Found", 409);
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!password?.trim()) throw new ApiError("Password is required", 400);
  if (!username?.trim()) throw new ApiError("Username is required", 400);

  const user = await User.findOne({ username });

  if (!user) throw new ApiError("User with this username not found", 404);

  if (!(await user.verifyPassword(password))) {
    throw new ApiError("Invalid Password", 401);
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(
    user._id
  );

  const logedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .set("Authorization", `Bearer ${accessToken}`)
    .set("x-Refresh-Token", refreshToken)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: getCookieExpiryMs(process.env.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: getCookieExpiryMs(process.env.REFRESH_TOKEN_EXPIRY),
    })
    .json(new ApiResponse("User logged in successfully!", 200, logedinUser));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json(new ApiResponse("User fetched successfully!", 200, req.user));
});

const reGenerateAccessToken = asyncHandler(async (req, res) => {
  const clientRefreshToken = req.cookies?.refreshToken;

  if (!clientRefreshToken) throw new ApiError("Invalid Refresh Token", 401);

  const decodedRefreshToken = await jwt.verify(
    clientRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!decodedRefreshToken) throw new ApiError("Invalid Refresh Token", 401);

  const user = await User.findById(decodedRefreshToken._id).select("-password");

  if (!user) throw new ApiError("User Not found", 404);
  if (!user.refreshToken == clientRefreshToken)
    throw new ApiError("Invalid Refresh Token", 401);

  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(
    user._id
  );

  res.set("Authorization", `Bearer ${accessToken}`);
  res.set("x-Refresh-Token", refreshToken);

  res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: getCookieExpiryMs(process.env.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: getCookieExpiryMs(process.env.REFRESH_TOKEN_EXPIRY),
    })
    .json(new ApiResponse("User logged in successfully!", 200, {}));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new ApiError("All fields are required", 400);

  const user = await User.findById(req.user._id);

  if (!(await user.verifyPassword(oldPassword)))
    throw new ApiError("Invalid Password", 401);

  user.password = newPassword;

  await user.save();

  res.json(new ApiResponse("Password changed successfully!", 200, {}));
});

const logoutUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  await User.updateOne(
    {
      _id,
    },
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse("User logout successfully", 200, {}));
});

export {
  createUser,
  checkUsernameConflict,
  loginUser,
  getCurrentUser,
  reGenerateAccessToken,
  changePassword,
  logoutUser,
};
