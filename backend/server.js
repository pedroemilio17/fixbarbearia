require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient");

const app = express();
app.use(express.json());

/* =========================
   CONFIG
========================= */
const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "");
const allowedOriginsRaw = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "";
const FRONTEND_ORIGINS = allowedOriginsRaw
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // postman/health checks
      const normalized = normalizeOrigin(origin);

      if (FRONTEND_ORIGINS.length === 0) return cb(null, true); // fallback debug
      if (FRONTEND_ORIGINS.includes(normalized)) return cb(null, true);

      return cb(new Error("CORS bloqueado para esta origem: " + origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   VALIDATORS / HELPERS
========================= */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

function isValidDateStr(value) {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isValidTimeStr(value) {
  if (!TIME_RE.test(value)) return false;
  const [h, m] = value.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function normalizePaymentMethod(pm) {
  if (pm === "cash") return "presencial";
  return pm;
}

function normalizeNotes(notes) {
  return typeof notes === "string" && notes.trim() ? notes.trim() : null;
}

function normalizeClientName(name) {
  if (typeof name !== "string") return null;
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized) return null;
  return normalized.slice(0, 120);
}

function normalizeClientPhone(phone) {
  if (typeof phone !== "string") return null;
  const normalized = phone.trim().replace(/[^\d+]/g, "");
  if (!normalized) return null;
  return normalized.slice(0, 20);
}

function normalizeAdminStatus(status) {
  if (status == null) return null;
  const v = String(status).trim().toLowerCase();
  if (v === "aguardando" || v === "concluido" || v === "concluído") {
    return v === "concluído" ? "concluido" : v;
  }
  return null;
}

function monthRange(month) {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
  const startDate = `${month}-01`;
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
}

/* =========================
   AUTH MIDDLEWARES
========================= */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token ausente." });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ message: "Token inválido." });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    return res.status(500).json({ message: "Erro de autenticação." });
  }
}

function requireAdmin(req, res, next) {
  const email = (req.user?.email || "").toLowerCase();
  if (!email || !ADMIN_EMAILS.has(email)) {
    return res.status(403).json({ message: "Acesso restrito ao administrador." });
  }
  next();
}

/* =========================
   DATA HELPERS
========================= */
async function getValidServiceIds() {
  const { data, error } = await supabase.from("services").select("id");
  if (error) throw error;
  return new Set((data || []).map((s) => s.id));
}

async function getDurationByServiceId() {
  const { data, error } = await supabase.from("services").select("id, duration");
  if (error) throw error;
  const map = new Map();
  for (const s of data || []) map.set(s.id, Number(s.duration) || 0);
  return map;
}

async function getExistingBlocksForDate(date, excludeAppointmentId = null) {
  let query = supabase.from("appointments").select("id, time").eq("date", date);
  if (excludeAppointmentId) query = query.neq("id", excludeAppointmentId);

  const { data: appts, error: apptErr } = await query;
  if (apptErr) throw apptErr;

  const appointmentIds = (appts || []).map((a) => a.id);
  if (!appointmentIds.length) return [];

  const { data: items, error: itemsErr } = await supabase
    .from("appointment_items")
    .select("appointment_id, service_id, qty")
    .in("appointment_id", appointmentIds);

  if (itemsErr) throw itemsErr;

  const durationById = await getDurationByServiceId();

  const itemsByAppt = new Map();
  for (const item of items || []) {
    const arr = itemsByAppt.get(item.appointment_id) || [];
    arr.push(item);
    itemsByAppt.set(item.appointment_id, arr);
  }

  return (appts || []).map((a) => {
    const apptItems = itemsByAppt.get(a.id) || [];
    const totalMinutes = apptItems.reduce((sum, it) => {
      const duration = durationById.get(it.service_id) || 0;
      return sum + duration * (it.qty || 1);
    }, 0);

    return { id: a.id, time: a.time, totalMinutes };
  });
}

async function getAppointmentDurationMinutes(appointmentId) {
  const { data: items, error } = await supabase
    .from("appointment_items")
    .select("service_id, qty")
    .eq("appointment_id", appointmentId);

  if (error) throw error;

  const durationById = await getDurationByServiceId();
  return (items || []).reduce((sum, it) => {
    const duration = durationById.get(it.service_id) || 0;
    return sum + duration * (it.qty || 1);
  }, 0);
}

async function getClientMap(userIds) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const map = new Map();

  await Promise.all(
    uniqueIds.map(async (uid) => {
      try {
        const { data, error } = await supabase.auth.admin.getUserById(uid);
        if (error || !data?.user) {
          map.set(uid, {
            id: uid,
            email: "",
            phone: null,
            name: "Cliente",
          });
          return;
        }

        const user = data.user;
        const email = user.email || "";
        const metadata = user.user_metadata || {};
        const name =
          metadata.full_name ||
          metadata.name ||
          (email ? email.split("@")[0] : "Cliente");
        const phone = metadata.phone || null;

        map.set(uid, {
          id: uid,
          email,
          phone,
          name,
        });
      } catch {
        map.set(uid, {
          id: uid,
          email: "",
          phone: null,
          name: "Cliente",
        });
      }
    })
  );

  return map;
}
async function getAppointmentSnapshot(appointmentId) {
  const { data: appt, error: apptErr } = await supabase
    .from("appointments")
    .select("id, user_id, date, time, payment_method, notes, status, admin_notes, created_at")
    .eq("id", appointmentId)
    .single();

  if (apptErr || !appt) return null;

  const { data: items, error: itemsErr } = await supabase
    .from("appointment_items")
    .select("service_id, qty")
    .eq("appointment_id", appointmentId);

  if (itemsErr) throw itemsErr;

  const serviceIds = [...new Set((items || []).map((i) => i.service_id))];
  let services = [];

  if (serviceIds.length) {
    const { data: s, error: sErr } = await supabase
      .from("services")
      .select("id, name, duration")
      .in("id", serviceIds);

    if (sErr) throw sErr;
    services = s || [];
  }

  const serviceMap = new Map(
    services.map((s) => [s.id, { name: s.name, duration: Number(s.duration) || 0 }])
  );

  const clientMap = await getClientMap([appt.user_id]);
  const client =
    clientMap.get(appt.user_id) || {
      id: appt.user_id,
      email: "",
      phone: null,
      name: "Cliente",
    };

  const parsedItems = (items || []).map((it) => {
    const service = serviceMap.get(it.service_id) || { name: "Serviço removido", duration: 0 };
    const qty = it.qty || 1;
    return {
      serviceId: it.service_id,
      serviceName: service.name,
      duration: service.duration,
      qty,
      subtotalMinutes: service.duration * qty,
    };
  });

  const totalDuration = parsedItems.reduce((sum, i) => sum + i.subtotalMinutes, 0);

  return {
    id: appt.id,
    userId: appt.user_id,
    date: appt.date,
    time: appt.time,
    paymentMethod: appt.payment_method,
    notes: appt.notes,
    status: appt.status || "aguardando",
    adminNotes: appt.admin_notes || null,
    createdAt: appt.created_at,
    client,
    items: parsedItems,
    totalDuration,
  };
}

