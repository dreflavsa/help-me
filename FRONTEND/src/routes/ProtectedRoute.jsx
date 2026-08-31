import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { estConnecte, chargementInitial } = useAuth();

    if (chargementInitial) {
        // Le silent refresh est encore en cours — évite de rediriger
        // vers /login par erreur avant même d'avoir vérifié la session.
        return <p>Chargement...</p>;
    }

    if (!estConnecte) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
