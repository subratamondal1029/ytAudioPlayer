import express from "express";
import verifyUser from "./middlewares/verifyuser.middleware.js";
import playlistRouter from "./routers/playlist.routes.js";
import singleRouter from "./routers/single.routes.js";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("../public"));

app.get("/", verifyUser, (req, res) => {
  console.log(req.userId);
  res.end("Hello World!");
});

app.use("/audio", singleRouter);
app.use("/playlist", playlistRouter);

export default app;
