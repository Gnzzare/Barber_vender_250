import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Download, Loader2, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getReservasEntre, getBarberos, type ReservaCompleta, type Barbero } from "../../lib/queries";

const dayShort = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const monthShort = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

const COLORS = ["#C8963C", "#6B8ED4", "#2E7D5B", "#8B6BD4", "#C0392B", "#7A7367"];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatearCorto(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  return `${parseInt(d)} ${monthShort[parseInt(m) - 1]}`;
}

const tsCfg = { borderRadius: 8, border: "1px solid #2A261F", backgroundColor: "#131210", fontSize: 11, color: "#EDE8DE" };

export default function AdminReports() {
  const [loading, setLoading]       = useState(true);
  const [reservas, setReservas]     = useState<ReservaCompleta[]>([]);
  const [barberos, setBarberos]     = useState<Barbero[]>([]);
  const [diasAtras, setDiasAtras]   = useState(30);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      try {
        const hoy = new Date();
        const desde = new Date();
        desde.setDate(hoy.getDate() - diasAtras);

        const [r, b] = await Promise.all([
          getReservasEntre(toYMD(desde), toYMD(hoy)),
          getBarberos(),
        ]);
        setReservas(r);
        setBarberos(b);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [diasAtras]);

  // ─── KPIs ────────────────────────────────────────────
  const completadas = useMemo(
    () => reservas.filter(r => ["confirmada", "completada"].includes(r.estado)),
    [reservas]
  );

  const ingresosTotales  = completadas.reduce((s, r) => s + r.precio, 0);
  const reservasTotales  = reservas.length;
  const ticketPromedio   = completadas.length > 0 ? Math.round(ingresosTotales / completadas.length) : 0;
  const noShows          = reservas.filter(r => r.estado === "no-show").length;
  const tasaNoShow       = reservasTotales > 0 ? ((noShows / reservasTotales) * 100).toFixed(1) : "0.0";

  // ─── Serie temporal ──────────────────────────────────
  const serieDiaria = useMemo(() => {
    const map = new Map<string, number>();
    const hoy = new Date();
    for (let i = diasAtras; i >= 0; i--) {
      const d = new Date(); d.setDate(hoy.getDate() - i);
      map.set(toYMD(d), 0);
    }
    completadas.forEach(r => {
      const actual = map.get(r.fecha) ?? 0;
      map.set(r.fecha, actual + r.precio);
    });
    return Array.from(map.entries()).map(([fecha, ingresos]) => ({
      fecha: formatearCorto(fecha),
      ingresos,
    }));
  }, [completadas, diasAtras]);

  // ─── Por servicio ────────────────────────────────────
  const porServicio = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    completadas.forEach(r => {
      if (!r.servicio) return;
      const prev = map.get(r.servicio.id);
      if (prev) prev.value += 1;
      else map.set(r.servicio.id, { name: r.servicio.nombre, value: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [completadas]);

  // ─── Por barbero ─────────────────────────────────────
  const porBarbero = useMemo(() => {
    return barberos.map(b => {
      const rs = completadas.filter(r => r.barbero?.id === b.id);
      return {
        id: b.id,
        name: `${b.nombre} ${b.apellido[0]}.`,
        revenue: rs.reduce((s, r) => s + r.precio, 0),
        count: rs.length,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [completadas, barberos]);

  // ─── Horas pico ──────────────────────────────────────
  const horasPico = useMemo(() => {
    const dias = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    const horas = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00"];
    const grid: Record<string, number> = {};

    completadas.forEach(r => {
      const d = new Date(r.fecha + "T00:00:00");
      const diaIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Lun=0 ... Dom=6
      const h = parseInt(r.hora_inicio.slice(0, 2));
      const hStr = `${String(h).padStart(2, "0")}:00`;
      if (!horas.includes(hStr)) return;
      const key = `${dias[diaIdx]}-${hStr}`;
      grid[key] = (grid[key] ?? 0) + 1;
    });

    const max = Math.max(1, ...Object.values(grid));

    return { grid, max, dias, horas };
  }, [completadas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" size={28} style={{ color: "#C8963C" }} />
      </div>
    );
  }

  const kpis = [
    { label: "Ingresos totales", value: `$${ingresosTotales.toLocaleString("es-CL")}`, trend: "periodo", up: true },
    { label: "Reservas totales", value: String(reservasTotales), trend: "incl. canceladas", up: true },
    { label: "Ticket promedio",  value: `$${ticketPromedio.toLocaleString("es-CL")}`, trend: "por reserva", up: true },
    { label: "Tasa no-shows",    value: `${tasaNoShow}%`, trend: `${noShows} casos`, up: false },
  ];

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {[
            { l: "7 días",  v: 7 },
            { l: "30 días", v: 30 },
            { l: "90 días", v: 90 },
          ].map(f => (
            <button key={f.v} onClick={() => setDiasAtras(f.v)}
                    className="px-3 py-2 rounded-sm font-mono text-xs tracking-wider transition-all"
                    style={{
                      backgroundColor: diasAtras === f.v ? "#C8963C" : "#131210",
                      color: diasAtras === f.v ? "#0A0907" : "#7A7367",
                      border: `1px solid ${diasAtras === f.v ? "#C8963C" : "#1E1B17"}`,
                    }}>
              {f.l}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded border font-mono text-xs tracking-wider hover:border-[#C8963C] transition-all"
                style={{ borderColor: "#1E1B17", color: "#7A7367" }}>
          <Download size={13} /> EXPORTAR
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded border p-5" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-30 mb-3" style={{ color: "#EDE8DE" }}>
              {k.label}
            </p>
            <p className="font-display italic text-2xl font-semibold mb-2" style={{ color: "#EDE8DE" }}>{k.value}</p>
            <div className="flex items-center gap-1.5">
              {k.up ? <TrendingUp size={11} style={{ color: "#2E7D5B" }} />
                    : <TrendingDown size={11} style={{ color: "#C0392B" }} />}
              <span className="font-mono text-xs" style={{ color: k.up ? "#2E7D5B" : "#C0392B" }}>{k.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ingresos en el tiempo */}
      <div className="rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
        <h3 className="font-display italic font-medium mb-5" style={{ color: "#EDE8DE" }}>Ingresos en el tiempo</h3>
        {serieDiaria.every(d => d.ingresos === 0) ? (
          <p className="font-mono text-xs opacity-30 text-center py-12" style={{ color: "#EDE8DE" }}>
            SIN DATOS EN ESTE PERIODO
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={serieDiaria}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1B17" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#7A7367", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={v => `$${v/1000}k`} tick={{ fontSize: 10, fill: "#7A7367", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString("es-CL")}`, "Ingresos"]} contentStyle={tsCfg} />
              <Line type="monotone" dataKey="ingresos" stroke="#C8963C" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#C8963C" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Servicio + Barbero */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <h3 className="font-display italic font-medium mb-5" style={{ color: "#EDE8DE" }}>Reservas por servicio</h3>
          {porServicio.length === 0 ? (
            <p className="font-mono text-xs opacity-30 text-center py-12" style={{ color: "#EDE8DE" }}>
              SIN DATOS
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={porServicio} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {porServicio.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => [`${Number(v)} reservas`]} contentStyle={tsCfg} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {porServicio.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs flex-1 opacity-60" style={{ color: "#EDE8DE" }}>{s.name}</span>
                    <span className="font-mono text-xs opacity-40" style={{ color: "#EDE8DE" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <h3 className="font-display italic font-medium mb-5" style={{ color: "#EDE8DE" }}>Rendimiento por barbero</h3>
          {porBarbero.length === 0 ? (
            <p className="font-mono text-xs opacity-30 text-center py-12" style={{ color: "#EDE8DE" }}>
              SIN DATOS
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porBarbero} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1B17" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `$${v/1000}k`}
                       tick={{ fontSize: 10, fill: "#7A7367", fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#7A7367" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString("es-CL")}`, "Ingresos"]} contentStyle={tsCfg} />
                <Bar dataKey="revenue" fill="#C8963C" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Heatmap horas pico */}
      <div className="rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
        <div className="flex items-center gap-3 mb-5">
          <Calendar size={14} style={{ color: "#C8963C" }} />
          <h3 className="font-display italic font-medium" style={{ color: "#EDE8DE" }}>Horas pico</h3>
        </div>
        {Object.keys(horasPico.grid).length === 0 ? (
          <p className="font-mono text-xs opacity-30 text-center py-12" style={{ color: "#EDE8DE" }}>
            SIN DATOS
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3 font-mono text-[9px] opacity-30 tracking-wider" style={{ color: "#EDE8DE" }}>HORA</th>
                  {horasPico.dias.map(d => (
                    <th key={d} className="py-1 px-1 font-mono text-[9px] opacity-30 tracking-wider text-center"
                        style={{ color: "#EDE8DE" }}>{d.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horasPico.horas.map(hora => (
                  <tr key={hora}>
                    <td className="py-0.5 pr-3 font-mono text-[10px] opacity-30" style={{ color: "#EDE8DE" }}>{hora}</td>
                    {horasPico.dias.map(dia => {
                      const v = horasPico.grid[`${dia}-${hora}`] ?? 0;
                      const intensity = v / horasPico.max;
                      return (
                        <td key={dia} className="py-0.5 px-1 text-center">
                          <div className="w-7 h-7 rounded mx-auto flex items-center justify-center font-mono text-[10px]"
                               style={{
                                 backgroundColor: v === 0 ? "rgba(30,27,23,0.5)" : `rgba(200,150,60,${0.1 + intensity * 0.75})`,
                                 color: v === 0 ? "#3A3630" : intensity > 0.5 ? "#C8963C" : "#7A7367",
                               }}>
                            {v > 0 ? v : "·"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}