async function writeAdminAudit({
  action,
  appointmentId,
  actor,
  targetUserId,
  beforeData,
  afterData = null,
}) {
  const actorEmail = actor?.email || "";
  const actorName =
    actor?.user_metadata?.full_name ||
    actor?.user_metadata?.name ||
    (actorEmail ? actorEmail.split("@")[0] : "Admin");

  const { error } = await supabase.from("admin_audit_logs").insert({
    action,
    appointment_id: appointmentId || null,
    actor_user_id: actor?.id,
    actor_email: actorEmail,
    actor_name: actorName,
    target_user_id: targetUserId || null,
    before_data: beforeData,
    after_data: afterData,
  });

  if (error) {
    console.error("writeAdminAudit error:", error);
  }
}


async function buildAdminScheduleForDate(date) {
  const { data: appointments, error: apptErr } = await supabase
    .from("appointments")
    .select("id, user_id, date, time, payment_method, notes, status, admin_notes, created_at")
    .eq("date", date)
    .order("time", { ascending: true });

  if (apptErr) throw apptErr;
  if (!appointments || appointments.length === 0) return [];

  const appointmentIds = appointments.map((a) => a.id);

  const { data: apptItems, error: itemsErr } = await supabase
    .from("appointment_items")
    .select("appointment_id, service_id, qty")
    .in("appointment_id", appointmentIds);

  if (itemsErr) throw itemsErr;

  const serviceIds = [...new Set((apptItems || []).map((i) => i.service_id))];

  const { data: services, error: serviceErr } = await supabase
    .from("services")
    .select("id, name, duration")
    .in("id", serviceIds.length ? serviceIds : ["__none__"]);

  if (serviceErr) throw serviceErr;

  const serviceMap = new Map();
  for (const s of services || []) {
    serviceMap.set(s.id, {
      id: s.id,
      name: s.name,
      duration: Number(s.duration) || 0,
    });
  }

  const itemsByAppt = new Map();
  for (const item of apptItems || []) {
    const arr = itemsByAppt.get(item.appointment_id) || [];
    arr.push(item);
    itemsByAppt.set(item.appointment_id, arr);
  }

  const clientMap = await getClientMap(appointments.map((a) => a.user_id));

  return appointments.map((appt) => {
    const items = (itemsByAppt.get(appt.id) || []).map((it) => {
      const service = serviceMap.get(it.service_id) || {
        id: it.service_id,
        name: "Serviço removido",
        duration: 0,
      };

      const qty = it.qty || 1;
      const subtotalMinutes = service.duration * qty;

      return {
        serviceId: service.id,
        serviceName: service.name,
        duration: service.duration,
        qty,
        subtotalMinutes,
      };
    });

    const totalDuration = items.reduce((sum, i) => sum + i.subtotalMinutes, 0);
    const client = clientMap.get(appt.user_id) || {
      id: appt.user_id,
      email: "",
      phone: null,
      name: "Cliente",
    };

    return {
      id: appt.id,
      date: appt.date,
      time: appt.time,
      paymentMethod: appt.payment_method,
      notes: appt.notes,
      status: appt.status || "aguardando",
      adminNotes: appt.admin_notes || null,
      createdAt: appt.created_at,
      client,
      items,
      totalDuration,
    };
  });
}

