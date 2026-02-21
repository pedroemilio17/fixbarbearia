import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, CreditCard, Package } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../services/api";
import { getServices } from "../services/servicesApi";

type ProfileTab = "perfil" | "agendamentos" | "plano";

type RawMyAppointment = {
  id: string;
  date: string;
  time: string;
  payment_method: "online" | "presencial";
  notes: string | null;
  created_at: string;
  appointment_items: { service_id: string; qty: number }[];
};

type MyAppointmentView = {
  id: string;
  date: string;
  time: string;
  paymentMethod: "online" | "presencial";
  notes: string | null;
  createdAt: string;
  items: { serviceId: string; qty: number; serviceName: string }[];
};

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return { Authorization: `Bearer ${token}` };
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function getAppointmentDateTime(a: { date: string; time: string }) {
  return new Date(`${a.date}T${a.time}:00`);
}

export default function Profile() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>("perfil");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<MyAppointmentView[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  useEffect(() => {
    const metadata = user?.user_metadata || {};
    setFullName(
      String(metadata.full_name || metadata.name || user?.email?.split("@")[0] || "")
    );
    setPhone(String(metadata.phone || ""));
    setEmail(user?.email || "");
  }, [user]);

  useEffect(() => {
    let alive = true;

    async function loadAppointments() {
      try {
        setLoadingAppointments(true);
        setAppointmentsError(null);

        const [rawAppointments, services] = await Promise.all([
          apiFetch<RawMyAppointment[]>("/my-appointments", {
            headers: await getAuthHeaders(),
          }),
          getServices() as Promise<Array<{ id: string; name: string }>>,
        ]);

        const serviceMap = new Map((services || []).map((s) => [s.id, s.name]));

        const parsed = (rawAppointments || []).map((appt) => ({
          id: appt.id,
          date: appt.date,
          time: appt.time,
          paymentMethod: appt.payment_method,
          notes: appt.notes,
          createdAt: appt.created_at,
          items: (appt.appointment_items || []).map((it) => ({
            serviceId: it.service_id,
            qty: it.qty || 1,
            serviceName: serviceMap.get(it.service_id) || "Serviço",
          })),
        }));

        if (alive) setAppointments(parsed);
      } catch (err) {
        console.error("Erro ao carregar agendamentos do perfil:", err);
        if (alive) setAppointmentsError("Não foi possível carregar seus agendamentos.");
      } finally {
        if (alive) setLoadingAppointments(false);
      }
    }

    loadAppointments();

    return () => {
      alive = false;
    };
  }, []);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => getAppointmentDateTime(a) >= now)
      .sort((a, b) => getAppointmentDateTime(a).getTime() - getAppointmentDateTime(b).getTime());
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => getAppointmentDateTime(a) < now)
      .sort((a, b) => getAppointmentDateTime(b).getTime() - getAppointmentDateTime(a).getTime());
  }, [appointments]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const payload: any = {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      };

      if (email.trim() && email.trim() !== (user?.email || "")) {
        payload.email = email.trim();
      }

      const { error } = await supabase.auth.updateUser(payload);
      if (error) throw error;

      setSaveMessage(
        payload.email
          ? "Perfil atualizado. Se você mudou o e-mail, confirme na caixa de entrada."
          : "Perfil atualizado com sucesso."
      );
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      setSaveError(err?.message || "Não foi possível atualizar seu perfil.");
    } finally {
      setSaving(false);
    }
  };

  const renderAppointmentCard = (appt: MyAppointmentView) => (
    <div
      key={appt.id}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {formatDate(appt.date)} às {appt.time}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Criado em {new Date(appt.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          <CreditCard className="h-3.5 w-3.5" />
          {appt.paymentMethod === "presencial" ? "Presencial" : "Online"}
        </span>
      </div>

      <div className="space-y-1">
        {appt.items.map((item, idx) => (
          <p key={`${appt.id}-${idx}`} className="text-sm text-gray-700 dark:text-gray-300">
            • {item.serviceName} {item.qty > 1 ? `x${item.qty}` : ""}
          </p>
        ))}
      </div>

      {appt.notes && (
        <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Observações
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{appt.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Seu perfil
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Organize seus dados e acompanhe seus agendamentos sem caça ao tesouro.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {([
              ["perfil", "Perfil"],
              ["agendamentos", "Agendamentos"],
              ["plano", "Plano"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  activeTab === key
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 border-gray-900 dark:border-gray-100"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "perfil" && (
            <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <form
                onSubmit={handleSaveProfile}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6"
              >
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Dados pessoais
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefone
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="(65) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="voce@email.com"
                    />
                  </div>
                </div>

                {saveError && (
                  <p className="mt-4 text-sm text-red-600 dark:text-red-400">{saveError}</p>
                )}
                {saveMessage && (
                  <p className="mt-4 text-sm text-green-600 dark:text-green-400">{saveMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-amber-400 hover:bg-amber-300 text-gray-900 px-4 py-2 font-semibold disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Resumo rápido
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900/60 p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Próximos</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{upcomingAppointments.length}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-900/60 p-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Histórico</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{pastAppointments.length}</span>
                  </div>

                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                      Conta atual
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "agendamentos" && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock3 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  <h2 className="font-bold text-gray-900 dark:text-gray-100">Próximos agendamentos</h2>
                </div>

                {loadingAppointments ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
                ) : appointmentsError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{appointmentsError}</p>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nenhum agendamento futuro por enquanto.
                  </p>
                ) : (
                  <div className="space-y-3">{upcomingAppointments.map(renderAppointmentCard)}</div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  <h2 className="font-bold text-gray-900 dark:text-gray-100">Histórico</h2>
                </div>

                {loadingAppointments ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
                ) : appointmentsError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{appointmentsError}</p>
                ) : pastAppointments.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ainda não há atendimentos concluídos no histórico.
                  </p>
                ) : (
                  <div className="space-y-3">{pastAppointments.map(renderAppointmentCard)}</div>
                )}
              </div>
            </section>
          )}

          {activeTab === "plano" && (
            <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Área de plano
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Espaço reservado para seu plano/assinatura. A estrutura já está pronta,
                    então depois é só ligar as regras e cobrança sem bagunçar o resto.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Status atual
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sem plano ativo</p>
                </div>
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Próximo passo
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Integrar catálogo de planos + pagamento recorrente.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Footer />
    </div>
  );
}
