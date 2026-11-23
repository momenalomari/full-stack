import {
  acceptProposal,
  getProjectProposals,
  getProposalsByFreelancer,
  rejectProposal,
  submitProposal,
  updateProposal,
  withdrawProposal,
} from "../module/proposal.model.js";
import { getProjectById } from "../module/project.model.js";

const workflowStatuses = {
  PROJECT_NOT_FOUND: 404,
  PROPOSAL_NOT_FOUND: 404,
  NOT_PROJECT_OWNER: 403,
  SELF_PROPOSAL: 403,
  PROJECT_NOT_OPEN: 409,
  PROPOSAL_NOT_PENDING: 409,
};

const parsePositiveId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const sendWorkflowError = (res, error) => {
  if (workflowStatuses[error.code]) {
    return res
      .status(workflowStatuses[error.code])
      .json({ message: error.code });
  }

  if (error.code === "23505") {
    return res
      .status(409)
      .json({ message: "A proposal already exists for this project" });
  }

  console.error("Proposal operation failed:", error);
  return res.status(500).json({ message: "Internal server error" });
};

export const createProposalController = async (req, res) => {
  const project_id = parsePositiveId(req.params.projectId);
  if (!project_id)
    return res.status(400).json({ message: "Invalid project ID" });

  try {
    const proposal = await submitProposal({
      ...req.body,
      project_id,
      freelancer_id: req.user.id,
    });
    return res.status(201).json({ proposal });
  } catch (error) {
    return sendWorkflowError(res, error);
  }
};

export const getMyProposalsController = async (req, res) => {
  try {
    const proposals = await getProposalsByFreelancer(req.user.id);
    return res.status(200).json({ proposals });
  } catch (error) {
    return sendWorkflowError(res, error);
  }
};

export const getProjectProposalsController = async (req, res) => {
  const projectId = parsePositiveId(req.params.projectId);
  if (!projectId)
    return res.status(400).json({ message: "Invalid project ID" });

  try {
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.client_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const proposals = await getProjectProposals(projectId, req.user.id);
    return res.status(200).json({ proposals });
  } catch (error) {
    return sendWorkflowError(res, error);
  }
};

export const updateProposalController = async (req, res) => {
  const proposalId = parsePositiveId(req.params.id);
  if (!proposalId)
    return res.status(400).json({ message: "Invalid proposal ID" });

  try {
    const proposal = await updateProposal(proposalId, req.user.id, req.body);
    if (!proposal)
      return res
        .status(404)
        .json({ message: "Proposal not found or cannot be updated" });
    return res.status(200).json({ proposal });
  } catch (error) {
    return sendWorkflowError(res, error);
  }
};

export const withdrawProposalController = async (req, res) => {
  const proposalId = parsePositiveId(req.params.id);
  if (!proposalId)
    return res.status(400).json({ message: "Invalid proposal ID" });

  try {
    const proposal = await withdrawProposal(proposalId, req.user.id);
    if (!proposal)
      return res
        .status(404)
        .json({ message: "Proposal not found or cannot be withdrawn" });
    return res.status(200).json({ proposal });
  } catch (error) {
    return sendWorkflowError(res, error);
  }
};

export const acceptProposalController = async (req, res) => {
  const proposalId = parsePositiveId(req.params.id);
  if (!proposalId)
    return res.status(400).json({ message: "Invalid proposal ID" });

  try {
    const proposal = await acceptProposal(proposalId, req.user.id);
    return res.status(200).json({ proposal });
  } catch (error) {
    return sendWorkflowError(res, error);
  }
};

export const rejectProposalController = async (req, res) => {
  const proposalId = parsePositiveId(req.params.id);
  if (!proposalId)
    return res.status(400).json({ message: "Invalid proposal ID" });

  try {
    const proposal = await rejectProposal(proposalId, req.user.id);
    return res.status(200).json({ proposal });
  } catch (error) {
    return sendWorkflowError(res, error);
  }
};