/* =========================
   HEALTH / ROOT
========================= */
app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) => {
  res.send("API FIX BARBEARIA rodando.");
});

/* =========================
   SERVICES
========================= */
app.get("/services", async (req, res) => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("category", { ascending: true });

  if (error) {
    console.error("Supabase /services error:", error);
    return res.status(500).json({ message: "Erro ao buscar serviços." });
  }

  return res.json(data || []);
});

/* =========================
   AVAILABILITY
========================= */
app.get("/availability", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string" || !isValidDateStr(date)) {
      return res
        .status(400)
        .json({ message: "Parâmetro 'date' inválido (YYYY-MM-DD)." });
    }

    const blocks = await getExistingBlocksForDate(date);
    return res.json({ date, blocks: blocks.map((b) => ({ time: b.time, totalMinutes: b.totalMinutes })) });
  } catch (err) {
    console.error("GET /availability unexpected error:", err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

/* =========================
   APPOINTMENTS (CLIENT)
========================= */
app.post("/appointments", requireAuth, async (req, res) => {
  try {
    let { items, date, time, paymentMethod, notes, clientName, clientPhone } = req.body || {};
    const userId = req.user.id;

    const normalizedClientName = normalizeClientName(clientName);
    const normalizedClientPhone = normalizeClientPhone(clientPhone);

    paymentMethod = normalizePaymentMethod(paymentMethod);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Carrinho vazio." });
    }

    if (!date || !time || !isValidDateStr(date) || !isValidTimeStr(time)) {
      return res.status(400).json({ message: "Data/hora inválidas." });
    }

    if (!["online", "presencial"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Método de pagamento inválido." });
    }

    const validIds = await getValidServiceIds();
    for (const it of items) {
      if (!it?.serviceId || !validIds.has(it.serviceId)) {
        return res.status(400).json({ message: "Serviço inválido no carrinho." });
      }
      if (!Number.isInteger(it.qty) || it.qty < 1 || it.qty > 10) {
        return res.status(400).json({ message: "Quantidade inválida." });
      }
    }

    const durationById = await getDurationByServiceId();
    const requestedMinutes = items.reduce((sum, it) => {
      const dur = durationById.get(it.serviceId) || 0;
      return sum + dur * it.qty;
    }, 0);

    if (requestedMinutes <= 0) {
      return res.status(400).json({ message: "Duração inválida para os serviços selecionados." });
    }

    const reqStart = toMinutes(time);
    const reqEnd = reqStart + requestedMinutes;

    const existing = await getExistingBlocksForDate(date);
    for (const a of existing) {
      const aStart = toMinutes(a.time);
      const aEnd = aStart + (a.totalMinutes || 0);
      if (overlaps(reqStart, reqEnd, aStart, aEnd)) {
        return res.status(409).json({ message: "Este horário conflita com outro agendamento." });
      }
    }

    // Keep auth metadata synced so admin schedule/clients screens always have customer identity.
    if (normalizedClientName || normalizedClientPhone) {
      const currentMeta = req.user.user_metadata || {};
      const nextMeta = { ...currentMeta };

      if (normalizedClientName) {
        nextMeta.name = normalizedClientName;
        if (!nextMeta.full_name) nextMeta.full_name = normalizedClientName;
      }

      if (normalizedClientPhone) nextMeta.phone = normalizedClientPhone;

      const metaChanged =
        nextMeta.name !== currentMeta.name ||
        nextMeta.full_name !== currentMeta.full_name ||
        nextMeta.phone !== currentMeta.phone;

      if (metaChanged) {
        const { error: updateMetaError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: nextMeta,
        });

        if (updateMetaError) {
          console.error("POST /appointments metadata update error:", updateMetaError);
        }
      }
    }

    const { data: appt, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        user_id: userId,
        date,
        time,
        payment_method: paymentMethod,
        notes: normalizeNotes(notes),
        status: "aguardando",
      })
      .select("id, date, time, payment_method, notes, status, admin_notes, created_at")
      .single();

    if (apptErr) {
      console.error("Supabase insert appointments error:", apptErr);
      return res.status(409).json({ message: "Este horário já está reservado." });
    }

    const rows = items.map((it) => ({
      appointment_id: appt.id,
      service_id: it.serviceId,
      qty: it.qty,
    }));

    const { error: itemsErr } = await supabase.from("appointment_items").insert(rows);
    if (itemsErr) {
      console.error("Supabase insert appointment_items error:", itemsErr);
      await supabase.from("appointments").delete().eq("id", appt.id);
      return res.status(400).json({ message: "Itens inválidos no agendamento." });
    }

    return res.status(201).json({
      id: appt.id,
      date: appt.date,
      time: appt.time,
      paymentMethod: appt.payment_method,
      notes: appt.notes ?? undefined,
      status: appt.status || "aguardando",
      adminNotes: appt.admin_notes ?? undefined,
      createdAt: appt.created_at,
      items,
    });
  } catch (err) {
    console.error("POST /appointments unexpected error:", err);
    return res.status(500).json({ message: "Erro interno ao criar agendamento." });
  }
});

