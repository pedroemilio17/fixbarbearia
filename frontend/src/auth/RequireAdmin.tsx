import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
}
