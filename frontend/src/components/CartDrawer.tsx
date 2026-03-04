import { useEffect, useState, type FormEvent } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "../context/CartContext";
import { validateBookingForm, type ValidationError } from "../utils/validation";
import { TIME_SLOTS } from "../data/services";
import { getAvailability } from "../services/availabilityApi";
import { useAuth } from "../auth/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatBRL } from "../lib/utils";

// Drawer keeps booking/cart logic intact with refreshed premium styling.

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentUI = "online" | "cash"; // "cash" = presencial (UI antiga)
type PaymentAPI = "online" | "presencial";
function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}


function expandBlocksToSlots(blocks: { time: string; totalMinutes: number }[]) {
  const out = new Set<string>();
  for (const b of blocks) {
    const steps = Math.ceil((b.totalMinutes || 0) / 30); // slots de 30min
    for (let i = 0; i < Math.max(1, steps); i++) {
      out.add(addMinutes(b.time, i * 30));
    }
  }
  return out;
}


export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
  const { items, removeItem, updateQuantity, getTotal, createOrder } = useCart();

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentUI>("cash");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const BOOKING_DRAFT_KEY = "fix_booking_draft";

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw) as {
        bookingDate?: string;
        bookingTime?: string;
        paymentMethod?: "online" | "cash";
        notes?: string;
      };

      if (draft.bookingDate) setBookingDate(draft.bookingDate);
      if (draft.bookingTime) setBookingTime(draft.bookingTime);
      if (draft.paymentMethod === "cash" || draft.paymentMethod === "online") {
        setPaymentMethod(draft.paymentMethod);
      }
      if (typeof draft.notes === "string") setNotes(draft.notes);

      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
    } catch {
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
    }
  }, []);

