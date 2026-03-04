import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

type Mode = "login" | "signup";

function normalizePhone(v: string) {
  return v.replace(/[^\d+]/g, "");
}

// Auth screen keeps existing login/signup flow with a unified velvet form UI.
export default function Login() {
  const { user, loading, refreshRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const from = (location.state as any)?.from?.pathname || "/";
  const initialMode = (searchParams.get("mode") as Mode) || "login";

  const [mode, setMode] = useState<Mode>(initialMode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [loading, user, from, navigate]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setInfo("");
    setSearchParams({ mode: next });
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    try {
      if (!email.trim() || !password.trim()) return setError("Informe e-mail e senha.");

      if (mode === "signup") {
        if (!phone.trim()) return setError("Informe seu telefone.");

        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: { phone: normalizePhone(phone), name: email.trim().split("@")[0] },
          },
        });

        if (signUpErr) return setError(signUpErr.message);
        if (!data.session) return setInfo("Cadastro criado. Verifique seu e-mail para confirmar a conta.");

        await refreshRole();
        navigate(from, { replace: true });
        return;
      }

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInErr) return setError(signInErr.message);
      await refreshRole();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Erro inesperado.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/30 px-4 py-16">
      <div className="glass-card w-full max-w-md p-7">
        <h1 className="font-display text-4xl">{mode === "login" ? "Entrar" : "Cadastrar"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" ? "Faça login para continuar o agendamento." : "Crie sua conta para agendar serviços."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@dominio.com" />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(normalizePhone(e.target.value))} placeholder="+5565999999999" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}

          <Button type="submit" disabled={busy} className="w-full" size="lg">
            {busy ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </Button>
        </form>

        <Button
          type="button"
          variant="link"
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          className="mt-3 px-0"
        >
          {mode === "login" ? "Não tenho conta" : "Já tenho conta"}
        </Button>
      </div>
    </div>
  );
}
