import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";

const ProjectProposals = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get(`/proposal/projects/${projectId}`)
      .then(({ data }) => {
        if (active) setProposals(data.proposals || []);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message || "Could not load proposals",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  const resolveProposal = async () => {
    if (!selected) return;
    setSaving(true);
    const { proposal, action } = selected;

    try {
      const { data } = await api.post(`/proposal/${proposal.id}/${action}`);
      setProposals((current) =>
        current.map((item) => {
          if (
            item.project_id !== proposal.project_id ||
            item.status !== "pending"
          )
            return item;
          return {
            ...item,
            status:
              item.id === proposal.id
                ? data.proposal.status
                : action === "accept"
                  ? "rejected"
                  : item.status,
          };
        }),
      );
      toast.success(
        action === "accept" ? "Proposal accepted" : "Proposal rejected",
      );
      if (action === "accept") navigate("/projects/mine");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not update proposal",
      );
    } finally {
      setSaving(false);
      setSelected(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Button onClick={() => navigate("/projects/mine")} sx={{ mb: 2 }}>
          Back to my projects
        </Button>
        <Typography variant="h4" component="h1" fontWeight={700} mb={3}>
          Project proposals
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Typography>Loading proposals...</Typography>
        ) : proposals.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
            <Typography color="text.secondary">
              No proposals have been submitted to this project yet.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {proposals.map((proposal) => (
              <Paper
                key={proposal.id}
                component="article"
                variant="outlined"
                sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  sx={{ justifyContent: "space-between" }}
                  gap={2}
                >
                  <Box>
                    <Typography variant="h6">
                      {proposal.freelancer_username}
                    </Typography>
                    <Typography color="text.secondary">
                      ${Number(proposal.price).toLocaleString()} ·{" "}
                      {proposal.delivery_days} days · {proposal.status}
                    </Typography>
                    {proposal.technologies && (
                      <Typography sx={{ mt: 1 }}>
                        {proposal.technologies}
                      </Typography>
                    )}
                    <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                      {proposal.cover_letter}
                    </Typography>
                  </Box>
                  {proposal.status === "pending" && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        color="error"
                        onClick={() =>
                          setSelected({ proposal, action: "reject" })
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() =>
                          setSelected({ proposal, action: "accept" })
                        }
                      >
                        Accept
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

      <Dialog
        open={Boolean(selected)}
        onClose={() => !saving && setSelected(null)}
      >
        <DialogTitle>
          {selected?.action === "accept"
            ? "Accept proposal?"
            : "Reject proposal?"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selected?.action === "accept"
              ? "Accepting this proposal starts the project and rejects all other pending proposals."
              : "This proposal will be marked as rejected."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={saving} onClick={() => setSelected(null)}>
            Go back
          </Button>
          <Button
            disabled={saving}
            color={selected?.action === "reject" ? "error" : "primary"}
            onClick={resolveProposal}
          >
            {saving ? "Saving..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectProposals;