useEffect(() => {
  let alive = true;

  async function loadAvailability() {
    if (!bookingDate) {
      setBookedTimes([]);
      return;
    }

    try {
      setLoadingTimes(true);

      const data = await getAvailability(bookingDate);

      const blockedSet = expandBlocksToSlots(data.blocks || []);
      const blockedArr = Array.from(blockedSet);

      if (alive) {
        setBookedTimes(blockedArr);

        // Se o horário selecionado ficou ocupado, limpa
        if (bookingTime && blockedSet.has(bookingTime)) {
          setBookingTime("");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar disponibilidade:", error);
      if (alive) setBookedTimes([]);
    } finally {
      if (alive) setLoadingTimes(false);
    }
  }

  loadAvailability();

  return () => {
    alive = false;
  };
}, [bookingDate, bookingTime]);



  // Base URL da API: se quiser, coloque no .env do Vite:
  // VITE_API_BASE_URL=http://localhost:3000
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const paymentToApi = (p: PaymentUI): PaymentAPI =>
    p === "cash" ? "presencial" : "online";

  const handleBooking = async (e: FormEvent) => {
  e.preventDefault();

  const validationErrors = validateBookingForm(
    bookingDate,
    bookingTime,
    paymentMethod,
    notes
  );

  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    return;
  }

  if (items.length === 0) {
    setErrors([{ field: "items", message: "Seu carrinho está vazio." }]);
    return;
  }

  setIsSubmitting(true);
  setErrors([]);

  try {
    if (!user?.id) {
      setErrors([{ field: "api", message: "Faça login para concluir o agendamento." }]);
      navigate("/login", { state: { from: location } });
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setErrors([{ field: "api", message: "Sessão inválida. Faça login novamente." }]);
      return;
    }

    const payload = {
      items: items.map((i) => ({
        serviceId: i.serviceId,
        qty: i.quantity,
      })),
      date: bookingDate,
      time: bookingTime,
      paymentMethod: paymentToApi(paymentMethod),
      notes: notes?.trim() ? notes.trim() : undefined,
    };

    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let msg = "Não foi possível criar o agendamento.";
      try {
        const data = await response.json();
        if (data?.message) msg = data.message;
      } catch {}
      setErrors([{ field: "api", message: msg }]);
      return;
    }

    const order = createOrder({
      date: bookingDate,
      time: bookingTime,
      paymentMethod,
      notes: notes || undefined,
    });

    if (order) {
      setOrderCreated(true);

      setBookingDate("");
      setBookingTime("");
      setPaymentMethod("cash");
      setNotes("");

      setTimeout(() => {
        setOrderCreated(false);
        onClose();
      }, 3000);
    }
  } catch (err) {
    console.error("Erro ao enviar agendamento:", err);
    setErrors([
      {
        field: "api",
        message: "Falha de conexão com o servidor. Verifique backend e URL da API.",
      },
    ]);
  } finally {
    setIsSubmitting(false);
  }
};


  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const hasError = (field: string) => errors.some((err) => err.field === field);
  const getErrorMessage = (field: string) =>
    errors.find((err) => err.field === field)?.message;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative ml-auto w-full max-w-md h-full glass-card rounded-none border-l shadow-2xl flex flex-col overflow-hidden">
        <div className="sticky top-0 bg-background/60 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-foreground tracking-wide">
            Carrinho
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-foreground/80" />
          </button>
        </div>

        {orderCreated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-green-500 mb-4">
              <svg
                className="h-16 w-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2 tracking-wide">
              Agendamento Confirmado!
            </h3>
            <p className="text-muted-foreground">
              Sua reserva foi criada com sucesso. Aguarde confirmação via WhatsApp.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-muted-foreground mb-4">
                Seu carrinho está vazio
              </p>
              <button
                onClick={onClose}
                className="text-foreground font-semibold hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.serviceId}
                  className="glass-card p-4 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground">
                        {item.serviceName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatBRL(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.serviceId)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.serviceId, Math.max(1, item.quantity - 1))
                      }
                      className="px-2 py-1 bg-secondary rounded hover:bg-secondary/80 transition-colors"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                      className="px-2 py-1 bg-secondary rounded hover:bg-secondary/80 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4 mt-4">
                <form onSubmit={handleBooking} className="space-y-4">
                  {/* Erro de API (se existir) */}
                  {hasError("api") && (
                    <p className="text-red-500 text-sm">{getErrorMessage("api")}</p>
                  )}

                  <div>
                    <label className="block text-sm font-display font-semibold text-foreground mb-2 tracking-wide">
                      Data do Agendamento
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className={`w-full px-3 py-2 bg-background/40 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                        hasError("date") ? "border-destructive" : "border-input"
                      }`}
                    />
                    {hasError("date") && (
                      <p className="text-red-500 text-xs mt-1">
                        {getErrorMessage("date")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-foreground mb-2 tracking-wide">
                      Horário
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      disabled={!bookingDate || loadingTimes}
                      className={`w-full px-3 py-2 bg-background/40 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                        hasError("time") ? "border-destructive" : "border-input"
                      }`}
                    >
                      <option value="">
                        {loadingTimes ? "Carregando horários..." : "Selecione um horário"}
                      </option>

                      {TIME_SLOTS.map((slot) => {
                        const isBooked = bookedTimes.includes(slot);

                        return (
                          <option key={slot} value={slot} disabled={isBooked}>
                            {slot}
                            {isBooked ? " (ocupado)" : ""}
                          </option>
                        );
                      })}
                    </select>

                    {hasError("time") && (
                      <p className="text-red-500 text-xs mt-1">
                        {getErrorMessage("time")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-foreground mb-2 tracking-wide">
                      Método de Pagamento
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentUI)}
                          className="w-4 h-4"
                        />
                        <span className="text-foreground">
                          Pagamento Presencial
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="online"
                          checked={paymentMethod === "online"}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentUI)}
                          className="w-4 h-4"
                        />
                        <span className="text-foreground">
                          Pagamento Online
                        </span>
                      </label>
                    </div>

                    {hasError("paymentMethod") && (
                      <p className="text-red-500 text-xs mt-1">
                        {getErrorMessage("paymentMethod")}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-foreground mb-2 tracking-wide">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Algo específico que gostaria?"
                      maxLength={500}
                      className="w-full px-3 py-2 bg-background/40 border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {notes.length}/500 caracteres
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full font-display tracking-wider"
                  >
                    {isSubmitting ? "Processando..." : "Confirmar Agendamento"}
                  </Button>
</form>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background/60 backdrop-blur-md border-t border-border p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-display font-semibold text-foreground tracking-wide">
                  Total:
                </span>
                <span className="text-2xl font-display font-bold text-foreground tracking-wide">
                  {formatBRL(getTotal())}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
