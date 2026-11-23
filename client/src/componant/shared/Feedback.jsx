import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import api from "../../api.js";

export default function Feedback() {
  const [approved, setApproved] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    api
      .get("/feedback/approved")
      .then(({ data }) => setApproved(data.feedback || []))
      .catch(() => setApproved([]));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/feedback", {
        rating,
        comment,
        project_id: projectId || null,
      });
      toast.success("Feedback submitted for moderation");
      setComment("");
      setProjectId("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit feedback");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800}>Community feedback</Typography>
      <Paper sx={{ p: 3, my: 3 }}>
        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <Typography fontWeight={700}>Share your experience</Typography>
            <Rating value={rating} onChange={(_event, value) => setRating(value || 1)} />
            <TextField
              label="Project ID (optional)"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              type="number"
            />
            <TextField
              label="Comment"
              multiline
              minRows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
              Submit feedback
            </Button>
          </Stack>
        </Box>
      </Paper>
      {approved.length === 0 ? (
        <Alert severity="info">No approved feedback is available yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {approved.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
              <Rating value={item.rating} readOnly />
              <Typography sx={{ mt: 1 }}>{item.comment}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.username}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
