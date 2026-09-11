import { useState, useEffect } from "react";
import { ArrowLeft, Check, Clock, User, Calendar, MessageCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import {
  getServicios, getBarberos, getHorariosOcupados, crearReserva,
  normalizarTelefono, validarTelefono,
  type Servicio, type Barbero,
} from "../lib/queries";
import SelectorTelefono from "./SelectorTelefono";

// ─── Paleta ────────────────────────────────────────────
const C = {
  bg:        "#13110D",
  surface:   "#1C1914",
  border:    "#302A22",
  text:      "#EDE4D3",
  muted:     "#8A7F6D",
  rust:      "#C9552A",
  green:     "#3D5A4A",
  cream:     "#F2E9D8",
};

const timeSlots = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30",
];

const dayNames   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const monthNames = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

interface BookingProps { onBack: () => void }

// ─── Helpers ───────────────────────────────────────────
function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDates() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatearTelefono(input: string): string {
  // Quita todo lo que no sea dígito
  const digits = input.replace(/\D/g, "").slice(0, 9);
  // Formatea: 9 XXXX XXXX
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits[0]} ${digits.slice(1)}`;
  return `${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`;
}

export default function Booking({ onBack }: BookingProps) {
  const [step, setStep] = useState(1);

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberos, setBarberos]   = useState<Barbero[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [selectedBarber, setSelectedBarber]   = useState<Barbero | null>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | null>(null);
  const [selectedTime, setSelectedTime]       = useState<string | null>(null);

  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots]         = useState(false);

  const [form, setForm] = useState({
  name: "", phone: "", email: "", notes: "", whatsapp: true, codigoPais: "56",
});

  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [reservaId, setReservaId] = useState<string | null>(null);

  const dates = getDates();
  const stepLabels = ["Servicio", "Barbero", "Fecha & hora", "Confirmar"];

  // ─── Cargar servicios y barberos ────────────────────
  useEffect(() => {
    Promise.all([getServicios(), getBarberos()])
      .then(([s, b]) => { setServicios(s); setBarberos(b); })
      .catch(err => { console.error(err); setError("No se pudieron cargar los datos"); })
      .finally(() => setLoadingData(false));
  }, []);

  // ─── Cargar horarios ocupados cuando cambia barbero o fecha ────
  useEffect(() => {
    if (!selectedBarber || !selectedDate) return;
    setLoadingSlots(true);
    getHorariosOcupados(selectedBarber.id, toYMD(selectedDate))
      .then(setHorariosOcupados)
      .catch(err => console.error(err))
      .finally(() => setLoadingSlots(false));
  }, [selectedBarber, selectedDate]);

  const canContinue = () => {
  if (step === 1) return selectedService !== null;
  if (step === 2) return selectedBarber !== null;
  if (step === 3) return selectedDate !== null && selectedTime !== null;
  if (step === 4) {
    if (form.name.trim().length === 0) return false;
    const v = validarTelefono(form.codigoPais, form.phone);
    return v.valido;
  }
  return false;
};

  // ─── Confirmar reserva ──────────────────────────────
  async function handleConfirm() {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    setGuardando(true);
    setError(null);

    try {
      const telefonoCompleto = normalizarTelefono(form.codigoPais, form.phone);

      const reserva = await crearReserva({
        nombreCliente:   form.name.trim(),
        telefonoCliente: telefonoCompleto,
        emailCliente:    form.email.trim() || undefined,
        barberoId:       selectedBarber.id,
        servicioId:      selectedService.id,
        fecha:           toYMD(selectedDate),
        horaInicio:      selectedTime,
        duracion:        selectedService.duracion,
        precio:          selectedService.precio,
        notas:           form.notes.trim() || undefined,
      });

      setReservaId(reserva.id);
      setConfirmed(true);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? "Error al guardar la reserva";
      if (msg.includes("reservas_slot_unico") || msg.includes("duplicate key")) {
        setError("Ese horario ya fue reservado. Elige otro.");
        setStep(3);
      } else if (msg.includes("Teléfono inválido")) {
        setError("El teléfono no tiene el formato correcto.");
      } else if (msg.includes("2 reservas activas")) {
        setError("Este teléfono ya tiene 2 reservas activas. Debe esperar o cancelar una.");
      } else if (msg.includes("domingo")) {
        setError("Los domingos no atendemos.");
        setStep(3);
      } else {
        setError(msg);
      }
    } finally {
      setGuardando(false);
    }
  }

  // ─── Pantalla de éxito ─────────────────────────────
  if (confirmed && selectedService && selectedBarber && selectedDate && selectedTime) {
    const fechaStr = `${dayNames[selectedDate.getDay()]} ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`;
    const mensajeWA = encodeURIComponent(
      `Hola! Acabo de reservar:\n\n` +
      `👤 ${form.name}\n` +
      `✂️ ${selectedService.nombre}\n` +
      `💈 ${selectedBarber.nombre} ${selectedBarbero(selectedBarber)}\n` +
      `📅 ${fechaStr} a las ${selectedTime}\n` +
      `💰 $${selectedService.precio.toLocaleString("es-CL")}\n\n` +
      `ID reserva: ${reservaId?.slice(0, 8)}`
    );

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: C.bg }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-8"
               style={{ borderColor: C.rust }}>
            <Check size={36} style={{ color: C.rust }} />
          </div>
          <h1 className="font-display text-4xl font-light mb-3"
              style={{ fontStyle: "italic", color: C.text }}>
            Reserva confirmada
          </h1>
          <p className="text-sm mb-10" style={{ color: C.muted }}>
            Recibirás tu confirmación y recordatorio por WhatsApp.
          </p>

          <div className="rounded border p-6 text-left mb-6"
               style={{ borderColor: C.border, backgroundColor: C.surface }}>
            {[
              { label: "Servicio", value: selectedService.nombre },
              { label: "Barbero",  value: `${selectedBarber.nombre} ${selectedBarber.apellido}` },
              { label: "Fecha",    value: fechaStr },
              { label: "Hora",     value: selectedTime },
              { label: "Duración", value: `${selectedService.duracion} min` },
              { label: "Total",    value: `$${selectedService.precio.toLocaleString("es-CL")}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-3 border-b last:border-0 text-sm"
                   style={{ borderColor: C.border }}>
                <span className="font-mono text-xs tracking-wider uppercase" style={{ color: C.muted }}>{r.label}</span>
                <span className="font-medium" style={{ color: C.text }}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a href={`https://wa.me/56987654321?text=${mensajeWA}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full py-4 rounded text-sm font-semibold"
               style={{ backgroundColor: "#25D366", color: "white" }}>
              <MessageCircle size={16} /> Compartir por WhatsApp
            </a>
            <button className="flex items-center justify-center gap-2 w-full py-4 rounded text-sm font-semibold border"
                    style={{ borderColor: C.border, color: C.text }}>
              <Calendar size={16} /> Agregar a Google Calendar
            </button>
            <button onClick={onBack}
                    className="text-sm mt-2 opacity-40 hover:opacity-70 transition-opacity"
                    style={{ color: C.text }}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading inicial ────────────────────────────────
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <Loader2 className="animate-spin" size={32} style={{ color: C.rust }} />
      </div>
    );
  }

  // ─── Wizard ─────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: C.bg, color: C.text }}>

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b"
           style={{ borderColor: C.border, backgroundColor: "rgba(19,17,13,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
                    className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70 opacity-50"
                    style={{ color: C.text }}>
              <ArrowLeft size={15} /> {step === 1 ? "Volver" : "Anterior"}
            </button>
            <div className="flex items-center gap-2">
              {stepLabels.map((l, i) => (
                <span key={i} className="font-mono text-xs tracking-wider transition-all"
                      style={{
                        color: i + 1 === step ? C.rust : "#3A3630",
                        opacity: i + 1 === step ? 1 : i + 1 < step ? 0.5 : 0.25,
                      }}>
                  {i + 1 < step ? "✓" : `0${i + 1}`} {i + 1 === step ? l : ""}
                </span>
              ))}
            </div>
          </div>
          <div className="h-px w-full" style={{ backgroundColor: C.border }}>
            <div className="h-px transition-all duration-500"
                 style={{ width: `${(step / 4) * 100}%`, backgroundColor: C.rust }} />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12">

        {/* Error global */}
        {error && (
          <div className="mb-6 rounded border p-4 flex items-start gap-3 text-sm"
               style={{ borderColor: "#5F2A22", backgroundColor: "rgba(201,85,42,0.08)", color: "#F2B8A0" }}>
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* PASO 1: Servicio */}
        {step === 1 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 01</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle: "italic" }}>
              Elige tu servicio
            </h2>
            <div>
              {servicios.map((s) => (
                <button key={s.id} onClick={() => setSelectedService(s)}
                        className="w-full flex items-center gap-4 py-5 border-b text-left transition-all group"
                        style={{ borderColor: C.border }}>
                  <span className="font-mono text-xs w-6 flex-shrink-0 transition-colors"
                        style={{ color: selectedService?.id === s.id ? C.rust : "#3A3630" }}>
                    {s.icono}
                  </span>
                  <span className="font-display text-xl font-light italic flex-1 transition-colors"
                        style={{ color: selectedService?.id === s.id ? C.rust : C.text }}>
                    {s.nombre}
                  </span>
                  <span className="font-mono text-xs opacity-40">{s.duracion} min</span>
                  <span className="font-display text-xl font-semibold transition-colors"
                        style={{ color: selectedService?.id === s.id ? C.rust : C.text }}>
                    ${s.precio.toLocaleString("es-CL")}
                  </span>
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all"
                       style={{
                         borderColor: selectedService?.id === s.id ? C.rust : "#3A3630",
                         backgroundColor: selectedService?.id === s.id ? C.rust : "transparent",
                       }}>
                    {selectedService?.id === s.id && <Check size={11} style={{ color: C.bg }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Barbero */}
        {step === 2 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 02</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle: "italic" }}>
              Elige tu barbero
            </h2>
            <div className="space-y-3">
              {barberos.map((b) => (
                <button key={b.id} onClick={() => setSelectedBarber(b)}
                        className="w-full text-left p-5 rounded border flex items-center gap-4 transition-all"
                        style={{
                          borderColor: selectedBarber?.id === b.id ? C.rust : C.border,
                          backgroundColor: selectedBarber?.id === b.id ? "rgba(201,85,42,0.05)" : C.surface,
                        }}>
                  <img src={b.foto_url ?? ""} alt={b.nombre}
                       className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                       style={{ filter: "sepia(10%)" }} />
                  <div className="flex-1">
                    <p className="font-display italic text-xl font-light mb-0.5" style={{ color: C.text }}>
                      {b.nombre} {b.apellido}
                    </p>
                    <p className="font-mono text-xs opacity-50">{b.especialidad}</p>
                    <span className="inline-block mt-1.5 font-mono text-xs px-2 py-0.5 rounded-sm"
                          style={{ backgroundColor: "rgba(61,90,74,0.15)", color: "#6FA884" }}>
                      disponible
                    </span>
                  </div>
                  {selectedBarber?.id === b.id && <Check size={16} style={{ color: C.rust }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: Fecha y hora */}
        {step === 3 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 03</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle: "italic" }}>
              Fecha y hora
            </h2>
            <p className="font-mono text-xs mb-5 opacity-30 tracking-wider">HORA CHILE · GMT-3</p>

            {/* Fechas */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-10">
              {dates.map((d, i) => {
                const sel = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button key={i} onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                          className="flex-shrink-0 w-14 rounded flex flex-col items-center justify-center py-3 border transition-all"
                          style={{
                            borderColor: sel ? C.rust : C.border,
                            backgroundColor: sel ? "rgba(201,85,42,0.08)" : "transparent",
                          }}>
                    <span className="font-mono text-xs mb-1 opacity-50" style={{ color: sel ? C.rust : C.text }}>
                      {i === 0 ? "HOY" : dayNames[d.getDay()]}
                    </span>
                    <span className="font-display text-xl font-semibold" style={{ color: sel ? C.rust : C.text }}>
                      {d.getDate()}
                    </span>
                    <span className="font-mono text-xs mt-1 opacity-30" style={{ color: C.text }}>
                      {monthNames[d.getMonth()]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Horas */}
            <p className="font-mono text-xs tracking-widest uppercase mb-4 opacity-40">
              Horarios disponibles
              {loadingSlots && <Loader2 size={11} className="inline ml-2 animate-spin" />}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map(t => {
                const ocupado = horariosOcupados.some(h => h.slice(0, 5) === t);
                const sel     = selectedTime === t;
                return (
                  <button key={t} onClick={() => !ocupado && setSelectedTime(t)} disabled={ocupado}
                          className="py-3 rounded border font-mono text-xs transition-all"
                          style={{
                            borderColor: sel ? C.rust : ocupado ? "#1E1B17" : C.border,
                            backgroundColor: sel ? "rgba(201,85,42,0.1)" : "transparent",
                            color: sel ? C.rust : ocupado ? "#3A3630" : C.text,
                            cursor: ocupado ? "not-allowed" : "pointer",
                            textDecoration: ocupado ? "line-through" : "none",
                          }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 4: Confirmar */}
        {step === 4 && selectedService && selectedBarber && selectedDate && selectedTime && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 04</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle: "italic" }}>
              Confirmar reserva
            </h2>

            <div className="rounded border p-5 mb-8" style={{ borderColor: C.border, backgroundColor: C.surface }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-xl italic font-light" style={{ color: C.text }}>
                  {selectedService.nombre}
                </span>
                <span className="font-display text-xl font-semibold" style={{ color: C.rust }}>
                  ${selectedService.precio.toLocaleString("es-CL")}
                </span>
              </div>
              <div className="flex gap-6 mt-3 pt-3 border-t flex-wrap" style={{ borderColor: C.border }}>
                <span className="font-mono text-xs opacity-40">
                  {selectedBarber.nombre} {selectedBarber.apellido}
                </span>
                <span className="font-mono text-xs opacity-40">
                  {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                </span>
                <span className="font-mono text-xs opacity-40">{selectedTime}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs tracking-wider uppercase mb-2 opacity-40">
                  Nombre completo
                </label>
                <input type="text" placeholder="Ej. Juan Pérez"
                       value={form.name}
                       onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                       className="w-full px-4 py-3.5 rounded border text-sm outline-none transition-all bg-transparent"
                       style={{ borderColor: C.border, color: C.text }}
                       onFocus={e => e.target.style.borderColor = C.rust}
                       onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              <div>
                <label className="block font-mono text-xs tracking-wider uppercase mb-2 opacity-40">
                  Teléfono
                  </label>
                  <SelectorTelefono
                  codigoPais={form.codigoPais}
                  numero={form.phone}
                  onChangePais={code => setForm(p => ({ ...p, codigoPais: code, phone: "" }))}
                  onChangeNumero={n => setForm(p => ({ ...p, phone: n }))}
                  borderColor={C.border}
                  bgColor={C.surface}
                  textColor={C.text}
                  mutedColor={C.muted}
                  accentColor={C.rust}
                  />
                </div>
              <div>
                <label className="block font-mono text-xs tracking-wider uppercase mb-2 opacity-40">
                  Email (opcional)
                </label>
                <input type="email" placeholder="tu@email.com"
                       value={form.email}
                       onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                       className="w-full px-4 py-3.5 rounded border text-sm outline-none bg-transparent"
                       style={{ borderColor: C.border, color: C.text }}
                       onFocus={e => e.target.style.borderColor = C.rust}
                       onBlur={e => e.target.style.borderColor = C.border} />
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase mb-2 opacity-40">
                  Notas (opcional)
                </label>
                <textarea placeholder="Ej. Dejar los laterales cortos..."
                          value={form.notes}
                          onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-4 py-3.5 rounded border text-sm outline-none resize-none bg-transparent"
                          style={{ borderColor: C.border, color: C.text }}
                          rows={3}
                          onFocus={e => e.target.style.borderColor = C.rust}
                          onBlur={e => e.target.style.borderColor = C.border} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.whatsapp}
                       onChange={e => setForm(prev => ({ ...prev, whatsapp: e.target.checked }))}
                       className="mt-1" style={{ accentColor: C.rust }} />
                <span className="text-sm opacity-50" style={{ color: C.text }}>
                  Acepto recibir recordatorio por WhatsApp 24h antes
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t p-4 z-40"
           style={{ borderColor: C.border, backgroundColor: "rgba(19,17,13,0.97)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {selectedService ? (
            <div>
              <p className="font-mono text-xs opacity-30 tracking-wider">TOTAL</p>
              <p className="font-display text-2xl font-semibold" style={{ color: C.rust }}>
                ${selectedService.precio.toLocaleString("es-CL")}
              </p>
            </div>
          ) : <div />}
          <button
            onClick={() => step < 4 ? setStep(s => s + 1) : handleConfirm()}
            disabled={!canContinue() || guardando}
            className="flex items-center gap-2 px-8 py-4 rounded text-sm font-semibold tracking-wide transition-all"
            style={{
              backgroundColor: canContinue() && !guardando ? C.rust : C.border,
              color: canContinue() && !guardando ? C.bg : "#3A3630",
              cursor: canContinue() && !guardando ? "pointer" : "not-allowed",
            }}>
            {guardando ? (
              <><Loader2 size={16} className="animate-spin" /> Guardando...</>
            ) : (
              <>{step < 4 ? "Continuar" : "Confirmar reserva"} <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper para formatear apellido en WhatsApp
function selectedBarbero(b: Barbero): string {
  return b.apellido;
}