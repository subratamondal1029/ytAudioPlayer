import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

export default async function verifyUser(req, res, next) {
  try {
    const userAgent = req.headers["user-agent"];
    const platform = req.headers["sec-ch-ua-platform"];

    const token = req.cookies.token;
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.platform !== platform || decoded.userAgent !== userAgent) {
      res.status(403).json(new ApiError("User Not Match", 403));
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json(new ApiError("invalid token", 401));
  }
}
