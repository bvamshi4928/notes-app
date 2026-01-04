import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import useAuth from "./context/useAuth";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Reminders from "./pages/Reminders";
import Trash from "./pages/Trash";
import Archive from "./pages/Archive";
import Profile from "./pages/Profile";
import Label from "./pages/Label";

const RequireAuth = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/signin" replace />;
};

const AppLayout = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const { token } = useAuth();

  const handleRefresh = () => setRefreshKey((k) => k + 1);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleViewMode = () =>
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      {token && (
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={handleRefresh}
          onToggleSidebar={toggleSidebar}
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        {token && <Sidebar isOpen={sidebarOpen} />}

        {/* Page content */}
        <main
          className={`flex-1 p-4 transition-all duration-300
    ${token ? (sidebarOpen ? "ml-60 pt-20" : "ml-16 pt-20") : ""}`}
        >
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    refreshKey={refreshKey}
                    onRefresh={handleRefresh}
                    viewMode={viewMode}
                  />
                </RequireAuth>
              }
            />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/trash" element={<Trash />} />
            <Route
              path="/label/:labelId"
              element={
                <RequireAuth>
                  <Label viewMode={viewMode} />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
