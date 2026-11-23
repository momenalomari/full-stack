import Login from "./componant/auth/login.jsx";
import { Register } from "./componant/auth/register.jsx";
import { Toaster } from "react-hot-toast";
import { Button } from "@mui/material";
import { Navigate, Route, Routes, Link } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AdminDashboard from "./componant/admin/AdminWorkspace.jsx";
import Dashboard from "./componant/shared/Dashboard.jsx";
import CreateProject from "./componant/shared/CreateProject.jsx";
import ProjectDetails from "./componant/shared/ProjectDetails.jsx";
import MyProposals from "./componant/shared/MyProposals.jsx";
import ProtectedRoute from "./componant/layout/ProtectedRoute.jsx";
import BrowseProjects from "./componant/shared/BrowseProjects.jsx";
import MyProjects from "./componant/shared/MyProjects.jsx";
import ProjectProposals from "./componant/shared/ProjectProposals.jsx";
import AiAssistant from "./componant/shared/AiAssistant.jsx";
import { useTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import ThemeModeButton from "./componant/shared/ThemeModeButton.jsx";
import Profile from "./componant/shared/Profile.jsx";
import ChangePassword from "./componant/shared/ChangePassword.jsx";
import Feedback from "./componant/shared/Feedback.jsx";
import About from "./componant/shared/About.jsx";
import Contact from "./componant/shared/Contact.jsx";
import EmailVerification from "./componant/auth/EmailVerification.jsx";
import ModeratorDashboard from "./componant/admin/ModeratorDashboard.jsx";

function App({ mode, setMode }) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const routePath = pathname.replace(/\/+$/, "") || "/";
  const hasHeaderThemeButton =
    routePath === "/dashboard" || routePath === "/projects";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      {!hasHeaderThemeButton && (
        <ThemeModeButton mode={mode} setMode={setMode} floating />
      )}
      {routePath !== "/projects" && (
        <Button
          component={Link}
          to="/projects"
          variant="outlined"
          startIcon={<HomeRoundedIcon />}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 1300,
            borderRadius: "999px",
            borderColor: "divider",
            backgroundColor: "background.paper",
            color: "text.primary",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          Back to home
        </Button>
      )}

      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route
          path="/projects"
          element={<BrowseProjects mode={mode} setMode={setMode} />}
        />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard mode={mode} setMode={setMode} />}
          />
          <Route path="/assistant" element={<AiAssistant />} />
          <Route path="/projects/mine" element={<MyProjects />} />
          <Route
            path="/projects/:projectId/proposals"
            element={<ProjectProposals />}
          />
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/proposals/mine" element={<MyProposals />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
        <Route element={<ProtectedRoute moderatorOnly />}>
          <Route path="/moderator" element={<ModeratorDashboard />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route
          path="/403"
          element={
            <main>
              <h1>403: Access denied</h1>
            </main>
          }
        />
        <Route
          path="*"
          element={
            <main>
              <h1>404: Page not found</h1>
            </main>
          }
        />
      </Routes>
    </div>
  );
}
export default App;
