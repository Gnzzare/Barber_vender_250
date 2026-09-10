import { TrendingUp, TrendingDown, Users, DollarSign, BarChart2, AlertTriangle, Check, Edit, X, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const kpis = [
  { label: "Reservas hoy",       value: "12",      trend: "+12%", up: true,  sub: "vs ayer",            icon: Users,         color: "#C8963C" },
  { label: "Ingresos hoy",       value: "$96.000",  trend: "+8%",  up: true,  sub: "vs ayer",            icon: DollarSign,    color: "#2E7D5B" },
  { label: "Ocupación",          value: "78%",      trend: "+5%",  up: true,  sub: "capacidad diaria",   icon: BarChart2,     color: "#6B8ED4" },
  { label: "No-shows semana",    value: "3",        trend: "-1",   up: false, sub: "vs semana anterior", icon: AlertTriangle, color: "#C0392B" },
];

const weekData = [
  { day: "Lun", revenue: 64000 }, { day: "Mar", revenue: 82000 },
  { day: "Mié", revenue: 71000 }, { day: "Jue", revenue: 96000 },
  { day: "Vie", revenue: 110000 },{ day: "Sáb", revenue: 130000 },
  { day: "Dom", revenue: 0 },
];

const reservations = [
  { time: "09:00", client: "Andrés Morales",  service: "Corte + barba",    barber: "Matías G.",    status: "confirmada" },
  { time: "10:30", client: "Felipe Castro",   service: "Corte clásico",    barber: "Sebastián R.", status: "completada" },
  { time: "11:30", client: "Jorge Espinoza",  service: "Afeitado premium", barber: "Matías G.",    status: "pendiente" },
  { time: "14:00", client: "Pablo Muñoz",     service: "Arreglo de barba", barber: "Diego F.",     status: "confirmada" },
  { time: "15:30", client: "Camilo Vera",     service: "Corte clásico",    barber: "Sebastián R.", status: "no-show" },
  { time: "16:30", client: "Rodrigo López",   service: "Corte + barba",    barber: "Matías G.",    status: "confirmada" },
];

const topServices = [
  { name: "Corte clásico",    count: 48, pct: 85 },
  { name: "Corte + barba",    count: 32, pct: 57 },
  { name: "Afeitado premium", count: 19, pct: 34 },
  { name: "Arreglo de barba", count: 14, pct: 25 },
];

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  confirmada: { label: "Confirmada", bg: "rgba(46,125,91,0.1)",   color: "#2E7D5B" },
  pendiente:  { label: "Pendiente",  bg: "rgba(200,150,60,0.1)",  color: "#C8963C" },
  completada: { label: "Completada", bg: "rgba(107,142,212,0.1)", color: "#6B8ED4" },
  "no-show":  { label: "No-show",    bg: "rgba(192,57,43,0.1)",   color: "#C0392B" },
};

export default function AdminDashboard() {
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
            <p className="font-display text-3xl font-semibold mb-2" style={{ color: "#EDE8DE", fontStyle: "italic" }}>{k.value}</p>
            <div className="flex items-center gap-1.5">
              {k.up ? <TrendingUp size={12} style={{ color: "#2E7D5B" }} /> : <TrendingDown size={12} style={{ color: "#C0392B" }} />}
              <span className="font-mono text-xs font-medium" style={{ color: k.up ? "#2E7D5B" : "#C0392B" }}>{k.trend}</span>
              <span className="font-mono text-xs opacity-30" style={{ color: "#EDE8DE" }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="xl:col-span-2 rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-medium italic" style={{ color: "#EDE8DE" }}>Ingresos semanales</h3>
              <p className="font-mono text-xs opacity-30 mt-0.5 tracking-wider" style={{ color: "#EDE8DE" }}>ESTA SEMANA</p>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} style={{ color: "#2E7D5B" }} />
              <span className="font-mono text-xs" style={{ color: "#2E7D5B" }}>+18% vs anterior</span>
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

        {/* Top services */}
        <div className="rounded border p-6" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <h3 className="font-display font-medium italic mb-6" style={{ color: "#EDE8DE" }}>Top servicios</h3>
          <div className="space-y-5">
            {topServices.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "#EDE8DE" }}>{s.name}</span>
                  <span className="font-mono text-xs opacity-40" style={{ color: "#EDE8DE" }}>{s.count}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1B17" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: "#C8963C" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reservations */}
      <div className="rounded border overflow-hidden" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1B17" }}>
          <h3 className="font-display font-medium italic" style={{ color: "#EDE8DE" }}>Reservas de hoy</h3>
          <span className="font-mono text-xs px-2.5 py-1 rounded-sm" style={{ backgroundColor: "rgba(200,150,60,0.1)", color: "#C8963C" }}>12 reservas</span>
        </div>
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
              {reservations.map((r,i) => {
                const st = statusConfig[r.status];
                return (
                  <tr key={i} className="border-t transition-colors hover:bg-[#0F0D0B]" style={{ borderColor: "#1E1B17" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "#C8963C" }}>
                        <Clock size={12} />{r.time}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-display italic flex-shrink-0" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
                          {r.client.split(" ").map(w=>w[0]).join("").slice(0,2)}
                        </div>
                        <span className="text-sm" style={{ color: "#EDE8DE" }}>{r.client}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs opacity-50" style={{ color: "#EDE8DE" }}>{r.service}</td>
                    <td className="px-5 py-4 text-xs opacity-50" style={{ color: "#EDE8DE" }}>{r.barber}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-1 rounded-sm font-mono text-[10px] tracking-wider" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {[
                          { Icon: Check, c: "#2E7D5B" },
                          { Icon: Edit,  c: "#7A7367" },
                          { Icon: X,     c: "#C0392B" },
                        ].map(({ Icon, c }, bi) => (
                          <button key={bi} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17] transition-colors">
                            <Icon size={13} style={{ color: c }} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
