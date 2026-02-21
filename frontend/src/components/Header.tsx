import { useMemo, useState } from "react";
import {
  Menu,
  X,
  Moon,
  Sun,
  ShoppingCart,
  LogOut,
  Shield,
  User,
  Scissors,
  Info,
  Phone,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthProvider";

interface HeaderProps {
  onCartClick?: () => void;
  showCart?: boolean;
}

export default function Header({ onCartClick, showCart = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const cartCount = getCartCount();
  const hasCartItems = cartCount > 0;

  const menuItems = useMemo(
    () => [
      { id: "services", label: "Serviços", icon: Scissors },
      { id: "about", label: "Sobre", icon: Info },
      { id: "contact", label: "Contato", icon: Phone },
    ],
    []
  );

  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);

    if (!element) {
      sessionStorage.setItem("fix_scroll_target", id);
      navigate("/");
      closeMenu();
      return;
    }

    element.scrollIntoView({ behavior: "smooth" });
    closeMenu();
  };

  const goToLogin = (mode: "login" | "signup") => {
    navigate(`/login?mode=${mode}`);
    closeMenu();
  };

  const handleCart = () => {
    if (!showCart) return;
    if (onCartClick) {
      onCartClick();
    } else {
      navigate("/agendar");
    }
    closeMenu();
  };

  const handleProfile = () => {
    navigate("/perfil");
    closeMenu();
  };

  const handleAdmin = () => {
    navigate("/admin");
    closeMenu();
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800/70">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center justify-center rounded-xl p-1.5 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
            aria-label="Ir para início"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white dark:text-gray-900"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 3h10v2H7V3zm0 16h10v2H7v-2zm6-12c-2.21 0-4 1.79-4 4 0 1.86 1.27 3.43 3 3.87V19h2v-4.13c1.73-.44 3-2.01 3-3.87 0-2.21-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-7 0H4v2h2v-2zm14 0v2h2v-2h-2zM3 9h2v2H3V9zm16 0h2v2h-2V9z" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {hasCartItems && showCart && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-amber-400 text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-gray-950/25 backdrop-blur-sm"
            onClick={closeMenu}
            aria-label="Fechar menu"
          />

          <aside className="absolute top-0 right-0 h-full w-full max-w-sm bg-white/92 dark:bg-gray-900/92 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Opções
              </p>
              <button
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Fechar"
              >
                <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>

            <div className="p-4 space-y-5 overflow-y-auto h-[calc(100%-65px)]">
              <div className="space-y-2">
                {menuItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                {showCart && (
                  <button
                    onClick={handleCart}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="font-medium">Carrinho</span>
                    </span>
                    <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-gray-200 dark:bg-gray-700">
                      {cartCount}
                    </span>
                  </button>
                )}

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {theme === "light" ? "Tema escuro" : "Tema claro"}
                  </span>
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                {user ? (
                  <>
                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">Perfil</span>
                    </button>

                    {role === "admin" && (
                      <button
                        onClick={handleAdmin}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">Admin</span>
                      </button>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="font-semibold">Sair</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => goToLogin("login")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span className="font-medium">Entrar</span>
                    </button>

                    <button
                      onClick={() => goToLogin("signup")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left bg-amber-400/90 text-gray-900 hover:bg-amber-300 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="font-semibold">Cadastrar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
