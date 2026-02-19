import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./auth/AuthProvider";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import RequireAdmin from "./auth/RequireAdmin";

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
