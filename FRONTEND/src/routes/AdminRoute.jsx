import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SkeletonPage } from "../components/ui/Skeleton";

export default function AdminRoute({ children }) {
  const { user, estConnecte, chargementInitial } = useAuth();
  const location = useLocation();

  if (chargementInitial) {
    return <SkeletonPage />;
  }

  if (!estConnecte) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
