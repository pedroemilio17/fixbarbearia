import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./auth/AuthProvider";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import RequireAdmin from "./auth/RequireAdmin";
import RequireAuth from "./auth/RequireAuth";

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/agendar" element={<Booking />} />

              <Route
                path="/perfil"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />

              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
