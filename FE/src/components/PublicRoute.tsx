import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/gallery" replace />;
  }

  return <>{children}</>;
};
