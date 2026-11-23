import express from "express";
import { protect } from "../middleware/potect.middelware.js";
import { validateRegister } from "../middleware/validate.middeleware.js";
import {
  acceptProposalController,
  createProposalController,
  getMyProposalsController,
  getProjectProposalsController,
  rejectProposalController,
  updateProposalController,
  withdrawProposalController,
} from "../controller/proposal.controller.js";
import {
  createProposalSchema,
  updateProposalSchema,
} from "../validation/proposal.validation.js";

const router = express.Router();

router.use(protect);
router.get("/mine", getMyProposalsController);
router.get("/projects/:projectId", getProjectProposalsController);
router.post(
  "/projects/:projectId",
  validateRegister(createProposalSchema),
  createProposalController,
);
router.patch(
  "/:id",
  validateRegister(updateProposalSchema),
  updateProposalController,
);
router.delete("/:id", withdrawProposalController);
router.post("/:id/accept", acceptProposalController);
router.post("/:id/reject", rejectProposalController);

export default router;
