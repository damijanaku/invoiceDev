import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddBusiness from "./pages/AddBusiness";
import EditBusiness from "./pages/EditBusiness";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AddClient from "./pages/AddClient";
import ClientList from "./pages/ClientList";
import EditClient from "./pages/EditClient";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/business/add" element={<AddBusiness />} />
          <Route path="/business/edit/:id" element={<EditBusiness />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/add" element={<AddClient />} />
          <Route path="/clients/edit/:id" element={<EditClient />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
