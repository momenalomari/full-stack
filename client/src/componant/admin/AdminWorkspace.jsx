import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import api from "../../api.js";
import toast from "react-hot-toast";
import { useAuthContext } from "../Hooks/useAuthContext.js";

const pageSize = 8;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const statusColor = (status) => {
  if (["active", "open", "accepted", "completed"].includes(status))
    return "success";
  if (
    ["pending", "submitted", "in_progress", "revision_requested"].includes(
      status,
    )
  )
    return "warning";
  if (
    ["inactive", "cancelled", "rejected", "withdrawn", "disputed"].includes(
      status,
    )
  )
    return "default";
  return "primary";
};

const AdminWorkspace = () => {
  const { user: currentAdmin } = useAuthContext();
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState("members");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [memberToDeactivate, setMemberToDeactivate] = useState(null);
  const [savingMember, setSavingMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    api
      .get("/admin/dashboard")
      .then(({ data }) => {
        if (active) setDashboard(data.dashboard);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message || "Could not load admin data",
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

  const stats = dashboard?.stats;
  const rows =
    tab === "members" ? dashboard?.users || [] : dashboard?.[tab] || [];
  const term = search.trim().toLowerCase();
  const filteredRows = rows.filter((record) => {
    const searchable =
      tab === "members"
        ? `${record.username} ${record.email} ${record.role}`
        : tab === "projects"
          ? `${record.title} ${record.client_name} ${record.client_email} ${record.category_name}`
          : `${record.project_title} ${record.client_name} ${record.client_email} ${record.freelancer_name} ${record.freelancer_email}`;
    const matchesSearch = searchable.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" ||
      (tab === "members"
        ? statusFilter === record.role ||
          statusFilter === (record.is_active ? "active" : "inactive")
        : statusFilter === record.status);
    return matchesSearch && matchesStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const statusOptions =
    tab === "members"
      ? ["all", "active", "inactive", "admin", "user"]
      : tab === "projects"
        ? [
            "all",
            "open",
            "in_progress",
            "submitted",
            "revision_requested",
            "completed",
            "cancelled",
            "disputed",
          ]
        : ["all", "pending", "accepted", "rejected", "withdrawn"];

  const selectTab = (_event, nextTab) => {
    setTab(nextTab);
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const openMemberEditor = (member) => {
    setEditMember({
      id: member.id,
      username: member.username,
      email: member.email,
      role: member.role,
      is_active: member.is_active,
    });
  };

  const saveMemberChanges = async () => {
    if (!editMember) return;
    setSavingMember(true);
    setError("");

    try {
      await api.put(`/user/updateuser/${editMember.id}`, {
        username: editMember.username,
        email: editMember.email,
        role: editMember.role,
        is_active: editMember.is_active,
      });
      toast.success("Member details updated");
      setEditMember(null);
      setLoading(true);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not update member",
      );
    } finally {
      setSavingMember(false);
    }
  };

  const deactivateMember = async () => {
    if (!memberToDeactivate) return;
    setSavingMember(true);
    setError("");

    try {
      await api.delete(`/user/deleteuser/${memberToDeactivate.id}`);
      toast.success("Member account deactivated; history was preserved");
      setMemberToDeactivate(null);
      setSelectedRecord(null);
      setLoading(true);
      setRefreshKey((key) => key + 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not deactivate member",
      );
    } finally {
      setSavingMember(false);
    }
  };

  const statistics = [
    {
      label: "Members",
      value: stats?.total_users ?? 0,
      detail: `${stats?.active_users ?? 0} active · ${stats?.inactive_users ?? 0} inactive`,
      icon: <PeopleAltOutlinedIcon />,
    },
    {
      label: "Clients",
      value: stats?.active_clients ?? 0,
      detail: "Members with a published project",
      icon: <WorkOutlineRoundedIcon />,
    },
    {
      label: "Freelancers",
      value: stats?.active_freelancers ?? 0,
      detail: "Members who submitted a proposal",
      icon: <PeopleAltOutlinedIcon />,
    },
    {
      label: "Projects",
      value: stats?.total_projects ?? 0,
      detail: `${stats?.open_projects ?? 0} open · ${stats?.in_progress_projects ?? 0} in progress`,
      icon: <WorkOutlineRoundedIcon />,
    },
    {
      label: "Proposals",
      value: stats?.total_proposals ?? 0,
      detail: `${stats?.pending_proposals ?? 0} waiting for review`,
      icon: <ForumOutlinedIcon />,
    },
    {
      label: "Active budget",
      value: `$${Number(stats?.active_budget ?? 0).toLocaleString()}`,
      detail: "Open and active projects",
      icon: <WorkOutlineRoundedIcon />,
    },
  ];

  const details = selectedRecord
    ? tab === "members"
      ? [
          ["Member", selectedRecord.username],
          ["Email", selectedRecord.email],
          ["Role", selectedRecord.role],
          ["Account status", selectedRecord.is_active ? "Active" : "Inactive"],
          ["Approval status", selectedRecord.status],
          ["Client projects", selectedRecord.client_project_count],
          ["Freelancer proposals", selectedRecord.freelancer_proposal_count],
          ["Joined", formatDate(selectedRecord.created_at)],
          ["Last updated", formatDate(selectedRecord.updated_at)],
        ]
      : tab === "projects"
        ? [
            ["Project", selectedRecord.title],
            ["Client", selectedRecord.client_name],
            ["Client email", selectedRecord.client_email],
            ["Category", selectedRecord.category_name || "—"],
            ["Status", selectedRecord.status],
            ["Budget", `$${Number(selectedRecord.budget).toLocaleString()}`],
            ["Deadline", formatDate(selectedRecord.deadline)],
            ["Proposals", selectedRecord.proposal_count],
            ["Created", formatDate(selectedRecord.created_at)],
            ["Description", selectedRecord.description],
          ]
        : [
            ["Project", selectedRecord.project_title],
            ["Client", selectedRecord.client_name],
            ["Client email", selectedRecord.client_email],
            ["Freelancer", selectedRecord.freelancer_name],
            ["Freelancer email", selectedRecord.freelancer_email],
            ["Status", selectedRecord.status],
            ["Price", `$${Number(selectedRecord.price).toLocaleString()}`],
            ["Delivery days", selectedRecord.delivery_days],
            ["Technologies", selectedRecord.technologies || "—"],
            ["Cover letter", selectedRecord.cover_letter],
            ["Submitted", formatDate(selectedRecord.created_at)],
          ]
    : [];

  const tableHeaders =
    tab === "members"
      ? ["Member", "Role", "Projects", "Proposals", "Status", "Joined", ""]
      : tab === "projects"
        ? ["Project", "Client", "Category", "Budget", "Proposals", "Status", ""]
        : [
            "Project",
            "Freelancer",
            "Client",
            "Price",
            "Delivery",
            "Status",
            "",
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
            mb: 3,
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
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Members, project activity, and proposal decisions in one place.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={() => window.location.assign("/assistant")}
            >
              AI assistant
            </Button>
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
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
            <CircularProgress aria-label="Loading admin dashboard" />
          </Box>
        ) : dashboard ? (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
                mb: 3,
              }}
            >
              {statistics.map((statistic) => (
                <Paper
                  key={statistic.label}
                  variant="outlined"
                  sx={{ p: 2.25, borderRadius: 3 }}
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
                      <Typography
                        variant="h2"
                        sx={{ fontSize: { xs: 34, md: 40 }, mt: 0.75 }}
                      >
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
                        width: 40,
                        height: 40,
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

            <Paper
              variant="outlined"
              sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, mb: 3 }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={800}
                sx={{ mb: 1.25 }}
              >
                Project pipeline
              </Typography>
              <Stack direction="row" gap={1} sx={{ flexWrap: "wrap" }}>
                {[
                  ["Open", stats.open_projects],
                  ["In progress", stats.in_progress_projects],
                  ["Submitted", stats.submitted_projects],
                  ["Revision", stats.revision_projects],
                  ["Completed", stats.completed_projects],
                  ["Cancelled", stats.cancelled_projects],
                  ["Disputed", stats.disputed_projects],
                ].map(([label, value]) => (
                  <Chip
                    key={label}
                    variant="outlined"
                    label={`${label} · ${value}`}
                  />
                ))}
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ borderRadius: 3, overflow: "hidden" }}
            >
              <Box
                sx={{
                  px: { xs: 1.5, md: 2.5 },
                  pt: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Tabs
                  value={tab}
                  onChange={selectTab}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="Admin data sections"
                >
                  <Tab
                    value="members"
                    label={`Clients & freelancers (${dashboard.users.length})`}
                  />
                  <Tab
                    value="projects"
                    label={`Projects (${dashboard.projects.length})`}
                  />
                  <Tab
                    value="proposals"
                    label={`Proposals (${dashboard.proposals.length})`}
                  />
                </Tabs>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={1.5}
                sx={{ p: 2, justifyContent: "space-between" }}
              >
                <TextField
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder={
                    tab === "members"
                      ? "Search name, email, role"
                      : tab === "projects"
                        ? "Search project, client, category"
                        : "Search project, client, freelancer"
                  }
                  sx={{ width: { xs: "100%", sm: 390 } }}
                  slotProps={{
                    htmlInput: { "aria-label": `Search ${tab}` },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <FormControl sx={{ width: { xs: "100%", sm: 230 } }}>
                  <InputLabel id="admin-status-filter-label">
                    Filter status
                  </InputLabel>
                  <Select
                    labelId="admin-status-filter-label"
                    value={statusFilter}
                    label="Filter status"
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(1);
                    }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option === "all"
                          ? "All statuses"
                          : option.replaceAll("_", " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <TableContainer sx={{ maxHeight: 560 }}>
                <Table
                  stickyHeader
                  size="small"
                  aria-label={`${tab} administration table`}
                >
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            bgcolor: "#F8FAF7",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRows.map((record) => (
                      <TableRow key={record.id} hover>
                        {tab === "members" ? (
                          <>
                            <TableCell>
                              <Typography fontWeight={700}>
                                {record.username}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {record.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={record.role}
                              />
                            </TableCell>
                            <TableCell>{record.client_project_count}</TableCell>
                            <TableCell>
                              {record.freelancer_proposal_count}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                color={record.is_active ? "success" : "default"}
                                label={record.is_active ? "Active" : "Inactive"}
                              />
                            </TableCell>
                            <TableCell>
                              {formatDate(record.created_at)}
                            </TableCell>
                          </>
                        ) : tab === "projects" ? (
                          <>
                            <TableCell>
                              <Typography fontWeight={700}>
                                {record.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(record.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{record.client_name}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {record.client_email}
                              </Typography>
                            </TableCell>
                            <TableCell>{record.category_name || "—"}</TableCell>
                            <TableCell>
                              ${Number(record.budget).toLocaleString()}
                            </TableCell>
                            <TableCell>{record.proposal_count}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                color={statusColor(record.status)}
                                label={record.status.replaceAll("_", " ")}
                              />
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>
                              <Typography fontWeight={700}>
                                {record.project_title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(record.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{record.freelancer_name}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {record.freelancer_email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{record.client_name}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {record.client_email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              ${Number(record.price).toLocaleString()}
                            </TableCell>
                            <TableCell>{record.delivery_days} days</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                color={statusColor(record.status)}
                                label={record.status}
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.25}
                            sx={{
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}
                          >
                            <Button
                              size="small"
                              aria-label={`View ${tab} details`}
                              startIcon={<VisibilityOutlinedIcon />}
                              onClick={() => setSelectedRecord(record)}
                            >
                              Details
                            </Button>
                            {tab === "members" && (
                              <>
                                <Tooltip title="Edit member">
                                  <span>
                                    <IconButton
                                      size="small"
                                      aria-label={`Edit ${record.username}`}
                                      disabled={
                                        String(record.id) ===
                                        String(currentAdmin?.id)
                                      }
                                      onClick={() => openMemberEditor(record)}
                                    >
                                      <EditOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Deactivate account">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      aria-label={`Deactivate ${record.username}`}
                                      disabled={
                                        !record.is_active ||
                                        String(record.id) ===
                                          String(currentAdmin?.id)
                                      }
                                      onClick={() =>
                                        setMemberToDeactivate(record)
                                      }
                                    >
                                      <PersonRemoveOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {visibleRows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={tableHeaders.length}
                          align="center"
                          sx={{ py: 5, color: "text.secondary" }}
                        >
                          No records match those filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={1}
                sx={{
                  p: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {filteredRows.length
                    ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredRows.length)} of ${filteredRows.length}`
                    : "0 records"}
                </Typography>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_event, value) => setPage(value)}
                  size="small"
                  color="primary"
                />
              </Stack>
            </Paper>
          </>
        ) : null}
      </Container>

      <Dialog
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {tab === "members"
            ? "Member details"
            : tab === "projects"
              ? "Project details"
              : "Proposal details"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {details.map(([label, value]) => (
              <Box key={label}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {value ?? "—"}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          {tab === "members" && selectedRecord && (
            <>
              <Button
                disabled={
                  String(selectedRecord.id) === String(currentAdmin?.id)
                }
                onClick={() => {
                  openMemberEditor(selectedRecord);
                  setSelectedRecord(null);
                }}
              >
                Edit member
              </Button>
              <Button
                color="error"
                disabled={
                  !selectedRecord.is_active ||
                  String(selectedRecord.id) === String(currentAdmin?.id)
                }
                onClick={() => {
                  setMemberToDeactivate(selectedRecord);
                  setSelectedRecord(null);
                }}
              >
                Deactivate
              </Button>
            </>
          )}
          <Button onClick={() => setSelectedRecord(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editMember)}
        onClose={() => !savingMember && setEditMember(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit member</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Full name"
              value={editMember?.username || ""}
              onChange={(event) =>
                setEditMember((member) => ({
                  ...member,
                  username: event.target.value,
                }))
              }
              required
              fullWidth
            />
            <TextField
              label="Email address"
              type="email"
              value={editMember?.email || ""}
              onChange={(event) =>
                setEditMember((member) => ({
                  ...member,
                  email: event.target.value,
                }))
              }
              required
              fullWidth
            />
            <FormControl
              fullWidth
              disabled={String(editMember?.id) === String(currentAdmin?.id)}
            >
              <InputLabel id="edit-member-role-label">Role</InputLabel>
              <Select
                labelId="edit-member-role-label"
                label="Role"
                value={editMember?.role || "user"}
                onChange={(event) =>
                  setEditMember((member) => ({
                    ...member,
                    role: event.target.value,
                  }))
                }
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              disabled={String(editMember?.id) === String(currentAdmin?.id)}
            >
              <InputLabel id="edit-member-status-label">
                Account status
              </InputLabel>
              <Select
                labelId="edit-member-status-label"
                label="Account status"
                value={Boolean(editMember?.is_active)}
                onChange={(event) =>
                  setEditMember((member) => ({
                    ...member,
                    is_active: event.target.value,
                  }))
                }
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={savingMember} onClick={() => setEditMember(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              savingMember ||
              !editMember?.username.trim() ||
              !editMember?.email.trim()
            }
            onClick={saveMemberChanges}
          >
            {savingMember ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(memberToDeactivate)}
        onClose={() => !savingMember && setMemberToDeactivate(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Deactivate this member?</DialogTitle>
        <DialogContent>
          <Typography>
            {memberToDeactivate?.username} will no longer be able to sign in.
            Their projects and proposal history will be preserved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={savingMember}
            onClick={() => setMemberToDeactivate(null)}
          >
            Keep member
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={savingMember}
            onClick={deactivateMember}
          >
            {savingMember ? "Deactivating..." : "Deactivate account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminWorkspace;
