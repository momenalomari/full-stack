import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";

const MyProposals = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/proposal/mine")
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
  }, []);

  const handleWithdraw = async (proposalId) => {
    try {
      await api.delete(`/proposal/${proposalId}`);
      setProposals((current) =>
        current.map((proposal) =>
          proposal.id === proposalId
            ? { ...proposal, status: "withdrawn" }
            : proposal,
        ),
      );
      toast.success("Proposal withdrawn");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not withdraw proposal",
      );
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
        <Button onClick={() => navigate("/dashboard")} sx={{ mb: 2 }}>
          Back to projects
        </Button>
        <Typography variant="h4" component="h1" fontWeight={700} mb={3}>
          My proposals
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
              You have not submitted any proposals yet.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {proposals.map((proposal) => (
              <Paper
                key={proposal.id}
                variant="outlined"
                sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  gap={2}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography variant="h6">
                      {proposal.project_title}
                    </Typography>
                    <Typography color="text.secondary">
                      ${Number(proposal.price).toLocaleString()} ·{" "}
                      {proposal.delivery_days} days · {proposal.status}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      {proposal.cover_letter}
                    </Typography>
                  </Box>
                  {proposal.status === "pending" && (
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => handleWithdraw(proposal.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default MyProposals;
