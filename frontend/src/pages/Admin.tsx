import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  deleteAdminAppointment,
  getAdminMe,
  getAdminMonthSummary,
  getAdminSchedule,
  updateAdminAppointment,
  getAdminAuditLogs,
  getAdminClients,
  getAdminClientAppointments,
  type AdminAppointment,
  type AdminAuditLog,
  type AdminClientSummary,
  type AdminClientAppointment,
} from "../services/adminApi";

// Admin dashboard: same data/actions with a cleaner premium layout.
type AdminTab = "agenda" | "historico" | "clientes";

function formatDuration(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

function buildCalendarCells(month: string) {
  const [year, monthNum] = month.split("-").map(Number);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0).getDate();

  const leadingEmpty = firstDay.getDay();
  const cells: (string | null)[] = [];

  for (let i = 0; i < leadingEmpty; i++) cells.push(null);
  for (let day = 1; day <= lastDay; day++) {
    cells.push(`${month}-${String(day).padStart(2, "0")}`);
  }

  return cells;
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Admin() {
  const navigate = useNavigate();

  const initialDate = todayISO();
  const [tab, setTab] = useState<AdminTab>("agenda");

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.slice(0, 7));

  const [barberName, setBarberName] = useState("Barbeiro");
  const [dailyAppointments, setDailyAppointments] = useState<AdminAppointment[]>([]);
  const [monthCounts, setMonthCounts] = useState<Record<string, number>>({});

  const [loadingDay, setLoadingDay] = useState(true);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editStatus, setEditStatus] = useState<"aguardando" | "concluido">("aguardando");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Histórico
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Clientes
  const [clients, setClients] = useState<AdminClientSummary[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientAppointments, setClientAppointments] = useState<AdminClientAppointment[]>([]);
  const [loadingClientAppointments, setLoadingClientAppointments] = useState(false);

  const calendarCells = useMemo(() => buildCalendarCells(selectedMonth), [selectedMonth]);

  async function loadAdminMe() {
    const me = await getAdminMe();
    setBarberName(me.barberName || "Barbeiro");
  }

  async function loadDay(date: string) {
    setLoadingDay(true);
    setGlobalError("");
    try {
      const data = await getAdminSchedule(date);
      setDailyAppointments(data.appointments || []);
    } catch (err: any) {
      setGlobalError(err?.message || "Erro ao carregar agenda do dia.");
    } finally {
      setLoadingDay(false);
    }
  }

  async function loadMonth(month: string) {
    setLoadingMonth(true);
    setGlobalError("");
    try {
      const data = await getAdminMonthSummary(month);
      const map: Record<string, number> = {};
      for (const item of data.days || []) map[item.date] = item.count;
      setMonthCounts(map);
    } catch (err: any) {
      setGlobalError(err?.message || "Erro ao carregar calendário mensal.");
    } finally {
      setLoadingMonth(false);
    }
  }

  async function loadLogs() {
    setLoadingLogs(true);
    setGlobalError("");
    try {
      const data = await getAdminAuditLogs({ limit: 100 });
      setLogs(data.items || []);
    } catch (err: any) {
      setGlobalError(err?.message || "Erro ao carregar histórico.");
    } finally {
      setLoadingLogs(false);
    }
  }

  async function loadClients() {
    setLoadingClients(true);
    setGlobalError("");
    try {
      const data = await getAdminClients({ limit: 300 });
      setClients(data.items || []);
    } catch (err: any) {
      setGlobalError(err?.message || "Erro ao carregar clientes.");
    } finally {
      setLoadingClients(false);
    }
  }

  async function loadClientAppointments(userId: string) {
    setLoadingClientAppointments(true);
    setGlobalError("");
    try {
      const data = await getAdminClientAppointments(userId);
      setClientAppointments(data.items || []);
    } catch (err: any) {
      setGlobalError(err?.message || "Erro ao carregar agendamentos do cliente.");
    } finally {
      setLoadingClientAppointments(false);
    }
  }

  useEffect(() => {
    loadAdminMe().catch((err) => {
      setGlobalError(err?.message || "Falha ao carregar dados do administrador.");
    });
  }, []);

  useEffect(() => {
    if (tab !== "agenda") return;
    loadDay(selectedDate);
  }, [selectedDate, tab]);

  useEffect(() => {
    if (tab !== "agenda") return;
    loadMonth(selectedMonth);
  }, [selectedMonth, tab]);

  useEffect(() => {
    if (tab === "historico") loadLogs();
    if (tab === "clientes") loadClients();
  }, [tab]);

  function openEdit(appt: AdminAppointment) {
    setEditingId(appt.id);
    setEditDate(appt.date);
    setEditTime(appt.time);
    setEditStatus(appt.status || "aguardando");
    setEditAdminNotes(appt.adminNotes || "");
  }

  async function saveEdit() {
    if (!editingId || !editDate || !editTime) return;

    setSavingEdit(true);
    setGlobalError("");

    try {
      await updateAdminAppointment(editingId, {
        date: editDate,
        time: editTime,
        status: editStatus,
        adminNotes: editAdminNotes,
      });

      setEditingId(null);

      if (editDate !== selectedDate) {
        setSelectedDate(editDate);
      } else {
        await loadDay(selectedDate);
      }

      await loadMonth(selectedMonth);
      await loadLogs();
    } catch (err: any) {
      setGlobalError(err?.message || "Erro ao salvar alteração.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeAppointment(id: string) {
    const ok = window.confirm("Deseja excluir este agendamento?");
    if (!ok) return;

    setDeletingId(id);
    setGlobalError("");

    try {
      await deleteAdminAppointment(id);
      await loadDay(selectedDate);
      await loadMonth(selectedMonth);
      await loadLogs();
    } catch (err: any) {
      setGlobalError(err?.message || "Erro ao excluir agendamento.");
    } finally {
      setDeletingId(null);
    }
  }

  const weekLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function renderAgenda() {
    return (
      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-display text-foreground">Agenda do dia</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-5">
            {loadingDay ? (
              <p className="text-muted-foreground">Carregando agenda...</p>
            ) : dailyAppointments.length === 0 ? (
              <p className="text-muted-foreground">Nenhum atendimento neste dia.</p>
            ) : (
              <div className="space-y-4">
                {dailyAppointments.map((appt) => (
                  <article
                    key={appt.id}
                    className="rounded-lg border-b border-border/80 p-4 bg-transparent"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Horário</p>
                        <p className="text-lg font-bold text-foreground">{appt.time}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="text-sm font-semibold text-foreground">
                          {appt.client.name || appt.client.email || "Cliente"}
                        </p>
                        {appt.client.email && (
                          <p className="text-sm text-muted-foreground">{appt.client.email}</p>
                        )}
                        {appt.client.phone && (
                          <p className="text-sm text-muted-foreground">Tel: {appt.client.phone}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Duração total</p>
                        <p className="font-semibold text-foreground">
                          {formatDuration(appt.totalDuration)}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">Status</p>
                        <span className={["inline-flex mt-1 rounded-full px-2 py-1 text-xs font-bold", appt.status === "concluido" ? "bg-emerald-600 text-white" : "bg-amber-500 text-gray-900"].join(" ")}>
                          {appt.status === "concluido" ? "Concluído" : "Aguardando"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Serviços</p>
                      <ul className="space-y-1">
                        {appt.items.map((item, idx) => (
                          <li key={`${appt.id}-${item.serviceId}-${idx}`} className="text-sm text-muted-foreground">
                            {item.qty}x {item.serviceName} — {item.duration}min cada
                          </li>
                        ))}
                      </ul>
                    </div>

                    {appt.notes && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Observações do cliente: {appt.notes}
                      </p>
                    )}

                    {appt.adminNotes && (
                      <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        Anotações internas: {appt.adminNotes}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(appt)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold border border-input hover:bg-secondary"
                      >
                        Editar agendamento
                      </button>

                      <button
                        onClick={() => openEdit(appt)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold border border-input hover:bg-secondary"
                      >
                        Anotações internas
                      </button>

                      <button
                        onClick={() => removeAppointment(appt.id)}
                        disabled={deletingId === appt.id}
                        className="rounded-lg px-3 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
                      >
                        {deletingId === appt.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>

                    {editingId === appt.id && (
                      <div className="mt-4 p-3 rounded-lg border border-input bg-white dark:bg-gray-800">
                        <p className="text-sm font-semibold mb-2 text-foreground">Editar agendamento</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                          />
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                          />
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as "aguardando" | "concluido")}
                            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                          >
                            <option value="aguardando">Aguardando</option>
                            <option value="concluido">Concluído</option>
                          </select>
                          <input
                            value={appt.paymentMethod === "presencial" ? "Pagamento: presencial" : "Pagamento: online"}
                            readOnly
                            className="rounded-lg border border-input bg-secondary px-3 py-2 text-sm opacity-80"
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Anotações internas (mudança de pagamento/corte, etc.)</label>
                          <textarea
                            value={editAdminNotes}
                            onChange={(e) => setEditAdminNotes(e.target.value)}
                            rows={3}
                            placeholder="Ex.: cliente trocou corte para degradê e pagará no local"
                            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={savingEdit}
                            className="rounded-lg px-3 py-2 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-60"
                          >
                            {savingEdit ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg px-3 py-2 text-sm font-semibold border border-input"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-display text-foreground">Calendário mensal</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          {loadingMonth ? (
            <p className="mt-4 text-muted-foreground">Carregando calendário...</p>
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekLabels.map((w) => (
                  <div key={w} className="text-xs font-semibold text-muted-foreground text-center py-1">
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="h-20 rounded-lg bg-transparent" />;

                  const day = Number(date.slice(-2));
                  const count = monthCounts[date] || 0;
                  const selected = date === selectedDate;

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={[
                        "h-16 sm:h-20 rounded-lg border p-2 text-left transition",
                        selected
                          ? "border-gray-900 dark:border-gray-100 bg-secondary"
                          : "border-border hover:bg-secondary/70",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-start">
                        <span className="text-sm font-semibold text-foreground">{day}</span>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-input px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-200">{count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </section>
    );
  }

  function renderHistorico() {
    return (
      <section className="glass-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-display text-foreground">Histórico de alterações</h2>
          <button
            onClick={loadLogs}
            className="rounded-lg px-3 py-2 text-sm font-semibold border border-input hover:bg-secondary"
          >
            Atualizar
          </button>
        </div>

        {loadingLogs ? (
          <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
        ) : logs.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Sem eventos registrados.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {logs.map((log) => {
              const before = log.before_data || {};
              const after = log.after_data || null;
              const clientName = before?.client?.name || before?.client?.email || "Cliente";
              const services = Array.isArray(before?.items)
                ? before.items.map((i: any) => `${i.qty}x ${i.serviceName}`).join(", ")
                : "-";

              return (
                <article
                  key={log.id}
                  className="rounded-lg border-b border-border/80 p-4 bg-transparent"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "text-xs font-bold px-2 py-1 rounded",
                          log.action === "DELETE_APPOINTMENT"
                            ? "bg-red-600 text-white"
                            : "bg-amber-500 text-gray-900",
                        ].join(" ")}
                      >
                        {log.action === "DELETE_APPOINTMENT" ? "EXCLUSÃO" : "ALTERAÇÃO"}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Barbeiro: <strong>{log.actor_name || log.actor_email}</strong>
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p className="text-muted-foreground">
                      Cliente: <strong>{clientName}</strong>
                    </p>
                    <p className="text-muted-foreground">
                      Horário anterior:{" "}
                      <strong>
                        {before?.date || "-"} {before?.time || ""}
                      </strong>
                    </p>

                    {after ? (
                      <p className="text-muted-foreground">
                        Horário novo: <strong>{after?.date || "-"} {after?.time || ""}</strong>
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Horário novo: <strong>— (agendamento removido)</strong>
                      </p>
                    )}

                    <p className="text-muted-foreground">
                      Serviços: <strong>{services || "-"}</strong>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderClientes() {
    const selectedClient = clients.find((c) => c.userId === selectedClientId) || null;

    return (
      <section className="glass-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-display text-foreground">Banco de clientes</h2>
          <button
            onClick={loadClients}
            className="rounded-lg px-3 py-2 text-sm font-semibold border border-input hover:bg-secondary"
          >
            Atualizar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {loadingClients ? (
              <p className="text-muted-foreground">Carregando clientes...</p>
            ) : clients.length === 0 ? (
              <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                {clients.map((c) => (
                  <button
                    key={c.userId}
                    onClick={async () => {
                      setSelectedClientId(c.userId);
                      await loadClientAppointments(c.userId);
                    }}
                    className={[
                      "w-full text-left rounded-lg border p-3 transition",
                      selectedClientId === c.userId
                        ? "border-gray-900 dark:border-gray-100 bg-secondary"
                        : "border-border hover:bg-gray-50 dark:hover:bg-gray-900",
                    ].join(" ")}
                  >
                    <p className="font-semibold text-foreground">
                      {c.name || c.email || "Cliente"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{c.email || "-"}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tel: {c.phone || "-"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.totalAppointments} atendimento(s) • Último: {c.lastAppointmentDate || "-"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border-b border-border/80 p-4 bg-transparent">
            {!selectedClient ? (
              <p className="text-muted-foreground">
                Selecione um cliente para ver os agendamentos.
              </p>
            ) : loadingClientAppointments ? (
              <p className="text-muted-foreground">Carregando agendamentos...</p>
            ) : (
              <div>
                <h3 className="font-bold text-foreground">
                  {selectedClient.name || selectedClient.email}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedClient.email || "-"}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tel: {selectedClient.phone || "-"}</p>

                <div className="mt-4 space-y-3 max-h-[420px] overflow-auto pr-1">
                  {clientAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem agendamentos.</p>
                  ) : (
                    clientAppointments.map((a) => (
                      <article
                        key={a.id}
                        className="rounded-lg border border-border p-3 bg-white dark:bg-gray-800"
                      >
                        <p className="text-sm text-muted-foreground">
                          <strong>{a.date}</strong> às <strong>{a.time}</strong> • {formatDuration(a.totalDuration)}
                        </p>
                        <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                          {a.items.map((it, idx) => (
                            <li key={`${a.id}-${it.serviceId}-${idx}`}>
                              {it.qty}x {it.serviceName} ({it.duration}min)
                            </li>
                          ))}
                        </ul>
                        {a.notes && (
                          <p className="mt-2 text-xs text-muted-foreground">Obs: {a.notes}</p>
                        )}
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 transition-colors">
      <Header showCart={false} onCartClick={() => navigate("/agendar")} />

      <main className="container mx-auto px-6 pt-24 pb-10 space-y-8">
        <section className="glass-card p-6">
          <h1 className="font-display text-4xl text-foreground">Painel do Administrador</h1>
          <p className="mt-2 text-muted-foreground">
            Barbeiro responsável: <span className="font-semibold">{barberName}</span>
          </p>
          {globalError && <p className="mt-3 text-sm text-red-600">{globalError}</p>}
        </section>

        <section className="glass-card p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTab("agenda")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                tab === "agenda"
                  ? "bg-primary text-primary-foreground border-gray-900 dark:border-gray-100"
                  : "border-input text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setTab("historico")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                tab === "historico"
                  ? "bg-primary text-primary-foreground border-gray-900 dark:border-gray-100"
                  : "border-input text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setTab("clientes")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                tab === "clientes"
                  ? "bg-primary text-primary-foreground border-gray-900 dark:border-gray-100"
                  : "border-input text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Clientes
            </button>
          </div>
        </section>

        {tab === "agenda" && renderAgenda()}
        {tab === "historico" && renderHistorico()}
        {tab === "clientes" && renderClientes()}
      </main>
    </div>
  );
}
