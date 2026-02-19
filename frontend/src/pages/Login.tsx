import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";

type Mode = "login" | "signup";

function normalizePhone(input: string) {
  return input.replace(/[^\d+]/g, "").slice(0, 20);
}

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
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [loading, user, from, navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setInfo("");
    setSearchParams({ mode: next });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    try {
      if (!email.trim() || !password.trim()) {
        setError("Informe e-mail e senha.");
        return;
      }

      if (mode === "signup") {
        if (!phone.trim()) {
          setError("Informe seu telefone.");
          return;
        }

        const normalizedPhone = normalizePhone(phone);

        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              phone: normalizedPhone,
              name: email.trim().split("@")[0],
            },
          },
        });

        if (signUpErr) {
          setError(signUpErr.message);
          return;
        }

        // Se projeto exigir confirmação por email, pode não vir sessão
        if (!data.session) {
          setInfo("Cadastro criado. Verifique seu e-mail para confirmar a conta.");
          return;
        }

        await refreshRole();
        navigate(from, { replace: true });
        return;
      }

      // login
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInErr) {
        setError(signInErr.message);
        return;
      }

      await refreshRole();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Erro inesperado.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {mode === "login" ? "Entrar" : "Cadastrar"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {mode === "login"
            ? "Faça login para continuar o agendamento."
            : "Crie sua conta para agendar serviços."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="seuemail@dominio.com"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Telefone</label>
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="+5565999999999"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Senha</label>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="********"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 py-2.5 font-semibold disabled:opacity-60"
          >
            {busy ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="mt-4">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="text-sm underline text-gray-700 dark:text-gray-300"
            >
              Não tenho conta
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-sm underline text-gray-700 dark:text-gray-300"
            >
              Já tenho conta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
