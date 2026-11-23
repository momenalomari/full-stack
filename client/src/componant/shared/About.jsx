import { Container, Paper, Stack, Typography } from "@mui/material";

export default function About() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" fontWeight={800}>About SkillBridge</Typography>
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Typography>
            SkillBridge connects clients who need digital work with freelancers who can deliver it.
          </Typography>
          <Typography>
            The platform provides project publishing, proposals, moderated feedback, proposal acceptance,
            status tracking, and role-based administration for a complete marketplace workflow.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
