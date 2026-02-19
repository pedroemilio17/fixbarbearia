import { useState } from "react";
import { Menu, X, Moon, Sun, ShoppingCart, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthProvider";

interface HeaderProps {
  onCartClick?: () => void;
  showCart?: boolean;
}

export default function Header({ onCartClick, showCart = true }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      navigate("/");
      setIsMobileMenuOpen(false);
      return;
    }
    element.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const goToLogin = (mode: "login" | "signup") => {
    navigate(`/login?mode=${mode}`);
    setIsMobileMenuOpen(false);
  };

  const cartCount = getCartCount();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => scrollToSection("hero")}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              className="w-6 h-6 text-white dark:text-gray-900"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 3h10v2H7V3zm0 16h10v2H7v-2zm6-12c-2.21 0-4 1.79-4 4 0 1.86 1.27 3.43 3 3.87V19h2v-4.13c1.73-.44 3-2.01 3-3.87 0-2.21-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-7 0H4v2h2v-2zm14 0v2h2v-2h-2zM3 9h2v2H3V9zm16 0h2v2h-2V9z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            FIX
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("services")}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          >
            Serviços
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          >
            Sobre
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          >
            Contato
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {showCart && onCartClick && (
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {user && role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-semibold"
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          )}

          {!user ? (
            <>
              <button
                onClick={() => goToLogin("login")}
                className="inline-flex px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-semibold"
              >
                Entrar
              </button>
              <button
                onClick={() => goToLogin("signup")}
                className="inline-flex px-4 py-2 rounded-lg bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors text-sm font-bold shadow-sm"
              >
                Cadastrar
              </button>
            </>
          ) : (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "light" ? (
              <Moon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("services")}
              className="text-left text-gray-700 dark:text-gray-300 font-medium"
            >
              Serviços
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-left text-gray-700 dark:text-gray-300 font-medium"
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-left text-gray-700 dark:text-gray-300 font-medium"
            >
              Contato
            </button>

            {user && role === "admin" && (
              <button
                onClick={() => {
                  navigate("/admin");
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 dark:text-gray-300 font-semibold"
              >
                Admin
              </button>
            )}

            {!user ? (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => goToLogin("login")}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm font-semibold"
                >
                  Entrar
                </button>
                <button
                  onClick={() => goToLogin("signup")}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-400 text-gray-900 text-sm font-bold"
                >
                  Cadastrar
                </button>
              </div>
            ) : (
              <button
                onClick={signOut}
                className="mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
