import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import api from "../../api.js";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([api.get("/user/getusers"), api.get("/project/projects")])
      .then(([usersResponse, projectsResponse]) => {
        if (!active) return;
        setUsers(usersResponse.data.users || []);
        setProjects(projectsResponse.data.projects || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Could not load platform overview",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const activeUsers = users.filter((user) => user.is_active).length;
  const term = search.trim().toLowerCase();
  const visibleUsers = users.filter((user) =>
    `${user.username} ${user.email} ${user.role}`.toLowerCase().includes(term),
  );

  const statistics = [
    {
      label: "Total members",
      value: users.length,
      icon: <PeopleAltOutlinedIcon />,
      detail: `${activeUsers} active accounts`,
    },
    {
      label: "Open projects",
      value: projects.length,
      icon: <WorkOutlineRoundedIcon />,
      detail: "Accepting proposals",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "center" },
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="secondary.dark"
              fontWeight={800}
              letterSpacing="0.1em"
            >
              SKILLBRIDGE · ADMIN
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              sx={{ fontSize: { xs: 34, md: 44 }, mt: 0.5 }}
            >
              Platform overview
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => {
              setLoading(true);
              setError("");
              setRefreshKey((key) => key + 1);
            }}
          >
            Refresh data
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}>
            <CircularProgress aria-label="Loading platform overview" />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                mb: 5,
              }}
            >
              {statistics.map((statistic) => (
                <Paper
                  key={statistic.label}
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3 }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {statistic.label}
                      </Typography>
                      <Typography variant="h2" sx={{ fontSize: 42, mt: 0.5 }}>
                        {statistic.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {statistic.detail}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        color: "primary.main",
                        bgcolor: "primary.light",
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {statistic.icon}
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={2}
              sx={{
                justifyContent: "space-between",
                alignItems: { sm: "end" },
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h3" component="h2" sx={{ fontSize: 28 }}>
                  Members
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Account directory
                </Typography>
              </Box>
              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members"
                sx={{ width: { xs: "100%", sm: 300 } }}
                slotProps={{
                  htmlInput: { "aria-label": "Search members" },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              <Table aria-label="Platform members">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAF7" }}>
                    <TableCell>Member</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {user.username}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={user.role}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={user.is_active ? "Active" : "Inactive"}
                          color={user.is_active ? "success" : "default"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {visibleUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ py: 4, color: "text.secondary" }}
                      >
                        No members match that search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
