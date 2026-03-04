import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Menu, X, ShoppingCart, Sun, Moon, LogIn, UserPlus, User, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../auth/AuthProvider";

type NavItem = { label: string; id: string };

interface NavbarProps {
  onCartClick: () => void;
}

// Compact popover navigation with smooth section routing and auth-aware actions.
function NavbarComponent({ onCartClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const cartCount = getCartCount();
  const isAdmin = role === "admin";

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
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) {
        sessionStorage.setItem("fix_scroll_target", id);
        navigate("/");
        closeMenu();
        return;
      }
      el.scrollIntoView({ behavior: "smooth" });
      closeMenu();
    },
    [closeMenu, navigate]
  );

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 py-4 transition-all ${scrolled ? "" : ""}`}>
      <div className="container flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="font-display text-2xl font-bold tracking-wider text-foreground"
          aria-label="Ir para o início"
        >
          FIX<span className="text-primary">BARBEARIA</span>
        </button>

        <div className="relative flex items-center gap-2">
          <button
            className="relative rounded-lg border border-border bg-background/80 p-2 backdrop-blur hover:bg-background"
            aria-label="Carrinho"
            onClick={onCartClick}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-lg border border-border bg-background/80 p-2 backdrop-blur hover:bg-background"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="rounded-lg border border-border bg-background/80 p-2 backdrop-blur hover:bg-background"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-[300px] glass-card p-3 shadow-2xl">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-primary/10"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    navigate("/agendar");
                    closeMenu();
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-primary/10"
                >
                  Agendar
                </button>
              </div>

              <div className="my-3 h-px bg-border" />

              {user ? (
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/perfil"); closeMenu(); }}>
                    <User size={16} /> Perfil
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/admin"); closeMenu(); }}>
                      <Shield size={16} /> Admin
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={async () => {
                      await signOut();
                      closeMenu();
                      navigate("/");
                    }}
                  >
                    <LogOut size={16} /> Sair
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/login?mode=login"); closeMenu(); }}>
                    <LogIn size={16} /> Entrar
                  </Button>
                  <Button className="w-full justify-start" onClick={() => { navigate("/login?mode=signup"); closeMenu(); }}>
                    <UserPlus size={16} /> Cadastrar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);
