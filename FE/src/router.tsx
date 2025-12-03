import { createBrowserRouter, Navigate } from "react-router-dom";
import Register from "./pages/auth/register/register";
import Gallery from "./pages/gallery/gallery";
import AddGallery from "./pages/gallery/add/addGallery";
import Layout from "./components/Layout";
import Login from "./pages/auth/login/login";
import Profile from "./pages/profile/profile";
import { PublicRoute } from "./components/routes/PublicRoute";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import EditGallery from "./pages/gallery/edit/editGallery";
import DetailsGallery from "./pages/gallery/details/detailsGallery";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "/gallery",
        element: (
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        ),
      },
      {
        path: "/gallery/add",
        element: (
          <ProtectedRoute>
            <AddGallery />
          </ProtectedRoute>
        ),
      },
      {
        path: "/gallery/edit/:id",
        element: (
          <ProtectedRoute>
            <EditGallery />
          </ProtectedRoute>
        ),
      },
      {
        path: "/gallery/details/:id",
        element: (
          <ProtectedRoute>
            <DetailsGallery />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/profile" replace />,
      },
    ],
  },
]);

export default router;
