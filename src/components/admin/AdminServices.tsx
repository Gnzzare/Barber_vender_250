import { useState } from "react";
import { Edit, Trash2, Plus, X } from "lucide-react";

const BARBER_1 = "https://images.unsplash.com/photo-1598524374912-6b0b0bab43dd?w=80&h=80&fit=crop&auto=format";
const BARBER_2 = "https://images.unsplash.com/photo-1663077639920-f5ebd9a6296c?w=80&h=80&fit=crop&auto=format";
const BARBER_3 = "https://images.unsplash.com/photo-1635273051839-003bf06a8751?w=80&h=80&fit=crop&auto=format";

const initialServices = [
  { id:1, icon:"✂️", name:"Corte clásico",    duration:30, price:8000,  color:"#C8963C", active:true,  desc:"Corte tradicional con tijera y máquina" },
  { id:2, icon:"🔥", name:"Corte + barba",    duration:45, price:12000, color:"#6B8ED4", active:true,  desc:"Combo completo de corte y arreglo de barba" },
  { id:3, icon:"🪒", name:"Arreglo de barba", duration:20, price:6000,  color:"#2E7D5B", active:true,  desc:"Perfilado y arreglo de barba con navaja" },
  { id:4, icon:"💎", name:"Afeitado premium", duration:40, price:10000, color:"#8B6BD4", active:true,  desc:"Afeitado clásico con toalla caliente" },
  { id:5, icon:"✦",  name:"Diseño de cejas",  duration:15, price:4000,  color:"#C0392B", active:false, desc:"Diseño y perfilado de cejas" },
  { id:6, icon:"👦", name:"Corte niño",        duration:25, price:6000,  color:"#C8963C", active:true,  desc:"Para menores de 12 años" },
];

const barbers = [
  { id:1, name:"Matías González",   specialty:"Fades & cortes modernos",  img:BARBER_1, active:true,  days:"Lun-Vie · 09:00–18:00" },
  { id:2, name:"Sebastián Rojas",   specialty:"Barba & afeitado clásico", img:BARBER_2, active:true,  days:"Mar-Sáb · 10:00–19:00" },
  { id:3, name:"Diego Fuentes",     specialty:"Diseños & degradados",     img:BARBER_3, active:false, days:"Jue-Dom · 12:00–20:00" },
];

function ToggleSwitch({ active, onToggle }: { active:boolean; onToggle:()=>void }) {
  return (
    <button onClick={onToggle} className="relative rounded-full flex-shrink-0 transition-all" style={{ backgroundColor:active?"#C8963C":"#2A261F", width:36, height:20 }}>
      <span className="absolute top-[2px] rounded-full bg-white shadow transition-all duration-200" style={{ left:active?"calc(100%-18px)":2, width:16, height:16 }} />
    </button>
  );
}

