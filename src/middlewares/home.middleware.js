import asyncHandler from "../utils/asyncHandler.js";

const homeMiddleware = asyncHandler((req, _, next) => {
  let skipVerification = false;

  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!token) {
    skipVerification = true;
  }

  req.skipVerification = skipVerification;
  next();
});

export default homeMiddleware;
