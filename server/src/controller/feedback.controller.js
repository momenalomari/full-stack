import {
  createFeedback,
  getApprovedFeedback,
  getPendingFeedback,
  reviewFeedback,
} from "../module/feedback.model.js";

export const submitFeedbackController = async (req, res) => {
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();
  const projectId = req.body.project_id ? Number(req.body.project_id) : null;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  if (comment.length < 3 || comment.length > 2000) {
    return res
      .status(400)
      .json({ message: "Comment must be between 3 and 2000 characters" });
  }
  if (projectId !== null && (!Number.isSafeInteger(projectId) || projectId <= 0)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }

  try {
    const feedback = await createFeedback({
      userId: req.user.id,
      projectId,
      rating,
      comment,
    });
    return res.status(201).json({
      message: "Feedback submitted and awaiting moderation",
      feedback,
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ message: "Invalid project" });
    }
    console.error("Feedback creation failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const publicFeedbackController = async (_req, res) => {
  try {
    return res.status(200).json({ feedback: await getApprovedFeedback() });
  } catch (error) {
    console.error("Approved feedback lookup failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const pendingFeedbackController = async (_req, res) => {
  try {
    return res.status(200).json({ feedback: await getPendingFeedback() });
  } catch (error) {
    console.error("Pending feedback lookup failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const reviewFeedbackController = async (req, res) => {
  const feedbackId = Number(req.params.id);
  if (!Number.isSafeInteger(feedbackId) || feedbackId <= 0) {
    return res.status(400).json({ message: "Invalid feedback ID" });
  }
  if (!["approved", "rejected"].includes(req.body.status)) {
    return res.status(400).json({
      message: "Status must be approved or rejected",
    });
  }

  try {
    const feedback = await reviewFeedback(
      feedbackId,
      req.user.id,
      req.body.status,
    );
    if (!feedback) {
      return res.status(404).json({
        message: "Pending feedback not found",
      });
    }
    return res.status(200).json({
      message: `Feedback ${req.body.status}`,
      feedback,
    });
  } catch (error) {
    console.error("Feedback review failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
