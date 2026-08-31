import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, estConnecte, chargementInitial } = useAuth();
  const location = useLocation();

  if (chargementInitial) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <p className="text-on-surface-variant">Chargement...</p>
      </div>
    );
  }

  if (!estConnecte) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
