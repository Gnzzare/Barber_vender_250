import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Phone, MessageCircle, X, Check, Edit, RotateCcw } from "lucide-react";

const BARBER_1 = "https://images.unsplash.com/photo-1598524374912-6b0b0bab43dd?w=60&h=60&fit=crop&auto=format";
const BARBER_2 = "https://images.unsplash.com/photo-1663077639920-f5ebd9a6296c?w=60&h=60&fit=crop&auto=format";
const BARBER_3 = "https://images.unsplash.com/photo-1635273051839-003bf06a8751?w=60&h=60&fit=crop&auto=format";

const barbers = [
  { name: "Matías G.",    img: BARBER_1, color: "#C8963C" },
  { name: "Sebastián R.", img: BARBER_2, color: "#6B8ED4" },
  { name: "Diego F.",     img: BARBER_3, color: "#2E7D5B" },
];

interface Appt { id:number; barberIdx:number; client:string; service:string; phone:string; startHour:number; startMin:number; duration:number; notes?:string; status:string }

const appointments: Appt[] = [
  { id:1, barberIdx:0, client:"Andrés Morales",  service:"Corte + barba",    phone:"+56 9 8765 4321", startHour:9,  startMin:0,  duration:45, status:"confirmada" },
  { id:2, barberIdx:1, client:"Felipe Castro",   service:"Corte clásico",    phone:"+56 9 7654 3210", startHour:9,  startMin:30, duration:30, status:"completada" },
  { id:3, barberIdx:0, client:"Jorge Espinoza",  service:"Afeitado premium", phone:"+56 9 6543 2109", startHour:11, startMin:0,  duration:40, notes:"Toalla extra caliente", status:"confirmada" },
  { id:4, barberIdx:2, client:"Pablo Muñoz",     service:"Corte clásico",    phone:"+56 9 5432 1098", startHour:10, startMin:0,  duration:30, status:"pendiente" },
  { id:5, barberIdx:1, client:"Camilo Vera",     service:"Arreglo de barba", phone:"+56 9 4321 0987", startHour:12, startMin:0,  duration:20, status:"confirmada" },
  { id:6, barberIdx:0, client:"Rodrigo López",   service:"Corte + barba",    phone:"+56 9 3210 9876", startHour:14, startMin:0,  duration:45, status:"confirmada" },
];

const hours = Array.from({ length: 12 }, (_,i) => i+9);
const SLOT = 60;

