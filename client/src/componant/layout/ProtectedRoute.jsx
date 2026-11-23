import { CircularProgress, Box } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../Hooks/useAuthContext.js";

const ProtectedRoute = ({ adminOnly = false, moderatorOnly = false }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <CircularProgress aria-label="Loading account" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/403" replace />;
  }
  if (
    moderatorOnly &&
    user.role !== "moderator" &&
    user.role !== "admin"
  ) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