export default function AdminServices() {
  const [services, setServices] = useState(initialServices);
  const [showModal, setShowModal] = useState(false);
  const [editingSvc, setEditingSvc] = useState<typeof initialServices[0]|null>(null);
  const [tab, setTab] = useState<"services"|"barbers">("services");

  return (
    <div>
      <div className="flex gap-1 mb-5 p-1 rounded border w-fit" style={{ borderColor:"#1E1B17", backgroundColor:"#131210" }}>
        {(["services","barbers"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className="px-5 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all"
            style={{ backgroundColor:tab===t?"#C8963C":"transparent", color:tab===t?"#0A0907":"#7A7367" }}>
            {t==="services"?"Servicios":"Barberos"}
          </button>
        ))}
      </div>

      {tab==="services" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs opacity-30 tracking-wider" style={{ color:"#EDE8DE" }}>{services.filter(s=>s.active).length} ACTIVOS</p>
            <button onClick={()=>{setEditingSvc(null);setShowModal(true);}} className="flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-semibold tracking-wide" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>
              <Plus size={14} /> Nuevo servicio
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map(s=>(
              <div key={s.id} className="rounded border p-5 transition-all" style={{ backgroundColor:"#131210", borderColor:"#1E1B17", opacity:s.active?1:0.45 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded flex items-center justify-center text-lg" style={{ backgroundColor:`${s.color}12` }}>{s.icon}</div>
                    <div>
                      <p className="font-display italic font-medium text-sm" style={{ color:"#EDE8DE" }}>{s.name}</p>
                      <p className="font-mono text-[10px] opacity-30 tracking-wider mt-0.5">{s.duration} min</p>
                    </div>
                  </div>
                  <ToggleSwitch active={s.active} onToggle={()=>setServices(prev=>prev.map(sv=>sv.id===s.id?{...sv,active:!sv.active}:sv))} />
                </div>
                <p className="text-xs mb-4 opacity-40 leading-relaxed" style={{ color:"#EDE8DE" }}>{s.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor:"#1E1B17" }}>
                  <span className="font-display italic text-xl font-semibold" style={{ color:"#C8963C" }}>${s.price.toLocaleString("es-CL")}</span>
                  <div className="flex gap-1">
                    <button onClick={()=>{setEditingSvc(s);setShowModal(true);}} className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17] transition-colors"><Edit size={13} style={{ color:"#7A7367" }} /></button>
                    <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17] transition-colors"><Trash2 size={13} style={{ color:"#C0392B" }} /></button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={()=>{setEditingSvc(null);setShowModal(true);}}
              className="rounded border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2 min-h-[140px] transition-all hover:border-[#C8963C]"
              style={{ borderColor:"#1E1B17" }}>
              <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor:"rgba(200,150,60,0.08)" }}>
                <Plus size={18} style={{ color:"#C8963C" }} />
              </div>
              <span className="font-mono text-xs tracking-wider opacity-30" style={{ color:"#EDE8DE" }}>AGREGAR</span>
            </button>
          </div>
        </div>
      )}

      {tab==="barbers" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs opacity-30 tracking-wider" style={{ color:"#EDE8DE" }}>{barbers.filter(b=>b.active).length} ACTIVOS</p>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-semibold tracking-wide" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>
              <Plus size={14} /> Agregar barbero
            </button>
          </div>
          <div className="space-y-3">
            {barbers.map(b=>(
              <div key={b.id} className="rounded border p-5 flex items-center gap-4" style={{ backgroundColor:"#131210", borderColor:"#1E1B17", opacity:b.active?1:0.45 }}>
                <img src={b.img} alt={b.name} className="w-12 h-12 rounded-full object-cover grayscale flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-display italic font-medium" style={{ color:"#EDE8DE" }}>{b.name}</p>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-sm tracking-wider" style={{ backgroundColor:b.active?"rgba(46,125,91,0.1)":"rgba(192,57,43,0.1)", color:b.active?"#2E7D5B":"#C0392B" }}>
                      {b.active?"ACTIVO":"INACTIVO"}
                    </span>
                  </div>
                  <p className="text-xs opacity-40 mb-1" style={{ color:"#EDE8DE" }}>{b.specialty}</p>
                  <p className="font-mono text-[10px] opacity-20" style={{ color:"#EDE8DE" }}>⏰ {b.days}</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded border flex items-center justify-center hover:border-[#C8963C] transition-all" style={{ borderColor:"#1E1B17" }}><Edit size={13} style={{ color:"#7A7367" }} /></button>
                  <button className="w-8 h-8 rounded border flex items-center justify-center hover:border-[#C0392B] transition-all" style={{ borderColor:"#1E1B17" }}><Trash2 size={13} style={{ color:"#C0392B" }} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor:"rgba(0,0,0,0.7)" }}>
          <div className="rounded border w-full max-w-md p-6" style={{ backgroundColor:"#131210", borderColor:"#2A261F" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display italic text-xl font-light" style={{ color:"#EDE8DE" }}>{editingSvc?"Editar servicio":"Nuevo servicio"}</h3>
              <button onClick={()=>setShowModal(false)} className="opacity-30 hover:opacity-70"><X size={18} style={{ color:"#EDE8DE" }} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label:"Nombre", placeholder:"Ej. Corte clásico", def:editingSvc?.name||"" },
                { label:"Duración (min)", placeholder:"30", def:editingSvc?.duration.toString()||"" },
                { label:"Precio (CLP)", placeholder:"8000", def:editingSvc?.price.toString()||"" },
                { label:"Descripción", placeholder:"Breve descripción", def:editingSvc?.desc||"" },
              ].map(f=>(
                <div key={f.label}>
                  <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40" style={{ color:"#EDE8DE" }}>{f.label}</label>
                  <input defaultValue={f.def} placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded border text-sm outline-none bg-transparent transition-all"
                    style={{ borderColor:"#2A261F", color:"#EDE8DE" }}
                    onFocus={e=>e.target.style.borderColor="#C8963C"}
                    onBlur={e=>e.target.style.borderColor="#2A261F"} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowModal(false)} className="flex-1 py-3 rounded border text-xs font-semibold tracking-wider" style={{ borderColor:"#2A261F", color:"#7A7367" }}>Cancelar</button>
              <button onClick={()=>setShowModal(false)} className="flex-1 py-3 rounded text-xs font-semibold tracking-wider" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>
                {editingSvc?"Guardar":"Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
