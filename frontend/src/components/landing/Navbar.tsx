import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  User,
  Shield,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../auth/AuthProvider";

type NavItem = { label: string; id: string };

interface NavbarProps {
  onCartClick: () => void;
}

/**
 * Velvet navbar visual + FIX logic (auth/cart/routes).
 * - Visual is 1:1 with Velvet.
 * - Navigation scrolls on Home; if user is on another route, we store the target in sessionStorage and redirect.
 */
export function Navbar({ onCartClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const cartCount = getCartCount();

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Início", id: "hero" },
      { label: "Serviços", id: "servicos" },
      { label: "Planos", id: "planos" },
      { label: "Sobre", id: "sobre" },
      { label: "Contato", id: "contato" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMobileOpen(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);

    // Not on Home route (or element not mounted yet): store the target and redirect.
    if (!el) {
      sessionStorage.setItem("fix_scroll_target", id);
      navigate("/");
      closeMenu();
      return;
    }

    el.scrollIntoView({ behavior: "smooth" });
    closeMenu();
  };

  const goToLogin = (mode: "login" | "signup") => {
    navigate(`/login?mode=${mode}`);
    closeMenu();
  };

  const goToProfile = () => {
    navigate("/perfil");
    closeMenu();
  };

  const goToAdmin = () => {
    navigate("/admin");
    closeMenu();
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card border-b rounded-none py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="font-display text-2xl font-bold tracking-wider text-foreground"
          aria-label="Ir para o início"
        >
          FIX<span className="text-primary">BARBEARIA</span>
        </button>

        {/* Right side icons */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Carrinho"
            onClick={() => {
              onCartClick();
              closeMenu();
            }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Hamburger menu */}
          <button
            className="p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Slide-down menu */}
      {mobileOpen && (
        <div className="glass-card mt-2 mx-4 rounded-xl p-5 flex flex-col gap-1 animate-fade-in">
          <p className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Navegação
          </p>

          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-primary/10 text-left"
            >
              {item.label}
            </button>
          ))}

          <div className="h-px bg-border my-3" />

          <p className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground mb-2">Carrinho</p>
          <button
            type="button"
            onClick={() => {
              onCartClick();
              closeMenu();
            }}
            className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-primary/10"
          >
            <ShoppingCart size={16} />
            Ver carrinho
          </button>

          <div className="h-px bg-border my-3" />

          <p className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground mb-2">Conta</p>

          {user ? (
            <>
              <button
                type="button"
                onClick={goToProfile}
                className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-primary/10"
              >
                <User size={16} />
                Perfil
              </button>

              {role === "admin" && (
                <button
                  type="button"
                  onClick={goToAdmin}
                  className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-primary/10"
                >
                  <Shield size={16} />
                  Admin
                </button>
              )}

              <Button
                type="button"
                variant="destructive"
                className="justify-start px-3"
                onClick={handleSignOut}
              >
                <LogOut />
                Sair
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => goToLogin("login")}
                className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-primary/10"
              >
                <LogIn size={16} />
                Entrar
              </button>
              <Button
                type="button"
                className="justify-start px-3"
                onClick={() => goToLogin("signup")}
              >
                <UserPlus />
                Cadastrar
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
