import { generateAgentReply } from "../module/agent.model.js";

const httpStatusByCode = {
  AI_NOT_CONFIGURED: 503,
  PROJECT_NOT_FOUND: 404,
  SELF_PROPOSAL: 403,
  PROJECT_NOT_OPEN: 409,
  AI_EMPTY_RESPONSE: 502,
};

export const generateAgentReplyController = async (req, res) => {
  if (req.body.mode === "admin_insights" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const reply = await generateAgentReply({
      mode: req.body.mode,
      message: req.body.message,
      projectId: req.body.project_id,
      skills: req.body.skills,
      user: req.user,
    });

    return res.status(200).json({ reply, mode: req.body.mode });
  } catch (error) {
    const status = httpStatusByCode[error.code];
    if (status) return res.status(status).json({ message: error.code });

    console.error("Gemini request failed:", error.name || "UnknownError");
    return res.status(502).json({ message: "AI_PROVIDER_ERROR" });
  }
};
