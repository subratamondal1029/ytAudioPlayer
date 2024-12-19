import mongoose from "mongoose";

export default function connentDB() {
  return new Promise(async (res, rej) => {
    try {
      const response = await mongoose.connect(
        `${process.env.MONGODB_URI}/${process.env.PROJECT_NAME}`
      );
      res(response.connection.host);
    } catch (error) {
      rej(error);
    }
  });
}
