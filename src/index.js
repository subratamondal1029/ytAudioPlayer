import express from "express";
import ytpl from "ytpl";
import { configDotenv } from "dotenv";
import { savefrom } from "@bochilteam/scraper-savefrom";

configDotenv({
  path: ".env",
});

const port = process.env.PORT;
const app = express();
// app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

const testPlaylistUrl = process.env.PLAYLIST_URL;
const testSingleVidoeUrl = process.env.SINGLE_VIDEO_URL;

app.get("/", (req, res) => {
  const userAgent = req.headers["user-agent"];
  const platform = req.headers["sec-ch-ua-platform"];

  res.end("Hello World!");
});

app.get("/playlist", async (req, res) => {
  const url = req.query?.url;
  try {
    const playlistData = await ytpl(url, { pages: 1 });
    console.log("Playlist: ", playlistData);

    const videos = playlistData.items.map((item) => ({
      id: item.id,
      title: item.title,
      index: item.index,
      thumbnail: item.bestThumbnail.url,
      duration: item.duration,
      url: item.shortUrl,
    }));

    const playlist = {
      id: playlistData.id,
      videoCount: playlistData.estimatedItemCount,
      title: playlistData.title,
      videos,
    };

    res.json({
      success: true,
      message: "Playlist fetching Successfully!",
      playlist,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Something went wrong" });
  }
});

app.get("/audio/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const videoUrl = `https://www.youtube.com/watch?v=${id}`;

    const videoDetails = await savefrom(videoUrl);

    // TODO: Add more details to audio response
    const audioUrl = videoDetails[0].url.find((url) =>
      url.name.toLowerCase().includes("audio")
    ).url;

    res.json({
      success: true,
      message: "audio file url fetched successfully!",
      audioUrl,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log("Server is running at port: ", port);
});
