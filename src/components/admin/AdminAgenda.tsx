import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, MessageCircle, X, Check, Edit, RotateCcw,
  Loader2, Plus, AlertCircle, Phone, User as UserIcon, Scissors, Coffee, Ban,
} from "lucide-react";
import {
  getBarberos, getServicios, getReservasEntre, cambiarEstadoReserva, crearReserva,
  getBloqueosEnFecha, getDiaSemana,
  normalizarTelefono, validarTelefono,
  type Barbero, type ReservaCompleta, type Servicio, type BloqueoBarbero,
} from "../../lib/queries";
import SelectorTelefono from "../SelectorTelefono";

const SLOT = 60;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 9);

const dayShort   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const monthShort = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatearFecha(d: Date): string {
  return `${dayShort[d.getDay()]} ${d.getDate()} ${monthShort[d.getMonth()]} ${d.getFullYear()}`;
}

function formatearTelefono(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits[0]} ${digits.slice(1)}`;
  return `${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`;
}

const STATUS_COLORS: Record<string, string> = {
  confirmada: "#2E7D5B",
  pendiente:  "#C8963C",
  completada: "#6B8ED4",
  cancelada:  "#7A7367",
  "no-show":  "#C0392B",
};

type EstadoSlot = "disponible" | "no-trabaja" | "fuera-horario" | "almuerzo" | "bloqueo";

interface InfoSlot {
  estado: EstadoSlot;
  motivo?: string;
}

/** Determina si un barbero puede atender en cierta hora del día */
function getEstadoSlot(
  barbero: Barbero,
  hora: number,
  fecha: Date,
  bloqueosDelDia: BloqueoBarbero[]
): InfoSlot {
  const dia = getDiaSemana(fecha);
  const horario = barbero.horarios?.[dia];

  if (!horario) return { estado: "no-trabaja" };
  if (!horario.activo) return { estado: "no-trabaja" };

  const horaStr = `${String(hora).padStart(2, "0")}:00`;
  const horaFin = `${String(hora + 1).padStart(2, "0")}:00`;

  // Fuera de horario
  if (horaStr < horario.abre || horaStr >= horario.cierra) {
    return { estado: "fuera-horario" };
  }

  // Almuerzo
  if (horario.almuerzo?.activo) {
    if (horaStr < horario.almuerzo.cierra && horaFin > horario.almuerzo.abre) {
      return { estado: "almuerzo" };
    }
  }

  // Bloqueos
  const bloqueosBarbero = bloqueosDelDia.filter(b => b.barbero_id === barbero.id);
  for (const b of bloqueosBarbero) {
    if (!b.hora_inicio && !b.hora_fin) {
      return { estado: "bloqueo", motivo: b.motivo ?? "Bloqueado" };
    }
    if (b.hora_inicio && b.hora_fin) {
      if (horaStr < b.hora_fin && horaFin > b.hora_inicio) {
        return { estado: "bloqueo", motivo: b.motivo ?? "Bloqueado" };
      }
    }
  }

  return { estado: "disponible" };
}

interface ModalNuevaReserva {
  open: boolean;
  barbero: Barbero | null;
  hora: string | null;
}

export default function AdminAgenda() {
  const [barberos, setBarberos]     = useState<Barbero[]>([]);
  const [servicios, setServicios]   = useState<Servicio[]>([]);
  const [reservas, setReservas]     = useState<ReservaCompleta[]>([]);
  const [bloqueos, setBloqueos]     = useState<BloqueoBarbero[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter]         = useState(-1);
  const [selected, setSelected]     = useState<ReservaCompleta | null>(null);
  const [loading, setLoading]       = useState(true);
  const [accionando, setAccionando] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalNuevaReserva>({ open: false, barbero: null, hora: null });
  const [form, setForm] = useState({ nombre: "", phone: "", codigoPais: "56", servicioId: "", notas: "" });
  const [creando, setCreando]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function cargarReservas(fecha: Date) {
    setLoading(true);
    try {
      const ymd = toYMD(fecha);
      const [r, b] = await Promise.all([
        getReservasEntre(ymd, ymd),
        getBloqueosEnFecha(ymd),
      ]);
      setReservas(r);
      setBloqueos(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([getBarberos(), getServicios()])
      .then(([b, s]) => { setBarberos(b); setServicios(s); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    cargarReservas(selectedDate);
  }, [selectedDate]);

  function cambiarDia(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
    setSelected(null);
  }

  function irHoy() {
    setSelectedDate(new Date());
    setSelected(null);
  }

  async function handleAccion(id: string, estado: ReservaCompleta["estado"]) {
    setAccionando(id);
    try {
      await cambiarEstadoReserva(id, estado);
      await cargarReservas(selectedDate);
      setSelected(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado");
    } finally {
      setAccionando(null);
    }
  }

  function abrirModal(barbero: Barbero, hora: number) {
    setModal({ open: true, barbero, hora: `${String(hora).padStart(2, "0")}:00` });
    setForm({ nombre: "", phone: "", codigoPais: "56", servicioId: servicios[0]?.id ?? "", notas: "" });
    setFormError(null);
  }

  function cerrarModal() {
    setModal({ open: false, barbero: null, hora: null });
    setFormError(null);
  }

  async function handleCrearManual() {
    if (!modal.barbero || !modal.hora) return;
    const servicio = servicios.find(s => s.id === form.servicioId);
    if (!servicio) { setFormError("Elige un servicio"); return; }
    if (form.nombre.trim().length < 2) { setFormError("Ingresa el nombre del cliente"); return; }
    const validacion = validarTelefono(form.codigoPais, form.phone);
    if (!validacion.valido) { setFormError(validacion.error ?? "Teléfono inválido"); return; }

    setCreando(true); setFormError(null);
    try {
      await crearReserva({
        nombreCliente:   form.nombre.trim(),
        telefonoCliente: normalizarTelefono(form.codigoPais, form.phone),
        barberoId:       modal.barbero.id,
        servicioId:      servicio.id,
        fecha:           toYMD(selectedDate),
        horaInicio:      modal.hora,
        duracion:        servicio.duracion,
        precio:          servicio.precio,
        notas:           form.notas.trim() || undefined,
      });
      cerrarModal();
      await cargarReservas(selectedDate);
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("reservas_slot_unico") || msg.includes("duplicate key")) setFormError("Ese horario ya fue reservado.");
      else if (msg.includes("2 reservas activas")) setFormError("Este teléfono ya tiene 2 reservas activas.");
      else if (msg.includes("fuera del horario")) setFormError("Fuera del horario del barbero.");
      else if (msg.includes("almuerzo")) setFormError("Es horario de almuerzo del barbero.");
      else if (msg.includes("no trabaja")) setFormError("El barbero no trabaja ese día.");
      else if (msg.includes("bloqueo")) setFormError("El barbero tiene un bloqueo en ese horario.");
      else setFormError(msg || "Error al crear la reserva");
    } finally {
      setCreando(false);
    }
  }

  const now = new Date();
  const esHoy = selectedDate.toDateString() === now.toDateString();
  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const nowTop = (nowH - 9) * SLOT + (nowM / 60) * SLOT;
  const showNow = esHoy && nowH >= 9 && nowH < 21;

  const columnas = filter === -1 ? barberos : [barberos[filter]].filter(Boolean);

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => cambiarDia(-1)}
                    className="p-1.5 rounded border hover:border-[#C8963C] transition-all"
                    style={{ borderColor: "#1E1B17" }}>
              <ChevronLeft size={14} style={{ color: "#7A7367" }} />
            </button>
            <span className="font-display italic text-sm" style={{ color: "#EDE8DE" }}>
              {formatearFecha(selectedDate)}
            </span>
            {esHoy && (
              <span className="font-mono text-xs px-2 py-1 rounded-sm"
                    style={{ backgroundColor: "rgba(200,150,60,0.1)", color: "#C8963C" }}>
                Hoy
              </span>
            )}
            {!esHoy && (
              <button onClick={irHoy} className="font-mono text-xs opacity-40 hover:opacity-80"
                      style={{ color: "#C8963C" }}>
                ir a hoy
              </button>
            )}
            <button onClick={() => cambiarDia(1)}
                    className="p-1.5 rounded border hover:border-[#C8963C] transition-all"
                    style={{ borderColor: "#1E1B17" }}>
              <ChevronRight size={14} style={{ color: "#7A7367" }} />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto overflow-x-auto scrollbar-hide max-w-full pb-1">
            <button onClick={() => setFilter(-1)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-sm font-mono text-xs tracking-wider transition-all"
                    style={{
                      backgroundColor: filter === -1 ? "#C8963C" : "transparent",
                      color: filter === -1 ? "#0A0907" : "#7A7367",
                      border: `1px solid ${filter === -1 ? "#C8963C" : "#1E1B17"}`,
                    }}>
              TODOS
            </button>
            {barberos.map((b, i) => (
              <button key={b.id} onClick={() => setFilter(filter === i ? -1 : i)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs tracking-wider transition-all whitespace-nowrap"
                      style={{
                        backgroundColor: filter === i ? b.color : "transparent",
                        color: filter === i ? "#0A0907" : "#7A7367",
                        border: `1px solid ${filter === i ? b.color : "#1E1B17"}`,
                      }}>
                <img src={b.foto_url ?? ""} alt={b.nombre} className="w-3.5 h-3.5 rounded-full object-cover" />
                {b.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 mb-3 text-[10px] font-mono tracking-wider opacity-60 flex-wrap"
             style={{ color: "#EDE8DE" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(30,27,23,0.5)", border: "1px dashed #2A261F" }} />
            No trabaja / fuera de horario
          </div>
          <div className="flex items-center gap-1.5">
            <Coffee size={11} style={{ color: "#6B8ED4" }} /> Almuerzo
          </div>
          <div className="flex items-center gap-1.5">
            <Ban size={11} style={{ color: "#C0392B" }} /> Bloqueo
          </div>
        </div>

        {/* Grid */}
        <div className="rounded border overflow-hidden" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <div className="flex border-b sticky top-0 z-10" style={{ borderColor: "#1E1B17", backgroundColor: "#0F0D0B" }}>
            <div className="w-12 flex-shrink-0 border-r" style={{ borderColor: "#1E1B17" }} />
            {columnas.map(b => (
              <div key={b.id} className="flex-1 px-3 py-3 flex items-center gap-2 border-r last:border-r-0"
                   style={{ borderColor: "#1E1B17" }}>
                <img src={b.foto_url ?? ""} alt={b.nombre}
                     className="w-6 h-6 rounded-full object-cover flex-shrink-0 grayscale opacity-70" />
                <span className="text-xs font-medium" style={{ color: "#EDE8DE" }}>{b.nombre}</span>
                <span className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
              </div>
            ))}
          </div>

          <div className="relative overflow-y-auto" style={{ maxHeight: 560 }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-30"
                   style={{ backgroundColor: "rgba(19,18,16,0.7)" }}>
                <Loader2 className="animate-spin" size={28} style={{ color: "#C8963C" }} />
              </div>
            )}

            {showNow && (
              <div className="absolute left-12 right-0 z-20 flex items-center pointer-events-none"
                   style={{ top: nowTop }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#C0392B" }} />
                <div className="flex-1 h-px" style={{ backgroundColor: "#C0392B", opacity: 0.6 }} />
              </div>
            )}

            {HOURS.map(h => (
              <div key={h} className="flex border-b" style={{ borderColor: "#1A1714", height: SLOT }}>
                <div className="w-12 flex-shrink-0 flex items-start justify-center pt-1 border-r"
                     style={{ borderColor: "#1A1714" }}>
                  <span className="font-mono text-[10px] opacity-30" style={{ color: "#EDE8DE" }}>{h}:00</span>
                </div>
                {columnas.map(b => {
                  const info = getEstadoSlot(b, h, selectedDate, bloqueos);
                  const colReservas = reservas.filter(r =>
                    r.barbero?.id === b.id &&
                    parseInt(r.hora_inicio.slice(0, 2)) === h &&
                    !["cancelada", "no-show"].includes(r.estado)
                  );
                  const hayReserva = colReservas.length > 0;
                  const puedeAgregar = info.estado === "disponible" && !hayReserva;

                  return (
                    <div key={b.id} className="flex-1 relative border-r last:border-r-0 group"
                         style={{ borderColor: "#1A1714" }}>

                      {/* Fondo según estado */}
                      {info.estado === "no-trabaja" && (
                        <div className="absolute inset-0"
                             style={{ backgroundColor: "rgba(15,13,11,0.5)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(42,38,31,0.15) 8px, rgba(42,38,31,0.15) 16px)" }} />
                      )}
                      {info.estado === "fuera-horario" && (
                        <div className="absolute inset-0" style={{ backgroundColor: "rgba(15,13,11,0.35)" }} />
                      )}
                      {info.estado === "almuerzo" && (
                        <div className="absolute inset-0 flex items-center justify-center"
                             style={{ backgroundColor: "rgba(107,142,212,0.06)" }}>
                          <div className="flex items-center gap-1 opacity-40">
                            <Coffee size={12} style={{ color: "#6B8ED4" }} />
                            <span className="font-mono text-[9px] tracking-wider" style={{ color: "#6B8ED4" }}>
                              ALMUERZO
                            </span>
                          </div>
                        </div>
                      )}
                      {info.estado === "bloqueo" && (
                        <div className="absolute inset-0 flex items-center justify-center px-2"
                             style={{ backgroundColor: "rgba(192,57,43,0.08)" }}>
                          <div className="flex items-center gap-1 max-w-full">
                            <Ban size={12} style={{ color: "#C0392B" }} className="flex-shrink-0" />
                            <span className="font-mono text-[9px] tracking-wider truncate" style={{ color: "#C0392B" }}>
                              {info.motivo}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Reservas */}
                      {colReservas.map(r => {
                        const startMin = parseInt(r.hora_inicio.slice(3, 5));
                        const top = (startMin / 60) * SLOT;
                        const height = Math.max((r.duracion / 60) * SLOT, 28);
                        const color = STATUS_COLORS[r.estado] ?? b.color;
                        return (
                          <button key={r.id} onClick={() => setSelected(r)}
                                  className="absolute left-1 right-1 rounded px-2 py-1.5 text-left transition-all hover:brightness-125 overflow-hidden"
                                  style={{ top, height, backgroundColor: `${color}25`, borderLeft: `2px solid ${color}`, zIndex: 5 }}>
                            <p className="text-xs font-medium truncate" style={{ color }}>{r.cliente?.nombre ?? "—"}</p>
                            {height > 34 && (
                              <p className="text-[10px] truncate opacity-70" style={{ color }}>{r.servicio?.nombre ?? "—"}</p>
                            )}
                          </button>
                        );
                      })}

                      {/* Botón + en slot disponible */}
                      {puedeAgregar && (
                        <button onClick={() => abrirModal(b, h)}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1E1B17]"
                                title={`Agregar reserva para ${b.nombre} a las ${h}:00`}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center border"
                               style={{ borderColor: "#C8963C", backgroundColor: "rgba(200,150,60,0.08)" }}>
                            <Plus size={14} style={{ color: "#C8963C" }} />
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel lateral */}
      {selected && (
        <div className="w-72 flex-shrink-0">
          <div className="rounded border p-5" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs tracking-widest opacity-40" style={{ color: "#EDE8DE" }}>DETALLE</span>
              <button onClick={() => setSelected(null)} className="opacity-30 hover:opacity-70">
                <X size={16} style={{ color: "#EDE8DE" }} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-display italic"
                   style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
                {(selected.cliente?.nombre ?? "??").split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: "#EDE8DE" }}>{selected.cliente?.nombre ?? "—"}</p>
                <p className="font-mono text-xs opacity-40">{selected.cliente?.telefono ?? "—"}</p>
              </div>
            </div>

            <div>
              {[
                ["Servicio", selected.servicio?.nombre ?? "—"],
                ["Barbero",  selected.barbero ? `${selected.barbero.nombre} ${selected.barbero.apellido}` : "—"],
                ["Hora",     selected.hora_inicio.slice(0, 5)],
                ["Duración", `${selected.duracion} min`],
                ["Precio",   `$${selected.precio.toLocaleString("es-CL")}`],
                ["Estado",   selected.estado],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-3 border-b" style={{ borderColor: "#1E1B17" }}>
                  <span className="font-mono text-[10px] tracking-wider opacity-30" style={{ color: "#EDE8DE" }}>{l}</span>
                  <span className="text-xs capitalize" style={{ color: "#EDE8DE" }}>{v}</span>
                </div>
              ))}
              {selected.notas && (
                <p className="text-xs mt-3 py-3 px-3 rounded opacity-60 leading-relaxed"
                   style={{ backgroundColor: "#1E1B17", color: "#EDE8DE" }}>
                  {selected.notas}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-5">
              {selected.cliente?.telefono && (
                <a href={`https://wa.me/${selected.cliente.telefono.replace(/\D/g, "")}`}
                   target="_blank" rel="noopener noreferrer"
                   className="w-full flex items-center justify-center gap-2 py-3 rounded text-xs font-semibold"
                   style={{ backgroundColor: "#25D366", color: "white" }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}

              {accionando === selected.id ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 size={18} className="animate-spin" style={{ color: "#C8963C" }} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { Icon: Check,     l: "Completar",   c: "#2E7D5B", fn: () => handleAccion(selected.id, "completada") },
                    { Icon: Edit,      l: "Editar",      c: "#7A7367", fn: () => alert("Próximamente") },
                    { Icon: RotateCcw, l: "Reprogramar", c: "#6B8ED4", fn: () => alert("Próximamente") },
                    { Icon: X,         l: "Cancelar",    c: "#C0392B", fn: () => handleAccion(selected.id, "cancelada") },
                  ].map(({ Icon, l, c, fn }) => (
                    <button key={l} onClick={fn}
                            className="flex items-center justify-center gap-1 py-2.5 rounded border font-mono text-[10px] tracking-wider hover:bg-[#1E1B17] transition-colors"
                            style={{ borderColor: "#1E1B17", color: c }}>
                      <Icon size={12} /> {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva reserva */}
      {modal.open && modal.barbero && modal.hora && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: "rgba(0,0,0,0.75)" }} onClick={cerrarModal}>
          <div className="rounded border w-full max-w-md" style={{ backgroundColor: "#131210", borderColor: "#2A261F" }}
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1B17" }}>
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-0.5" style={{ color: "#EDE8DE" }}>
                  Nueva reserva manual
                </p>
                <p className="font-display italic text-lg" style={{ color: "#EDE8DE" }}>
                  {modal.barbero.nombre} · {modal.hora}
                </p>
              </div>
              <button onClick={cerrarModal} className="opacity-30 hover:opacity-70">
                <X size={18} style={{ color: "#EDE8DE" }} />
              </button>
            </div>

            <div className="px-6 py-3 border-b flex items-center gap-2"
                 style={{ borderColor: "#1E1B17", backgroundColor: "#0F0D0B" }}>
              <span className="font-mono text-[10px] tracking-widest uppercase opacity-30" style={{ color: "#EDE8DE" }}>Fecha</span>
              <span className="font-mono text-xs" style={{ color: "#C8963C" }}>{formatearFecha(selectedDate)}</span>
            </div>

            <div className="p-6 space-y-4">
  {formError && (
            <div className="rounded border p-3 flex items-start gap-2 text-xs"
                style={{ borderColor: "#5F2A22", backgroundColor: "rgba(201,85,42,0.08)", color: "#F2B8A0" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{formError}</span>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                  style={{ color: "#EDE8DE" }}><UserIcon size={11} /> Cliente</label>
            <input type="text" value={form.nombre} placeholder="Ej. Juan Pérez"
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full px-4 py-3 rounded border text-sm outline-none bg-transparent"
                  style={{ borderColor: "#2A261F", color: "#EDE8DE" }}
                  onFocus={e => e.target.style.borderColor = "#C8963C"}
                  onBlur={e => e.target.style.borderColor = "#2A261F"} />
          </div>

          <div>
            <label className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                  style={{ color: "#EDE8DE" }}><Phone size={11} /> Teléfono</label>
            <SelectorTelefono
              codigoPais={form.codigoPais}
              numero={form.phone}
              onChangePais={code => setForm(p => ({ ...p, codigoPais: code, phone: "" }))}
              onChangeNumero={n => setForm(p => ({ ...p, phone: n }))}
              borderColor="#2A261F"
              bgColor="#0F0D0B"
              textColor="#EDE8DE"
              mutedColor="#7A7367"
              accentColor="#C8963C"
            />
          </div>

              <div>
                <label className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                       style={{ color: "#EDE8DE" }}><Scissors size={11} /> Servicio</label>
                <select value={form.servicioId}
                        onChange={e => setForm(p => ({ ...p, servicioId: e.target.value }))}
                        className="w-full px-4 py-3 rounded border text-sm outline-none"
                        style={{ borderColor: "#2A261F", backgroundColor: "#0F0D0B", color: "#EDE8DE" }}>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id} style={{ backgroundColor: "#131210" }}>
                      {s.nombre} · ${s.precio.toLocaleString("es-CL")} · {s.duracion}min
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                       style={{ color: "#EDE8DE" }}>Notas (opcional)</label>
                <textarea value={form.notas} rows={2} placeholder="Ej. Cliente habitual"
                          onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                          className="w-full px-4 py-3 rounded border text-sm outline-none bg-transparent resize-none"
                          style={{ borderColor: "#2A261F", color: "#EDE8DE" }}
                          onFocus={e => e.target.style.borderColor = "#C8963C"}
                          onBlur={e => e.target.style.borderColor = "#2A261F"} />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "#1E1B17" }}>
              <button onClick={cerrarModal} disabled={creando}
                      className="flex-1 py-3 rounded border text-xs font-semibold tracking-wider hover:bg-[#1E1B17]"
                      style={{ borderColor: "#2A261F", color: "#7A7367" }}>
                Cancelar
              </button>
              <button onClick={handleCrearManual} disabled={creando}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded text-xs font-semibold tracking-wider"
                      style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: creando ? 0.7 : 1 }}>
                {creando ? <><Loader2 size={14} className="animate-spin" />Creando...</> : <><Check size={14} />Crear reserva</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}