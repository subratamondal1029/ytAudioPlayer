import express from "express";
import verifyUser from "./middlewares/verifyuser.middleware.js";
import playlistRouter from "./routers/playlist.routes.js";
import audioRouter from "./routers/audio.routes.js";
import authRouter from "./routers/auth.routes.js";
import testRouter from "./routers/test.routes.js";
import cookieParser from "cookie-parser";
import { getHomeData } from "./controllers/home.controllers.js";
import homeMiddleware from "./middlewares/home.middleware.js";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("../public"));

app.get("/api/v1/", homeMiddleware, verifyUser, getHomeData);

app.use("/api/v1/audio", audioRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/users", authRouter);
app.use("/api/v1/test", testRouter);

export default app;
