import { useState } from "react";
import { Upload, MessageCircle, Calendar, Link } from "lucide-react";

const tabs = ["Perfil del negocio","Horarios","Notificaciones","Apariencia","Integraciones"];

const sched = [
  { label:"Lunes",      open:"10:00", close:"20:00", active:true  },
  { label:"Martes",     open:"10:00", close:"20:00", active:true  },
  { label:"Miércoles",  open:"10:00", close:"20:00", active:true  },
  { label:"Jueves",     open:"10:00", close:"20:00", active:true  },
  { label:"Viernes",    open:"10:00", close:"20:00", active:true  },
  { label:"Sábado",     open:"10:00", close:"18:00", active:true  },
  { label:"Domingo",    open:"10:00", close:"18:00", active:false },
];

function Tog({ active, onToggle }: { active:boolean; onToggle:()=>void }) {
  return (
    <button onClick={onToggle} className="relative rounded-full flex-shrink-0 transition-all" style={{ backgroundColor:active?"#C8963C":"#2A261F", width:36, height:20 }}>
      <span className="absolute top-[2px] rounded-full bg-white shadow transition-all duration-200" style={{ left:active?"calc(100%-18px)":2, width:16, height:16 }} />
    </button>
  );
}

const inputCls = "w-full px-4 py-3 rounded border text-sm outline-none bg-transparent transition-all";
const inputStyle = { borderColor:"#2A261F", color:"#EDE8DE" };

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState(0);
  const [schedule, setSchedule]   = useState(sched);
  const [notifs, setNotifs]       = useState({ whatsapp:true, email:false, hours:"24" });

  return (
    <div>
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((t,i)=>(
          <button key={t} onClick={()=>setActiveTab(i)}
            className="flex-shrink-0 px-4 py-2.5 rounded text-xs font-semibold tracking-wide transition-all"
            style={{ backgroundColor:activeTab===i?"#C8963C":"#131210", color:activeTab===i?"#0A0907":"#7A7367", border:`1px solid ${activeTab===i?"#C8963C":"#1E1B17"}` }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab===0 && (
        <div className="rounded border p-6 max-w-xl space-y-5" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor:"#1E1B17" }}>
            <div className="w-16 h-16 rounded flex items-center justify-center text-3xl" style={{ backgroundColor:"#0F0D0B" }}>✂️</div>
            <div>
              <p className="font-mono text-xs tracking-wider opacity-40 mb-2" style={{ color:"#EDE8DE" }}>LOGO DEL NEGOCIO</p>
              <button className="flex items-center gap-2 px-3 py-2 rounded border font-mono text-xs tracking-wider hover:border-[#C8963C] transition-all" style={{ borderColor:"#2A261F", color:"#7A7367" }}>
                <Upload size={12} /> SUBIR
              </button>
            </div>
          </div>
          {[
            { label:"Nombre del negocio", value:"BarberFlow Santiago" },
            { label:"Dirección",          value:"Av. Providencia 1234, Santiago" },
            { label:"Teléfono",           value:"+56 9 8765 4321" },
            { label:"Instagram",          value:"@barberflow.cl" },
          ].map(f=>(
            <div key={f.label}>
              <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40" style={{ color:"#EDE8DE" }}>{f.label}</label>
              <input defaultValue={f.value} className={inputCls} style={inputStyle}
                onFocus={e=>e.target.style.borderColor="#C8963C"}
                onBlur={e=>e.target.style.borderColor="#2A261F"} />
            </div>
          ))}
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40" style={{ color:"#EDE8DE" }}>Descripción</label>
            <textarea defaultValue="Barbería premium en el corazón de Providencia." rows={3}
              className="w-full px-4 py-3 rounded border text-sm outline-none bg-transparent resize-none"
              style={inputStyle}
              onFocus={e=>e.target.style.borderColor="#C8963C"}
              onBlur={e=>e.target.style.borderColor="#2A261F"} />
          </div>
          <button className="px-6 py-3 rounded text-xs font-semibold tracking-wider" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>GUARDAR CAMBIOS</button>
        </div>
      )}

      {activeTab===1 && (
        <div className="rounded border p-6 max-w-xl" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-5" style={{ color:"#EDE8DE" }}>Horario de atención</p>
          <div className="space-y-0">
            {schedule.map((d,i)=>(
              <div key={d.label} className="flex items-center gap-4 py-4 border-b last:border-0" style={{ borderColor:"#1E1B17" }}>
                <Tog active={d.active} onToggle={()=>setSchedule(prev=>prev.map((s,j)=>j===i?{...s,active:!s.active}:s))} />
                <span className="w-24 text-sm font-display italic font-light" style={{ color:d.active?"#EDE8DE":"#7A7367" }}>{d.label}</span>
                {d.active ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" defaultValue={d.open} className="px-3 py-2 rounded border font-mono text-xs outline-none bg-transparent" style={{ borderColor:"#2A261F", color:"#EDE8DE" }} />
                    <span className="opacity-30" style={{ color:"#EDE8DE" }}>—</span>
                    <input type="time" defaultValue={d.close} className="px-3 py-2 rounded border font-mono text-xs outline-none bg-transparent" style={{ borderColor:"#2A261F", color:"#EDE8DE" }} />
                  </div>
                ) : <span className="font-mono text-xs" style={{ color:"#C0392B" }}>CERRADO</span>}
              </div>
            ))}
          </div>
          <button className="mt-5 px-6 py-3 rounded text-xs font-semibold tracking-wider" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>GUARDAR</button>
        </div>
      )}

      {activeTab===2 && (
        <div className="rounded border p-6 max-w-xl space-y-5" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-2" style={{ color:"#EDE8DE" }}>Notificaciones automáticas</p>
          {[
            { key:"whatsapp", label:"Recordatorio por WhatsApp", desc:"Recordatorio automático 24h antes" },
            { key:"email",    label:"Recordatorio por email",    desc:"Confirmación y recordatorio por correo" },
          ].map(n=>(
            <div key={n.key} className="flex items-center justify-between py-4 border-b" style={{ borderColor:"#1E1B17" }}>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color:"#EDE8DE" }}>{n.label}</p>
                <p className="font-mono text-xs opacity-30" style={{ color:"#EDE8DE" }}>{n.desc}</p>
              </div>
              <Tog active={notifs[n.key as "whatsapp"|"email"]} onToggle={()=>setNotifs(p=>({...p,[n.key]:!p[n.key as "whatsapp"|"email"]}))} />
            </div>
          ))}
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40" style={{ color:"#EDE8DE" }}>Horas antes del recordatorio</label>
            <select value={notifs.hours} onChange={e=>setNotifs(p=>({...p,hours:e.target.value}))}
              className="px-4 py-3 rounded border font-mono text-xs outline-none bg-transparent" style={{ borderColor:"#2A261F", color:"#EDE8DE" }}>
              {["1","2","6","12","24","48"].map(h=><option key={h} value={h} style={{ backgroundColor:"#131210" }}>{h}h antes</option>)}
            </select>
          </div>
          <button className="px-6 py-3 rounded text-xs font-semibold tracking-wider" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>GUARDAR</button>
        </div>
      )}

      {activeTab===3 && (
        <div className="rounded border p-6 max-w-xl" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-5" style={{ color:"#EDE8DE" }}>Color principal</p>
          <div className="flex flex-wrap gap-4 mb-8">
            {[{c:"#C8963C",l:"Ámbar"},{c:"#0A0907",l:"Carbón"},{c:"#2E7D5B",l:"Esmeralda"},{c:"#6B8ED4",l:"Índigo"},{c:"#8B6BD4",l:"Violeta"},{c:"#C0392B",l:"Rojo"}].map(p=>(
              <button key={p.c} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full border-2 transition-all group-hover:scale-110" style={{ backgroundColor:p.c, borderColor:p.c==="#C8963C"?"#EDE8DE":"transparent" }} />
                <span className="font-mono text-[9px] opacity-40 tracking-wider" style={{ color:"#EDE8DE" }}>{p.l.toUpperCase()}</span>
              </button>
            ))}
          </div>
          <div className="p-5 rounded border" style={{ borderColor:"#2A261F", backgroundColor:"#0F0D0B" }}>
            <p className="font-mono text-[9px] tracking-widest opacity-30 mb-4" style={{ color:"#EDE8DE" }}>VISTA PREVIA</p>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded text-xs font-semibold tracking-wider" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>Reservar ahora</button>
              <button className="px-5 py-2.5 rounded border text-xs font-semibold tracking-wider" style={{ borderColor:"#C8963C", color:"#C8963C" }}>Ver servicios</button>
            </div>
          </div>
        </div>
      )}

      {activeTab===4 && (
        <div className="rounded border p-6 max-w-xl space-y-4" style={{ backgroundColor:"#131210", borderColor:"#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-2" style={{ color:"#EDE8DE" }}>Integraciones</p>
          {[
            { Icon:MessageCircle, name:"WhatsApp Business", desc:"Confirmaciones y recordatorios automáticos", connected:true,  color:"#25D366" },
            { Icon:Calendar,      name:"Google Calendar",   desc:"Sincroniza reservas con tu calendario",      connected:false, color:"#4285F4" },
            { Icon:Link,          name:"Instagram",         desc:"Muestra disponibilidad en tu perfil",        connected:false, color:"#E1306C" },
            { Icon:Link,          name:"Booking widget",    desc:"Embed de reservas para tu sitio web",        connected:false, color:"#7A7367" },
          ].map(int=>(
            <div key={int.name} className="flex items-center gap-4 py-4 border-b last:border-0" style={{ borderColor:"#1E1B17" }}>
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor:`${int.color}12` }}>
                <int.Icon size={18} style={{ color:int.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-0.5" style={{ color:"#EDE8DE" }}>{int.name}</p>
                <p className="font-mono text-[10px] opacity-30 tracking-wide" style={{ color:"#EDE8DE" }}>{int.desc}</p>
              </div>
              <button className="px-3 py-2 rounded font-mono text-[10px] tracking-wider transition-all" style={{ backgroundColor:int.connected?"rgba(46,125,91,0.1)":"#1E1B17", color:int.connected?"#2E7D5B":"#7A7367", border:`1px solid ${int.connected?"rgba(46,125,91,0.3)":"#2A261F"}` }}>
                {int.connected?"CONECTADO ✓":"CONECTAR"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
