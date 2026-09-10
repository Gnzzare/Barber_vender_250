import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { date:"1 sep", revenue:72000 }, { date:"2 sep", revenue:85000 },
  { date:"3 sep", revenue:68000 }, { date:"4 sep", revenue:92000 },
  { date:"5 sep", revenue:110000},{ date:"6 sep", revenue:130000},
  { date:"7 sep", revenue:0 },    { date:"8 sep", revenue:88000 },
  { date:"9 sep", revenue:96000 },{ date:"10 sep",revenue:104000},
];

const servicesPie = [
  { name:"Corte clásico",    value:48, color:"#C8963C" },
  { name:"Corte + barba",    value:32, color:"#6B8ED4" },
  { name:"Afeitado premium", value:19, color:"#2E7D5B" },
  { name:"Arreglo barba",    value:14, color:"#8B6BD4" },
  { name:"Otros",            value:8,  color:"#2A261F" },
];

const barberPerf = [
  { name:"Matías G.",    revenue:320000 },
  { name:"Sebastián R.", revenue:268000 },
  { name:"Diego F.",     revenue:196000 },
];

const peakHours = [
  { hour:"09:00", lun:2, mar:3, mie:2, jue:4, vie:5, sab:6 },
  { hour:"10:00", lun:3, mar:4, mie:3, jue:5, vie:6, sab:7 },
  { hour:"11:00", lun:2, mar:2, mie:4, jue:4, vie:7, sab:8 },
  { hour:"12:00", lun:1, mar:2, mie:2, jue:3, vie:4, sab:5 },
  { hour:"14:00", lun:3, mar:3, mie:3, jue:4, vie:5, sab:7 },
  { hour:"15:00", lun:4, mar:4, mie:5, jue:6, vie:8, sab:8 },
  { hour:"16:00", lun:3, mar:5, mie:4, jue:5, vie:7, sab:6 },
  { hour:"17:00", lun:2, mar:3, mie:3, jue:4, vie:5, sab:4 },
];

const kpis = [
  { label:"Ingresos totales", value:"$784.000", trend:"+18%", up:true  },
  { label:"Reservas totales", value:"93",        trend:"+12%", up:true  },
  { label:"Ticket promedio",  value:"$8.430",    trend:"+5%",  up:true  },
  { label:"Tasa no-shows",    value:"3.2%",      trend:"-0.8%",up:false },
];

const days = ["Lun","Mar","Mié","Jue","Vie","Sáb"];
const maxVal = Math.max(...peakHours.flatMap(h=>[h.lun,h.mar,h.mie,h.jue,h.vie,h.sab]));

const tsCfg = { borderRadius:8, border:"1px solid #2A261F", backgroundColor:"#131210", fontSize:11, color:"#EDE8DE" };

export default function AdminReports() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded border font-mono text-xs" style={{ borderColor:"#1E1B17", backgroundColor:"#131210", color:"#7A7367" }}>
          <span>1 sep 2026</span>
          <span style={{ color:"#C8963C" }}>→</span>
          <span>10 sep 2026</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded border font-mono text-xs tracking-wider hover:border-[#C8963C] transition-all" style={{ borderColor:"#1E1B17", color:"#7A7367" }}>
          <Download size={13} /> EXPORTAR
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k=>(
          <div key={k.label} className="rounded border p-5" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-30 mb-3" style={{ color:"#EDE8DE" }}>{k.label}</p>
            <p className="font-display italic text-2xl font-semibold mb-2" style={{ color:"#EDE8DE" }}>{k.value}</p>
            <div className="flex items-center gap-1.5">
              {k.up?<TrendingUp size={11} style={{ color:"#2E7D5B" }}/>:<TrendingDown size={11} style={{ color:"#C0392B" }}/>}
              <span className="font-mono text-xs" style={{ color:k.up?"#2E7D5B":"#C0392B" }}>{k.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded border p-6" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <h3 className="font-display italic font-medium mb-5" style={{ color:"#EDE8DE" }}>Ingresos en el tiempo</h3>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1B17" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:"#7A7367", fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v=>`$${v/1000}k`} tick={{ fontSize:10, fill:"#7A7367", fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v:unknown)=>[`$${Number(v).toLocaleString("es-CL")}`,"Ingresos"]} contentStyle={tsCfg} />
              <Line type="monotone" dataKey="revenue" stroke="#C8963C" strokeWidth={2} dot={false} activeDot={{ r:4, fill:"#C8963C" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded border p-6" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <h3 className="font-display italic font-medium mb-5" style={{ color:"#EDE8DE" }}>Por servicio</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={servicesPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {servicesPie.map((e,i)=><Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v:unknown)=>[`${Number(v)} reservas`]} contentStyle={tsCfg} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {servicesPie.slice(0,4).map(s=>(
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor:s.color }} />
                <span className="text-xs flex-1 opacity-50" style={{ color:"#EDE8DE" }}>{s.name}</span>
                <span className="font-mono text-xs opacity-40" style={{ color:"#EDE8DE" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded border p-6" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <h3 className="font-display italic font-medium mb-5" style={{ color:"#EDE8DE" }}>Rendimiento por barbero</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barberPerf} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1B17" horizontal={false} />
              <XAxis type="number" tickFormatter={v=>`$${v/1000}k`} tick={{ fontSize:10, fill:"#7A7367", fontFamily:"DM Mono" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#7A7367" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v:unknown)=>[`$${Number(v).toLocaleString("es-CL")}`,"Ingresos"]} contentStyle={tsCfg} />
              <Bar dataKey="revenue" fill="#C8963C" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded border p-6" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <h3 className="font-display italic font-medium mb-5" style={{ color:"#EDE8DE" }}>Horas pico</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3 font-mono text-[9px] opacity-30 tracking-wider" style={{ color:"#EDE8DE" }}>HORA</th>
                  {days.map(d=><th key={d} className="py-1 px-1 font-mono text-[9px] opacity-30 tracking-wider text-center" style={{ color:"#EDE8DE" }}>{d.toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {peakHours.map(row=>(
                  <tr key={row.hour}>
                    <td className="py-0.5 pr-3 font-mono text-[10px] opacity-30" style={{ color:"#EDE8DE" }}>{row.hour}</td>
                    {[row.lun,row.mar,row.mie,row.jue,row.vie,row.sab].map((v,ci)=>{
                      const intensity=v/maxVal;
                      return (
                        <td key={ci} className="py-0.5 px-1 text-center">
                          <div className="w-7 h-7 rounded mx-auto flex items-center justify-center font-mono text-[10px]"
                            style={{ backgroundColor:`rgba(200,150,60,${0.06+intensity*0.8})`, color:intensity>0.5?"#C8963C":"#7A7367" }}>
                            {v}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