export default function AdminAgenda() {
  const [selected, setSelected] = useState<Appt|null>(null);
  const [filter, setFilter] = useState(-1);

  const nowH = new Date().getHours(), nowM = new Date().getMinutes();
  const nowTop = (nowH-9)*SLOT+(nowM/60)*SLOT;
  const showNow = nowH>=9&&nowH<21;

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded border hover:border-[#C8963C] transition-all" style={{ borderColor:"#1E1B17" }}>
              <ChevronLeft size={14} style={{ color:"#7A7367" }} />
            </button>
            <span className="font-display italic text-sm" style={{ color:"#EDE8DE" }}>Jue 10 sep 2026</span>
            <span className="font-mono text-xs px-2 py-1 rounded-sm" style={{ backgroundColor:"rgba(200,150,60,0.1)", color:"#C8963C" }}>Hoy</span>
            <button className="p-1.5 rounded border hover:border-[#C8963C] transition-all" style={{ borderColor:"#1E1B17" }}>
              <ChevronRight size={14} style={{ color:"#7A7367" }} />
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button onClick={()=>setFilter(-1)} className="px-3 py-1.5 rounded-sm font-mono text-xs tracking-wider transition-all" style={{ backgroundColor:filter===-1?"#C8963C":"transparent", color:filter===-1?"#0A0907":"#7A7367", border:`1px solid ${filter===-1?"#C8963C":"#1E1B17"}` }}>
              TODOS
            </button>
            {barbers.map((b,i)=>(
              <button key={i} onClick={()=>setFilter(filter===i?-1:i)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs tracking-wider transition-all" style={{ backgroundColor:filter===i?b.color:"transparent", color:filter===i?"#0A0907":"#7A7367", border:`1px solid ${filter===i?b.color:"#1E1B17"}` }}>
                <img src={b.img} alt={b.name} className="w-3.5 h-3.5 rounded-full object-cover" />{b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="rounded border overflow-hidden" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <div className="flex border-b sticky top-0 z-10" style={{ borderColor:"#1E1B17", backgroundColor:"#0F0D0B" }}>
            <div className="w-12 flex-shrink-0 border-r" style={{ borderColor:"#1E1B17" }} />
            {(filter===-1?barbers:[barbers[filter]]).map((b,i)=>(
              <div key={i} className="flex-1 px-3 py-3 flex items-center gap-2 border-r last:border-r-0" style={{ borderColor:"#1E1B17" }}>
                <img src={b.img} alt={b.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0 grayscale opacity-70" />
                <span className="text-xs font-medium" style={{ color:"#EDE8DE" }}>{b.name}</span>
                <span className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor:b.color }} />
              </div>
            ))}
          </div>
          <div className="relative overflow-y-auto" style={{ maxHeight:460 }}>
            {showNow && (
              <div className="absolute left-12 right-0 z-20 flex items-center pointer-events-none" style={{ top:nowTop }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor:"#C0392B" }} />
                <div className="flex-1 h-px" style={{ backgroundColor:"#C0392B", opacity:0.6 }} />
              </div>
            )}
            {hours.map(h=>(
              <div key={h} className="flex border-b" style={{ borderColor:"#1A1714", height:SLOT }}>
                <div className="w-12 flex-shrink-0 flex items-start justify-center pt-1 border-r" style={{ borderColor:"#1A1714" }}>
                  <span className="font-mono text-[10px] opacity-30" style={{ color:"#EDE8DE" }}>{h}:00</span>
                </div>
                {(filter===-1?barbers:[barbers[filter]]).map((b,ci)=>{
                  const bIdx = filter===-1?ci:filter;
                  const colAppts = appointments.filter(a=>a.barberIdx===bIdx&&a.startHour===h);
                  return (
                    <div key={ci} className="flex-1 relative border-r last:border-r-0 group" style={{ borderColor:"#1A1714" }}>
                      {colAppts.map(appt=>{
                        const top=(appt.startMin/60)*SLOT, height=Math.max((appt.duration/60)*SLOT,28);
                        const bc=barbers[appt.barberIdx].color;
                        return (
                          <button key={appt.id} onClick={()=>setSelected(appt)}
                            className="absolute left-1 right-1 rounded px-2 py-1.5 text-left transition-all hover:brightness-110 overflow-hidden"
                            style={{ top, height, backgroundColor:`${bc}12`, borderLeft:`2px solid ${bc}`, zIndex:5 }}>
                            <p className="text-xs font-medium truncate" style={{ color:bc }}>{appt.client}</p>
                            {height>34&&<p className="text-[10px] truncate opacity-50" style={{ color:bc }}>{appt.service}</p>}
                          </button>
                        );
                      })}
                      <button className="absolute inset-0 hidden group-hover:flex items-center justify-center opacity-0 hover:opacity-100">
                        <Plus size={14} style={{ color:"#C8963C" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel */}
      {selected && (
        <div className="w-72 flex-shrink-0">
          <div className="rounded border p-5" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs tracking-widest opacity-40" style={{ color:"#EDE8DE" }}>DETALLE</span>
              <button onClick={()=>setSelected(null)} className="opacity-30 hover:opacity-70 transition-opacity"><X size={16} style={{ color:"#EDE8DE" }} /></button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-display italic" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>
                {selected.client.split(" ").map(w=>w[0]).join("").slice(0,2)}
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color:"#EDE8DE" }}>{selected.client}</p>
                <p className="font-mono text-xs opacity-40">{selected.phone}</p>
              </div>
            </div>
            <div className="space-y-0">
              {[
                ["Servicio", selected.service],
                ["Barbero",  barbers[selected.barberIdx].name],
                ["Hora",     `${selected.startHour}:${selected.startMin.toString().padStart(2,"0")}`],
                ["Duración", `${selected.duration} min`],
              ].map(([l,v])=>(
                <div key={l} className="flex justify-between py-3 border-b" style={{ borderColor:"#1E1B17" }}>
                  <span className="font-mono text-[10px] tracking-wider opacity-30" style={{ color:"#EDE8DE" }}>{l}</span>
                  <span className="text-xs" style={{ color:"#EDE8DE" }}>{v}</span>
                </div>
              ))}
              {selected.notes&&(
                <p className="text-xs mt-3 py-3 px-3 rounded opacity-50 leading-relaxed" style={{ backgroundColor:"#1E1B17", color:"#EDE8DE" }}>
                  {selected.notes}
                </p>
              )}
            </div>
            <div className="space-y-2 mt-5">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded text-xs font-semibold tracking-wide" style={{ backgroundColor:"#25D366", color:"white" }}>
                <MessageCircle size={14} /> WhatsApp
              </button>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { Icon:Check,    l:"Completar",   c:"#2E7D5B" },
                  { Icon:Edit,     l:"Editar",      c:"#7A7367" },
                  { Icon:RotateCcw,l:"Reprogramar", c:"#6B8ED4" },
                  { Icon:X,        l:"Cancelar",    c:"#C0392B" },
                ].map(({Icon,l,c})=>(
                  <button key={l} className="flex items-center justify-center gap-1 py-2.5 rounded border font-mono text-[10px] tracking-wider hover:bg-[#1E1B17] transition-colors" style={{ borderColor:"#1E1B17", color:c }}>
                    <Icon size={12} /> {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
