import ApiError from "./apiError.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log("Error in asyncHandler: ", err);

    let errorCode;

    if (err.code && typeof err.code === "number" && err.code < 600) {
      errorCode = err.code;
    } else errorCode = 500;

    res
      .status(errorCode || 500)
      .json(
        new ApiError(
          err.message || "Something went wrong",
          errorCode || 500,
          err.errors || []
        )
      );
  });
};

export default asyncHandler;
