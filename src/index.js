import { configDotenv } from "dotenv";
import app from "./app.js";
import connentDB from "./db/index.js";

const port = process.env.PORT || 8000;

configDotenv({
  path: ".env",
});

connentDB()
  .then((res) => {
    console.log(`Database connection establisted at host: ${res}`);
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.error(`MongoDB connection error: ${err}`);
  });
