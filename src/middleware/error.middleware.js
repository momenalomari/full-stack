export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON request body" });
  }

  console.error(error);
  return res.status(error.status || 500).json({
    message: error.status ? error.message : "Internal server error",
  });
};
