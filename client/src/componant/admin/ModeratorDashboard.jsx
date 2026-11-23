import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import api from "../../api.js";

export default function ModeratorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get("/moderator/dashboard");
      setDashboard(data.dashboard);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api
      .get("/moderator/dashboard")
      .then(({ data }) => {
        if (active) setDashboard(data.dashboard);
      })
      .catch((error) => {
        if (active) {
          toast.error(
            error.response?.data?.message || "Could not load dashboard",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const review = async (id, status) => {
    try {
      await api.patch(`/feedback/${id}/review`, { status });
      toast.success(`Feedback ${status}`);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not review feedback");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboard) {
    return <Container sx={{ py: 6 }}><Alert severity="error">Dashboard unavailable</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800}>Moderator workspace</Typography>
      <Grid container spacing={2} sx={{ my: 1 }}>
        {[
          ["Pending feedback", dashboard.stats.pending_feedback],
          ["Approved feedback", dashboard.stats.approved_feedback],
          ["Disputed projects", dashboard.stats.disputed_projects],
          ["Submitted projects", dashboard.stats.submitted_projects],
        ].map(([label, value]) => (
          <Grid key={label} size={{ xs: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h4" fontWeight={800}>{value}</Typography>
              <Typography color="text.secondary">{label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h5" fontWeight={800} sx={{ mt: 4, mb: 2 }}>
        Feedback awaiting review
      </Typography>
      {dashboard.pending_feedback.length === 0 ? (
        <Alert severity="success">No pending feedback.</Alert>
      ) : (
        <Stack spacing={2}>
          {dashboard.pending_feedback.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
              <Typography fontWeight={700}>{item.username} - rating {item.rating}/5</Typography>
              <Typography sx={{ my: 1 }}>{item.comment}</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={() => review(item.id, "approved")}>
                  Approve
                </Button>
                <Button size="small" color="error" variant="outlined" onClick={() => review(item.id, "rejected")}>
                  Reject
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
