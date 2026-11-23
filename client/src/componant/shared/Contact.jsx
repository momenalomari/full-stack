import { Box, Container, Paper, Stack, TextField, Typography, Button } from "@mui/material";
import toast from "react-hot-toast";

export default function Contact() {
  const submit = (event) => {
    event.preventDefault();
    toast.success("Message prepared. Deployment integration can connect this form to email support.");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h3" component="h1" fontWeight={800}>Contact</Typography>
        <Box component="form" onSubmit={submit} sx={{ mt: 3 }}>
          <Stack spacing={2}>
            <TextField label="Name" required />
            <TextField label="Email" type="email" required />
            <TextField label="Message" multiline minRows={5} required />
            <Button type="submit" variant="contained">Send message</Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
