import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart2, AlertTriangle, Check, Edit, X, Clock, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getReservasHoy, getReservasEntre, getBarberos, cambiarEstadoReserva, type ReservaCompleta } from "../../lib/queries";

// ─── Helpers ──────────────────────────────────────────────
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const dayShort = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  confirmada: { label: "Confirmada", bg: "rgba(46,125,91,0.1)",   color: "#2E7D5B" },
  pendiente:  { label: "Pendiente",  bg: "rgba(200,150,60,0.1)",  color: "#C8963C" },
  completada: { label: "Completada", bg: "rgba(107,142,212,0.1)", color: "#6B8ED4" },
  cancelada:  { label: "Cancelada",  bg: "rgba(122,115,103,0.1)", color: "#7A7367" },
  "no-show":  { label: "No-show",    bg: "rgba(192,57,43,0.1)",   color: "#C0392B" },
};

export default function AdminDashboard() {
  const [loading, setLoading]         = useState(true);
  const [reservasHoy, setReservasHoy] = useState<ReservaCompleta[]>([]);
  const [reservasSem, setReservasSem] = useState<ReservaCompleta[]>([]);
  const [totalBarberos, setTotalBarberos] = useState(0);
  const [accionando, setAccionando]   = useState<string | null>(null);

  async function cargarTodo() {
    try {
      const hoy = new Date();
      const hace6 = new Date(); hace6.setDate(hace6.getDate() - 6);

      const [hoyR, semR, barberos] = await Promise.all([
        getReservasHoy(),
        getReservasEntre(toYMD(hace6), toYMD(hoy)),
        getBarberos(),
      ]);

      setReservasHoy(hoyR);
      setReservasSem(semR);
      setTotalBarberos(barberos.length);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargarTodo(); }, []);

  async function handleCambiarEstado(id: string, estado: ReservaCompleta["estado"]) {
    setAccionando(id);
    try {
      await cambiarEstadoReserva(id, estado);
      await cargarTodo();
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado");
    } finally {
      setAccionando(null);
    }
  }

  // ─── Cálculos de KPIs ─────────────────────────────────
  const activasHoy = reservasHoy.filter(r => ["confirmada", "completada"].includes(r.estado));

  const reservasHoyCount = reservasHoy.length;
  const ingresosHoy      = activasHoy.reduce((s, r) => s + r.precio, 0);

  // Ocupación: minutos ocupados / minutos disponibles (10h por barbero = 600 min)
  const minutosOcupados    = activasHoy.reduce((s, r) => s + r.duracion, 0);
  const minutosDisponibles = totalBarberos * 600;
  const ocupacion          = minutosDisponibles > 0 ? Math.round((minutosOcupados / minutosDisponibles) * 100) : 0;

  const noShows = reservasSem.filter(r => r.estado === "no-show").length;

  // ─── Datos del gráfico semanal ────────────────────────
  const weekData = (() => {
    const days: { day: string; revenue: number }[] = [];
    const hoy = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(hoy.getDate() - i);
      const ymd = toYMD(d);
      const revenue = reservasSem
        .filter(r => r.fecha === ymd && ["confirmada", "completada"].includes(r.estado))
        .reduce((s, r) => s + r.precio, 0);
      days.push({ day: dayShort[d.getDay()], revenue });
    }
    return days;
  })();

  // ─── Top servicios ────────────────────────────────────
  const topServicios = (() => {
    const map = new Map<string, { nombre: string; count: number }>();
    reservasSem.forEach(r => {
      if (!r.servicio) return;
      const prev = map.get(r.servicio.id);
      if (prev) prev.count += 1;
      else map.set(r.servicio.id, { nombre: r.servicio.nombre, count: 1 });
    });
    const arr = Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 4);
    const max = arr[0]?.count ?? 1;
    return arr.map(s => ({ ...s, pct: Math.round((s.count / max) * 100) }));
  })();

  const kpis = [
    { label: "Reservas hoy",    value: String(reservasHoyCount), trend: "hoy", sub: "en agenda",        icon: Users,         color: "#C8963C" },
    { label: "Ingresos hoy",    value: `$${ingresosHoy.toLocaleString("es-CL")}`, trend: "confirmadas", sub: "y completadas", icon: DollarSign, color: "#2E7D5B" },
    { label: "Ocupación",       value: `${ocupacion}%`,          trend: `${minutosOcupados} min`, sub: "de capacidad",  icon: BarChart2,     color: "#6B8ED4" },
    { label: "No-shows (7d)",   value: String(noShows),           trend: "últimos 7 días", sub: "",         icon: AlertTriangle, color: "#C0392B" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" size={32} style={{ color: "#C8963C" }} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded border p-5" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
            <div className="flex items-start justify-between mb-4">
              <p className="font-mono text-xs tracking-widest uppercase opacity-40" style={{ color: "#EDE8DE" }}>{k.label}</p>
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${k.color}15` }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
            </div>
            <p className="font-display text-3xl font-semibold mb-2" style={{ color: "#EDE8DE", fontStyle: "italic" }}>
              {k.value}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-medium" style={{ color: k.color }}>{k.trend}</span>
              {k.sub && <span className="font-mono text-xs opacity-30" style={{ color: "#EDE8DE" }}>{k.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Gráfico semanal */}
        <div className="xl:col-span-2 rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-medium italic" style={{ color: "#EDE8DE" }}>Ingresos últimos 7 días</h3>
              <p className="font-mono text-xs opacity-30 mt-0.5 tracking-wider" style={{ color: "#EDE8DE" }}>
                CONFIRMADAS + COMPLETADAS
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} style={{ color: "#2E7D5B" }} />
              <span className="font-mono text-xs" style={{ color: "#2E7D5B" }}>
                ${weekData.reduce((s, d) => s + d.revenue, 0).toLocaleString("es-CL")}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1B17" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7A7367", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v/1000}k`} tick={{ fontSize: 10, fill: "#7A7367", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString("es-CL")}`, "Ingresos"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #2A261F", backgroundColor: "#131210", fontSize: 12, color: "#EDE8DE" }} />
              <Bar dataKey="revenue" fill="#C8963C" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top servicios */}
        <div className="rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <h3 className="font-display font-medium italic mb-6" style={{ color: "#EDE8DE" }}>Top servicios</h3>
          {topServicios.length === 0 ? (
            <p className="font-mono text-xs opacity-30 text-center py-8" style={{ color: "#EDE8DE" }}>
              SIN DATOS AÚN
            </p>
          ) : (
            <div className="space-y-5">
              {topServicios.map(s => (
                <div key={s.nombre}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: "#EDE8DE" }}>{s.nombre}</span>
                    <span className="font-mono text-xs opacity-40" style={{ color: "#EDE8DE" }}>{s.count}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1B17" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: "#C8963C" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reservas de hoy */}
      <div className="rounded border overflow-hidden" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1B17" }}>
          <h3 className="font-display font-medium italic" style={{ color: "#EDE8DE" }}>Reservas de hoy</h3>
          <span className="font-mono text-xs px-2.5 py-1 rounded-sm" style={{ backgroundColor: "rgba(200,150,60,0.1)", color: "#C8963C" }}>
            {reservasHoyCount} reservas
          </span>
        </div>
        {reservasHoy.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display italic text-lg opacity-30 mb-1" style={{ color: "#EDE8DE" }}>
              No hay reservas hoy
            </p>
            <p className="font-mono text-xs opacity-20" style={{ color: "#EDE8DE" }}>
              Las nuevas reservas aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#0F0D0B" }}>
                  {["Hora","Cliente","Servicio","Barbero","Estado","Acciones"].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-mono text-[10px] tracking-widest uppercase opacity-30" style={{ color: "#EDE8DE" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservasHoy.map(r => {
                  const st = statusConfig[r.estado];
                  const hora = r.hora_inicio.slice(0, 5);
                  const initials = r.cliente?.nombre.split(" ").map(w => w[0]).join("").slice(0, 2) ?? "??";
                  return (
                    <tr key={r.id} className="border-t transition-colors hover:bg-[#0F0D0B]" style={{ borderColor: "#1E1B17" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "#C8963C" }}>
                          <Clock size={12} />{hora}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-display italic flex-shrink-0" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
                            {initials}
                          </div>
                          <span className="text-sm" style={{ color: "#EDE8DE" }}>{r.cliente?.nombre ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs opacity-50" style={{ color: "#EDE8DE" }}>{r.servicio?.nombre ?? "—"}</td>
                      <td className="px-5 py-4 text-xs opacity-50" style={{ color: "#EDE8DE" }}>
                        {r.barbero ? `${r.barbero.nombre} ${r.barbero.apellido[0]}.` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2 py-1 rounded-sm font-mono text-[10px] tracking-wider"
                              style={{ backgroundColor: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {accionando === r.id ? (
                            <Loader2 size={14} className="animate-spin" style={{ color: "#C8963C" }} />
                          ) : (
                            <>
                              <button onClick={() => handleCambiarEstado(r.id, "completada")}
                                      title="Marcar completada"
                                      className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17] transition-colors">
                                <Check size={13} style={{ color: "#2E7D5B" }} />
                              </button>
                              <button onClick={() => handleCambiarEstado(r.id, "cancelada")}
                                      title="Cancelar"
                                      className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17] transition-colors">
                                <X size={13} style={{ color: "#C0392B" }} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}