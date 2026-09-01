import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import Layout from "./components/Layout";
import UpdateBanner from "./components/UpdateBanner";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DashboardPage from "./pages/DashboardPage";
import SoumissionsListPage from "./pages/SoumissionsListPage";
import NouvelleSoumissionPage from "./pages/NouvelleSoumissionPage";
import SoumissionDetailPage from "./pages/SoumissionDetailPage";
import ProfilPage from "./pages/ProfilPage";
import PacksPage from "./pages/PacksPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPaiementsPage from "./pages/AdminPaiementsPage";
import AdminHistoriquePaiementsPage from "./pages/AdminHistoriquePaiementsPage";
import AdminUtilisateursPage from "./pages/AdminUtilisateursPage";
import AdminUsageIAPage from "./pages/AdminUsageIAPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <UpdateBanner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />

              <Route path="/soumissions" element={<SoumissionsListPage />} />

              <Route
                path="/soumissions/nouvelle"
                element={<NouvelleSoumissionPage />}
              />

              <Route
                path="/soumissions/:id"
                element={<SoumissionDetailPage />}
              />

              <Route path="/profil" element={<ProfilPage />} />

              <Route path="/packs" element={<PacksPage />} />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/paiements"
                element={
                  <AdminRoute>
                    <AdminPaiementsPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/paiements/historique"
                element={
                  <AdminRoute>
                    <AdminHistoriquePaiementsPage />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/utilisateurs"
                element={
                  <AdminRoute>
                    <AdminUtilisateursPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/usage-ia"
                element={
                  <AdminRoute>
                    <AdminUsageIAPage />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
