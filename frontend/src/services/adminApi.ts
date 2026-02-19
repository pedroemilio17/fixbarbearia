import { supabase } from "../lib/supabase";
import { apiFetch } from "./api";

export type AdminAppointmentItem = {
  serviceId: string;
  serviceName: string;
  duration: number;
  qty: number;
  subtotalMinutes: number;
};

export type AdminAppointment = {
  id: string;
  date: string;
  time: string;
  notes: string | null;
  paymentMethod: "online" | "presencial";
  createdAt: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: AdminAppointmentItem[];
  totalDuration: number;
};

export type AdminAuditLog = {
  id: string;
  action: "UPDATE_APPOINTMENT" | "DELETE_APPOINTMENT";
  appointment_id: string | null;
  actor_user_id: string;
  actor_email: string;
  actor_name: string | null;
  target_user_id: string | null;
  before_data: any;
  after_data: any | null;
  created_at: string;
};

export type AdminClientSummary = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  totalAppointments: number;
  lastAppointmentDate: string | null;
};

export type AdminClientAppointment = {
  id: string;
  date: string;
  time: string;
  paymentMethod: "online" | "presencial";
  notes: string | null;
  createdAt: string;
  items: AdminAppointmentItem[];
  totalDuration: number;
};

type AdminScheduleResponse = {
  date: string;
  appointments: AdminAppointment[];
};

type AdminMonthSummaryResponse = {
  month: string;
  days: { date: string; count: number }[];
};

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");

  return { Authorization: `Bearer ${token}` };
}

export async function getAdminMe() {
  return apiFetch<{ barberName: string; email: string }>("/admin/me", {
    headers: await getAuthHeaders(),
  });
}

export async function getAdminSchedule(date: string) {
  return apiFetch<AdminScheduleResponse>(`/admin/schedule?date=${encodeURIComponent(date)}`, {
    headers: await getAuthHeaders(),
  });
}

export async function getAdminMonthSummary(month: string) {
  return apiFetch<AdminMonthSummaryResponse>(
    `/admin/month-summary?month=${encodeURIComponent(month)}`,
    { headers: await getAuthHeaders() }
  );
}

export async function updateAdminAppointment(
  id: string,
  payload: { date?: string; time?: string }
) {
  return apiFetch(`/admin/appointments/${id}`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminAppointment(id: string) {
  return apiFetch(`/admin/appointments/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });
}

export async function getAdminAuditLogs(params?: {
  limit?: number;
  offset?: number;
  action?: "UPDATE_APPOINTMENT" | "DELETE_APPOINTMENT";
}) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  if (params?.action) qs.set("action", params.action);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<{ items: AdminAuditLog[]; total: number; limit: number; offset: number }>(
    `/admin/audit-logs${suffix}`,
    { headers: await getAuthHeaders() }
  );
}

export async function getAdminClients(params?: { limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return apiFetch<{ items: AdminClientSummary[]; total: number; limit: number }>(
    `/admin/clients${suffix}`,
    { headers: await getAuthHeaders() }
  );
}

export async function getAdminClientAppointments(userId: string) {
  return apiFetch<{ items: AdminClientAppointment[] }>(
    `/admin/clients/${encodeURIComponent(userId)}/appointments`,
    { headers: await getAuthHeaders() }
  );
}
