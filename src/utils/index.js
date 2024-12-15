import jwt from "jsonwebtoken";

export function createJwt(platform, userAgent, userId) {
  return jwt.sign(
    {
      platform,
      userAgent,
      userId,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "365d",
    }
  );
}
