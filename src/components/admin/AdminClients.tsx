import { useState } from "react";
import { Search, MessageCircle, ChevronRight, X, Calendar, Clock } from "lucide-react";

const clients = [
  { name:"Andrés Morales",  phone:"+56 9 8765 4321", visits:24, lastVisit:"05 sep 2026", spent:"$312.000", tags:["VIP","Frecuente"],  initials:"AM" },
  { name:"Felipe Castro",   phone:"+56 9 7654 3210", visits:8,  lastVisit:"02 sep 2026", spent:"$88.000",  tags:["Frecuente"],         initials:"FC" },
  { name:"Jorge Espinoza",  phone:"+56 9 6543 2109", visits:3,  lastVisit:"10 sep 2026", spent:"$32.000",  tags:["Nuevo"],             initials:"JE" },
  { name:"Pablo Muñoz",     phone:"+56 9 5432 1098", visits:15, lastVisit:"01 sep 2026", spent:"$168.000", tags:["Frecuente"],         initials:"PM" },
  { name:"Camilo Vera",     phone:"+56 9 4321 0987", visits:1,  lastVisit:"08 sep 2026", spent:"$8.000",   tags:["Nuevo"],             initials:"CV" },
  { name:"Rodrigo López",   phone:"+56 9 3210 9876", visits:32, lastVisit:"10 sep 2026", spent:"$420.000", tags:["VIP","Frecuente"],  initials:"RL" },
  { name:"Diego Silva",     phone:"+56 9 2109 8765", visits:7,  lastVisit:"28 ago 2026", spent:"$72.000",  tags:["Frecuente"],         initials:"DS" },
];

const tagCfg: Record<string,{bg:string;color:string}> = {
  VIP:      { bg:"rgba(200,150,60,0.1)",  color:"#C8963C" },
  Frecuente:{ bg:"rgba(107,142,212,0.1)", color:"#6B8ED4" },
  Nuevo:    { bg:"rgba(46,125,91,0.1)",   color:"#2E7D5B" },
};

const history = [
  { service:"Corte + barba",    barber:"Matías G.",    date:"05 sep 2026", price:"$12.000" },
  { service:"Corte clásico",    barber:"Sebastián R.", date:"22 ago 2026", price:"$8.000"  },
  { service:"Afeitado premium", barber:"Matías G.",    date:"10 ago 2026", price:"$10.000" },
  { service:"Corte + barba",    barber:"Matías G.",    date:"28 jul 2026", price:"$12.000" },
];

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof clients[0]|null>(null);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded border" style={{ borderColor:"#1E1B17", backgroundColor:"#131210" }}>
            <Search size={14} style={{ color:"#7A7367" }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre o teléfono..."
              className="flex-1 text-sm outline-none bg-transparent" style={{ color:"#EDE8DE" }} />
          </div>
        </div>
        <div className="rounded border overflow-hidden" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor:"#0F0D0B" }}>
                  {["Cliente","Teléfono","Visitas","Última visita","Gastado","Tags",""].map(h=>(
                    <th key={h} className="text-left px-5 py-3 font-mono text-[10px] tracking-widest uppercase opacity-30" style={{ color:"#EDE8DE" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i)=>(
                  <tr key={i} className="border-t hover:bg-[#0F0D0B] transition-colors cursor-pointer" style={{ borderColor:"#1E1B17" }} onClick={()=>setSelected(c)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-display italic flex-shrink-0" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>{c.initials}</div>
                        <span className="text-sm font-medium" style={{ color:"#EDE8DE" }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs opacity-40" style={{ color:"#EDE8DE" }}>{c.phone}</td>
                    <td className="px-5 py-4 font-display italic font-semibold" style={{ color:"#EDE8DE" }}>{c.visits}</td>
                    <td className="px-5 py-4 font-mono text-xs opacity-40" style={{ color:"#EDE8DE" }}>{c.lastVisit}</td>
                    <td className="px-5 py-4 font-display italic font-semibold" style={{ color:"#C8963C" }}>{c.spent}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {c.tags.map(t=>(
                          <span key={t} className="px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wider" style={{ backgroundColor:tagCfg[t].bg, color:tagCfg[t].color }}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 opacity-20"><ChevronRight size={14} style={{ color:"#EDE8DE" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="rounded border p-5" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs tracking-widest opacity-40" style={{ color:"#EDE8DE" }}>CLIENTE</span>
              <button onClick={()=>setSelected(null)} className="opacity-20 hover:opacity-60 transition-opacity"><X size={15} style={{ color:"#EDE8DE" }} /></button>
            </div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-display italic mx-auto mb-3" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>{selected.initials}</div>
              <p className="font-display italic text-xl font-light" style={{ color:"#EDE8DE" }}>{selected.name}</p>
              <div className="flex gap-1.5 justify-center mt-2">
                {selected.tags.map(t=>(
                  <span key={t} className="px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wider" style={{ backgroundColor:tagCfg[t].bg, color:tagCfg[t].color }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              {[{l:"Visitas",v:selected.visits},{l:"Gastado",v:selected.spent.replace("$","$")},{l:"Última",v:selected.lastVisit.split(" ").slice(0,2).join(" ")}].map(s=>(
                <div key={s.l} className="py-3 rounded" style={{ backgroundColor:"#0F0D0B" }}>
                  <p className="font-display italic font-semibold text-sm" style={{ color:"#C8963C" }}>{s.v}</p>
                  <p className="font-mono text-[9px] tracking-wider opacity-30 mt-0.5" style={{ color:"#EDE8DE" }}>{s.l.toUpperCase()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded text-xs font-semibold" style={{ backgroundColor:"#25D366", color:"white" }}>
                <MessageCircle size={13} /> WhatsApp
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded border text-xs font-semibold" style={{ borderColor:"#1E1B17", color:"#EDE8DE" }}>
                <Calendar size={13} /> Reservar
              </button>
            </div>
          </div>
          <div className="rounded border p-5" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
            <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-4" style={{ color:"#EDE8DE" }}>Historial</p>
            <div className="space-y-3">
              {history.map((h,i)=>(
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor:"#1E1B17" }}>
                  <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor:"#1E1B17" }}>
                    <Clock size={12} style={{ color:"#C8963C" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color:"#EDE8DE" }}>{h.service}</p>
                    <p className="font-mono text-[10px] opacity-30 mt-0.5">{h.barber} · {h.date}</p>
                  </div>
                  <span className="font-display italic font-semibold text-sm" style={{ color:"#C8963C" }}>{h.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
