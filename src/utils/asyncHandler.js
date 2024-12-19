import ApiError from "./apiError.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log("Error in asyncHandler: ", err);

    res
      .status(err.code || 500)
      .json(
        new ApiError(err.message || "Something went wrong", err.code || 500)
      );
  });
};

export default asyncHandler;