app.get("/my-appointments", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id, date, time, payment_method, notes, status, admin_notes, created_at,
        appointment_items(service_id, qty)
      `)
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      console.error("Supabase /my-appointments error:", error);
      return res.status(500).json({ message: "Erro ao buscar seus agendamentos." });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("GET /my-appointments unexpected error:", err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

/* =========================
   ADMIN
========================= */
app.get("/admin/me", requireAuth, requireAdmin, async (req, res) => {
  const email = req.user?.email || "";
  const metadata = req.user?.user_metadata || {};

  const barberName =
    metadata.full_name ||
    metadata.name ||
    (email ? email.split("@")[0] : "Barbeiro");

  return res.json({
    barberName,
    email,
  });
});

app.get("/admin/schedule", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string" || !isValidDateStr(date)) {
      return res.status(400).json({ message: "Parâmetro 'date' inválido (YYYY-MM-DD)." });
    }

    const appointments = await buildAdminScheduleForDate(date);
    return res.json({ date, appointments });
  } catch (err) {
    console.error("GET /admin/schedule error:", err);
    return res.status(500).json({ message: "Erro ao buscar agenda do dia." });
  }
});

app.get("/admin/month-summary", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || typeof month !== "string" || !MONTH_RE.test(month)) {
      return res.status(400).json({ message: "Parâmetro 'month' inválido (YYYY-MM)." });
    }

    const { startDate, endDate } = monthRange(month);

    const { data, error } = await supabase
      .from("appointments")
      .select("date")
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      console.error("GET /admin/month-summary supabase error:", error);
      return res.status(500).json({ message: "Erro ao buscar resumo mensal." });
    }

    const counter = {};
    for (const row of data || []) {
      const d = row.date;
      counter[d] = (counter[d] || 0) + 1;
    }

    const days = Object.keys(counter)
      .sort()
      .map((date) => ({ date, count: counter[date] }));

    return res.json({ month, days });
  } catch (err) {
    console.error("GET /admin/month-summary error:", err);
    return res.status(500).json({ message: "Erro ao buscar resumo mensal." });
  }
});

app.patch("/admin/appointments/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { date, time, status, adminNotes } = req.body || {};

    if (!date && !time && status === undefined && adminNotes === undefined) {
      return res.status(400).json({ message: "Envie ao menos um campo para atualizar." });
    }

    if (date && !isValidDateStr(date)) {
      return res.status(400).json({ message: "Data inválida (YYYY-MM-DD)." });
    }

    if (time && !isValidTimeStr(time)) {
      return res.status(400).json({ message: "Hora inválida (HH:mm)." });
    }

    let normalizedStatus = undefined;
    if (status !== undefined) {
      normalizedStatus = normalizeAdminStatus(status);
      if (!normalizedStatus) {
        return res.status(400).json({ message: "Status inválido. Use aguardando ou concluido." });
      }
    }

    let normalizedAdminNotes = undefined;
    if (adminNotes !== undefined) {
      normalizedAdminNotes = typeof adminNotes === "string" && adminNotes.trim() ? adminNotes.trim() : null;
    }

    const beforeSnapshot = await getAppointmentSnapshot(appointmentId);
    if (!beforeSnapshot) {
      return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    const newDate = date || beforeSnapshot.date;
    const newTime = time || beforeSnapshot.time;

    const requestedMinutes = beforeSnapshot.totalDuration || 0;
    if (requestedMinutes <= 0) {
      return res.status(400).json({ message: "Agendamento sem duração válida." });
    }

    const reqStart = toMinutes(newTime);
    const reqEnd = reqStart + requestedMinutes;

    const existing = await getExistingBlocksForDate(newDate, appointmentId);
    for (const a of existing) {
      const aStart = toMinutes(a.time);
      const aEnd = aStart + (a.totalMinutes || 0);
      if (overlaps(reqStart, reqEnd, aStart, aEnd)) {
        return res.status(409).json({ message: "Novo horário conflita com outro agendamento." });
      }
    }

    const { error: updErr } = await supabase
      .from("appointments")
      .update({ date: newDate, time: newTime, ...(normalizedStatus !== undefined ? { status: normalizedStatus } : {}), ...(normalizedAdminNotes !== undefined ? { admin_notes: normalizedAdminNotes } : {}) })
      .eq("id", appointmentId);

    if (updErr) {
      console.error("PATCH /admin/appointments update error:", updErr);
      return res.status(500).json({ message: "Erro ao atualizar agendamento." });
    }

    const afterSnapshot = await getAppointmentSnapshot(appointmentId);

    await writeAdminAudit({
      action: "UPDATE_APPOINTMENT",
      appointmentId,
      actor: req.user,
      targetUserId: beforeSnapshot.userId,
      beforeData: beforeSnapshot,
      afterData: afterSnapshot,
    });

    return res.json(afterSnapshot);
  } catch (err) {
    console.error("PATCH /admin/appointments/:id error:", err);
    return res.status(500).json({ message: "Erro interno." });
  }
});


app.delete("/admin/appointments/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const beforeSnapshot = await getAppointmentSnapshot(appointmentId);
    if (!beforeSnapshot) {
      return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    const { error: itemsErr } = await supabase
      .from("appointment_items")
      .delete()
      .eq("appointment_id", appointmentId);

    if (itemsErr) {
      console.error("DELETE appointment_items error:", itemsErr);
      return res.status(500).json({ message: "Erro ao remover itens do agendamento." });
    }

    const { data: deleted, error: delErr } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentId)
      .select("id")
      .single();

    if (delErr || !deleted) {
      return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    await writeAdminAudit({
      action: "DELETE_APPOINTMENT",
      appointmentId,
      actor: req.user,
      targetUserId: beforeSnapshot.userId,
      beforeData: beforeSnapshot,
      afterData: null,
    });

    return res.status(204).send();
  } catch (err) {
    console.error("DELETE /admin/appointments/:id error:", err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

app.get("/admin/audit-logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const action = typeof req.query.action === "string" ? req.query.action : "";

    let query = supabase
      .from("admin_audit_logs")
      .select(
        "id, action, appointment_id, actor_user_id, actor_email, actor_name, target_user_id, before_data, after_data, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) {
      query = query.eq("action", action);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("GET /admin/audit-logs error:", error);
      return res.status(500).json({ message: "Erro ao buscar histórico." });
    }

    return res.json({
      items: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET /admin/audit-logs unexpected error:", err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

app.get("/admin/clients", requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 500);

    const { data: rows, error } = await supabase
      .from("appointments")
      .select("user_id, date, time")
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) {
      console.error("GET /admin/clients appointments error:", error);
      return res.status(500).json({ message: "Erro ao buscar clientes." });
    }

    const agg = new Map();
    for (const r of rows || []) {
      if (!r.user_id) continue;
      const key = r.user_id;
      if (!agg.has(key)) {
        agg.set(key, {
          userId: key,
          totalAppointments: 0,
          lastAppointmentDate: `${r.date} ${r.time}`,
        });
      }
      const item = agg.get(key);
      item.totalAppointments += 1;

      const currentLast = item.lastAppointmentDate || "";
      const incoming = `${r.date} ${r.time}`;
      if (incoming > currentLast) item.lastAppointmentDate = incoming;
    }

    const userIds = [...agg.keys()];
    const clientMap = await getClientMap(userIds);

    const clients = userIds.map((uid) => {
      const base = agg.get(uid);
      const c = clientMap.get(uid) || {
        id: uid,
        email: "",
        phone: null,
        name: "Cliente",
      };

      return {
        userId: uid,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalAppointments: base.totalAppointments,
        lastAppointmentDate: base.lastAppointmentDate,
      };
    });

    clients.sort((a, b) =>
      String(b.lastAppointmentDate || "").localeCompare(String(a.lastAppointmentDate || ""))
    );

    return res.json({
      items: clients.slice(0, limit),
      total: clients.length,
      limit,
    });
  } catch (err) {
    console.error("GET /admin/clients unexpected error:", err);
    return res.status(500).json({ message: "Erro interno." });
  }
});
app.get("/admin/clients/:userId/appointments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: appts, error: apptErr } = await supabase
      .from("appointments")
      .select("id, user_id, date, time, payment_method, notes, status, admin_notes, created_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (apptErr) {
      console.error("GET /admin/clients/:userId/appointments appointments error:", apptErr);
      return res.status(500).json({ message: "Erro ao buscar agendamentos do cliente." });
    }

    if (!appts || appts.length === 0) {
      return res.json({ items: [] });
    }

    const appointmentIds = appts.map((a) => a.id);

    const { data: apptItems, error: itemsErr } = await supabase
      .from("appointment_items")
      .select("appointment_id, service_id, qty")
      .in("appointment_id", appointmentIds);

    if (itemsErr) {
      console.error("GET client appointments items error:", itemsErr);
      return res.status(500).json({ message: "Erro ao buscar itens dos agendamentos." });
    }

    const serviceIds = [...new Set((apptItems || []).map((i) => i.service_id))];
    let serviceMap = new Map();

    if (serviceIds.length) {
      const { data: services, error: sErr } = await supabase
        .from("services")
        .select("id, name, duration")
        .in("id", serviceIds);

      if (sErr) {
        console.error("GET client appointments services error:", sErr);
        return res.status(500).json({ message: "Erro ao buscar serviços." });
      }

      serviceMap = new Map(
        (services || []).map((s) => [s.id, { name: s.name, duration: Number(s.duration) || 0 }])
      );
    }

    const itemsByAppt = new Map();
    for (const it of apptItems || []) {
      const arr = itemsByAppt.get(it.appointment_id) || [];
      arr.push(it);
      itemsByAppt.set(it.appointment_id, arr);
    }

    const items = appts.map((appt) => {
      const rawItems = itemsByAppt.get(appt.id) || [];
      const parsedItems = rawItems.map((it) => {
        const s = serviceMap.get(it.service_id) || { name: "Serviço removido", duration: 0 };
        const qty = it.qty || 1;
        return {
          serviceId: it.service_id,
          serviceName: s.name,
          duration: s.duration,
          qty,
          subtotalMinutes: s.duration * qty,
        };
      });

      const totalDuration = parsedItems.reduce((sum, i) => sum + i.subtotalMinutes, 0);

      return {
        id: appt.id,
        date: appt.date,
        time: appt.time,
        paymentMethod: appt.payment_method,
        notes: appt.notes,
        status: appt.status || "aguardando",
        adminNotes: appt.admin_notes || null,
        createdAt: appt.created_at,
        items: parsedItems,
        totalDuration,
      };
    });

    return res.json({ items });
  } catch (err) {
    console.error("GET /admin/clients/:userId/appointments unexpected error:", err);
    return res.status(500).json({ message: "Erro interno." });
  }
});



/* =========================
   START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
