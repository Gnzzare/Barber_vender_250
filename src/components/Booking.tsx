import { useState } from "react";
import { ArrowLeft, Check, Clock, User, Calendar, MessageCircle, ArrowRight } from "lucide-react";

const BARBER_1 = "https://images.unsplash.com/photo-1598524374912-6b0b0bab43dd?w=200&h=200&fit=crop&auto=format";
const BARBER_2 = "https://images.unsplash.com/photo-1663077639920-f5ebd9a6296c?w=200&h=200&fit=crop&auto=format";
const BARBER_3 = "https://images.unsplash.com/photo-1635273051839-003bf06a8751?w=200&h=200&fit=crop&auto=format";

const services = [
  { icon: "✂️", name: "Corte clásico",    duration: "30 min", price: 8000,  priceStr: "$8.000" },
  { icon: "🔥", name: "Corte + barba",    duration: "45 min", price: 12000, priceStr: "$12.000" },
  { icon: "🪒", name: "Arreglo de barba", duration: "20 min", price: 6000,  priceStr: "$6.000" },
  { icon: "💎", name: "Afeitado premium", duration: "40 min", price: 10000, priceStr: "$10.000" },
  { icon: "✦", name: "Diseño de cejas",  duration: "15 min", price: 4000,  priceStr: "$4.000" },
  { icon: "👦", name: "Corte niño",       duration: "25 min", price: 6000,  priceStr: "$6.000" },
];

const barbers = [
  { name: "Matías González",   specialty: "Fades & cortes modernos",  img: BARBER_1, available: true },
  { name: "Sebastián Rojas",   specialty: "Barba & afeitado clásico", img: BARBER_2, available: true },
  { name: "Diego Fuentes",     specialty: "Diseños & degradados",     img: BARBER_3, available: false },
];

const timeSlots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30"];
const bookedSlots = ["09:30","11:00","14:30","16:00"];

function getDates() {
  return Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
}
const dayNames  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const monthNames = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

interface BookingProps { onBack: () => void }

export default function Booking({ onBack }: BookingProps) {
  const [step, setStep]                 = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber]   = useState<number | null>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | null>(null);
  const [selectedTime, setSelectedTime]       = useState<string | null>(null);
  const [form, setForm] = useState({ name:"", phone:"", email:"", notes:"", whatsapp: true });
  const [confirmed, setConfirmed] = useState(false);

  const dates = getDates();
  const canContinue = () => (step===1 && selectedService!==null)||(step===2 && selectedBarber!==null)||(step===3 && selectedDate!==null && selectedTime!==null)||(step===4 && form.name.length>0 && form.phone.length>0);

  const stepLabels = ["Servicio","Barbero","Fecha & hora","Confirmar"];

  if (confirmed) {
    const svc = selectedService !== null ? services[selectedService] : null;
    const brb = selectedBarber !== null ? (selectedBarber === -1 ? { name: "Cualquiera disponible" } : barbers[selectedBarber]) : null;
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0A0907" }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-8" style={{ borderColor: "#C8963C" }}>
            <Check size={36} style={{ color: "#C8963C" }} />
          </div>
          <h1 className="font-display text-4xl font-light mb-3" style={{ fontStyle:"italic", color:"#EDE8DE" }}>Reserva confirmada</h1>
          <p className="text-sm mb-10 opacity-50" style={{ color:"#EDE8DE" }}>Recibirás tu confirmación y recordatorio por WhatsApp.</p>
          <div className="rounded border p-6 text-left mb-6" style={{ borderColor:"#2A261F", backgroundColor:"#131210" }}>
            {[
              { label:"Servicio", value: svc?.name },
              { label:"Barbero",  value: brb?.name },
              { label:"Fecha",    value: selectedDate ? `${dayNames[selectedDate.getDay()]} ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}` : "" },
              { label:"Hora",     value: selectedTime },
              { label:"Duración", value: svc?.duration },
              { label:"Total",    value: svc?.priceStr },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-3 border-b last:border-0 text-sm" style={{ borderColor:"#2A261F" }}>
                <span className="font-mono text-xs tracking-wider opacity-40" style={{ color:"#EDE8DE" }}>{r.label}</span>
                <span className="font-medium" style={{ color:"#EDE8DE" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-2 w-full py-4 rounded text-sm font-semibold" style={{ backgroundColor:"#25D366", color:"white" }}>
              <MessageCircle size={16} /> Compartir por WhatsApp
            </button>
            <button className="flex items-center justify-center gap-2 w-full py-4 rounded text-sm font-semibold border" style={{ borderColor:"#2A261F", color:"#EDE8DE" }}>
              <Calendar size={16} /> Agregar a Google Calendar
            </button>
            <button onClick={onBack} className="text-sm mt-2 opacity-40 hover:opacity-70 transition-opacity" style={{ color:"#EDE8DE" }}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor:"#0A0907", color:"#EDE8DE" }}>
      {/* Top */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor:"#2A261F", backgroundColor:"rgba(10,9,7,0.95)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={step===1 ? onBack : ()=>setStep(s=>s-1)} className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70 opacity-50" style={{ color:"#EDE8DE" }}>
              <ArrowLeft size={15} /> {step===1 ? "Volver" : "Anterior"}
            </button>
            <div className="flex items-center gap-2">
              {stepLabels.map((l,i) => (
                <span key={i} className="font-mono text-xs tracking-wider transition-all" style={{ color: i+1===step ? "#C8963C" : i+1<step ? "#3A3630" : "#3A3630", opacity: i+1===step ? 1 : i+1<step ? 0.5 : 0.25 }}>
                  {i+1<step ? "✓" : `0${i+1}`} {i+1===step ? l : ""}
                </span>
              ))}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-px w-full" style={{ backgroundColor:"#2A261F" }}>
            <div className="h-px transition-all duration-500" style={{ width:`${(step/4)*100}%`, backgroundColor:"#C8963C" }} />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Step 1 */}
        {step===1 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 01</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle:"italic" }}>Elige tu servicio</h2>
            <div className="space-y-0">
              {services.map((s,i) => (
                <button key={i} onClick={()=>setSelectedService(i)}
                  className="w-full flex items-center gap-4 py-5 border-b text-left transition-all duration-150 group"
                  style={{ borderColor:"#2A261F" }}>
                  <span className="font-mono text-xs w-6 flex-shrink-0 transition-colors" style={{ color: selectedService===i ? "#C8963C" : "#3A3630" }}>{s.icon}</span>
                  <span className="font-display text-xl font-light italic flex-1 transition-colors" style={{ color: selectedService===i ? "#C8963C" : "#EDE8DE" }}>{s.name}</span>
                  <span className="font-mono text-xs opacity-40">{s.duration}</span>
                  <span className="font-display text-xl font-semibold transition-colors" style={{ color: selectedService===i ? "#C8963C" : "#EDE8DE" }}>{s.priceStr}</span>
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0" style={{ borderColor: selectedService===i ? "#C8963C" : "#3A3630", backgroundColor: selectedService===i ? "#C8963C" : "transparent" }}>
                    {selectedService===i && <Check size={11} style={{ color:"#0A0907" }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step===2 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 02</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle:"italic" }}>Elige tu barbero</h2>
            <div className="space-y-3">
              <button onClick={()=>setSelectedBarber(-1)}
                className="w-full text-left p-5 rounded border flex items-center gap-4 transition-all"
                style={{ borderColor: selectedBarber===-1 ? "#C8963C" : "#2A261F", backgroundColor: selectedBarber===-1 ? "rgba(200,150,60,0.05)" : "#131210" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor:"#1E1B17" }}>
                  <User size={22} style={{ color:"#C8963C" }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-0.5" style={{ color:"#EDE8DE" }}>Cualquiera disponible</p>
                  <p className="text-xs opacity-50">El primero disponible en el horario elegido</p>
                </div>
                {selectedBarber===-1 && <Check size={16} style={{ color:"#C8963C" }} />}
              </button>
              {barbers.map((b,i) => (
                <button key={i} onClick={()=>b.available&&setSelectedBarber(i)} disabled={!b.available}
                  className="w-full text-left p-5 rounded border flex items-center gap-4 transition-all"
                  style={{ borderColor: selectedBarber===i ? "#C8963C" : "#2A261F", backgroundColor: selectedBarber===i ? "rgba(200,150,60,0.05)" : "#131210", opacity: b.available?1:0.4 }}>
                  <img src={b.img} alt={b.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 grayscale" />
                  <div className="flex-1">
                    <p className="font-display italic text-xl font-light mb-0.5" style={{ color:"#EDE8DE" }}>{b.name}</p>
                    <p className="font-mono text-xs opacity-50">{b.specialty}</p>
                    <span className="inline-block mt-1.5 font-mono text-xs px-2 py-0.5 rounded-sm" style={{ backgroundColor: b.available?"rgba(46,125,91,0.1)":"rgba(192,57,43,0.1)", color: b.available?"#2E7D5B":"#C0392B" }}>
                      {b.available ? "disponible" : "sin disponibilidad"}
                    </span>
                  </div>
                  {selectedBarber===i && <Check size={16} style={{ color:"#C8963C" }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step===3 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 03</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle:"italic" }}>Fecha y hora</h2>
            <p className="font-mono text-xs mb-5 opacity-30 tracking-wider">HORA CHILE · GMT-3</p>
            {/* Dates */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-10">
              {dates.map((d,i) => {
                const sel = selectedDate?.toDateString()===d.toDateString();
                return (
                  <button key={i} onClick={()=>setSelectedDate(d)}
                    className="flex-shrink-0 w-14 h-18 rounded flex flex-col items-center justify-center py-3 border transition-all"
                    style={{ borderColor: sel?"#C8963C":"#2A261F", backgroundColor: sel?"rgba(200,150,60,0.08)":"transparent" }}>
                    <span className="font-mono text-xs mb-1 opacity-50" style={{ color: sel?"#C8963C":"#EDE8DE" }}>{i===0?"HOY":dayNames[d.getDay()]}</span>
                    <span className="font-display text-xl font-semibold" style={{ color: sel?"#C8963C":"#EDE8DE" }}>{d.getDate()}</span>
                    <span className="font-mono text-xs mt-1 opacity-30" style={{ color:"#EDE8DE" }}>{monthNames[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>
            {/* Times */}
            <p className="font-mono text-xs tracking-widest uppercase mb-4 opacity-40">Horarios disponibles</p>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map(t => {
                const booked = bookedSlots.includes(t);
                const sel = selectedTime===t;
                return (
                  <button key={t} onClick={()=>!booked&&setSelectedTime(t)} disabled={booked}
                    className="py-3 rounded border font-mono text-xs transition-all"
                    style={{ borderColor: sel?"#C8963C":booked?"#1E1B17":"#2A261F", backgroundColor: sel?"rgba(200,150,60,0.1)":"transparent", color: sel?"#C8963C":booked?"#3A3630":"#EDE8DE", cursor:booked?"not-allowed":"pointer" }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step===4 && (
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40">Paso 04</p>
            <h2 className="font-display text-4xl font-light mb-10" style={{ fontStyle:"italic" }}>Confirmar reserva</h2>
            {/* Summary */}
            {selectedService!==null && (
              <div className="rounded border p-5 mb-8" style={{ borderColor:"#2A261F", backgroundColor:"#131210" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-xl italic font-light" style={{ color:"#EDE8DE" }}>{services[selectedService].name}</span>
                  <span className="font-display text-xl font-semibold" style={{ color:"#C8963C" }}>{services[selectedService].priceStr}</span>
                </div>
                <div className="flex gap-6 mt-3 pt-3 border-t" style={{ borderColor:"#2A261F" }}>
                  <span className="font-mono text-xs opacity-40">{selectedBarber===-1?"Cualquier barbero":selectedBarber!==null?barbers[selectedBarber].name:""}</span>
                  <span className="font-mono text-xs opacity-40">{selectedDate?`${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`:"--"}</span>
                  <span className="font-mono text-xs opacity-40">{selectedTime||"--"}</span>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {[
                { key:"name",  label:"Nombre completo", placeholder:"Ej. Juan Pérez", type:"text" },
                { key:"phone", label:"Teléfono",        placeholder:"+56 9 XXXX XXXX", type:"tel" },
                { key:"email", label:"Email (opcional)", placeholder:"tu@email.com", type:"email" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block font-mono text-xs tracking-wider uppercase mb-2 opacity-40" style={{ color:"#EDE8DE" }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form] as string}
                    onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
                    className="w-full px-4 py-3.5 rounded border text-sm outline-none transition-all bg-transparent"
                    style={{ borderColor:"#2A261F", color:"#EDE8DE" }}
                    onFocus={e=>e.target.style.borderColor="#C8963C"}
                    onBlur={e=>e.target.style.borderColor="#2A261F"} />
                </div>
              ))}
              <div>
                <label className="block font-mono text-xs tracking-wider uppercase mb-2 opacity-40">Notas (opcional)</label>
                <textarea placeholder="Ej. Dejar los laterales cortos..." value={form.notes}
                  onChange={e=>setForm(prev=>({...prev,notes:e.target.value}))}
                  className="w-full px-4 py-3.5 rounded border text-sm outline-none resize-none bg-transparent"
                  style={{ borderColor:"#2A261F", color:"#EDE8DE" }} rows={3}
                  onFocus={e=>e.target.style.borderColor="#C8963C"}
                  onBlur={e=>e.target.style.borderColor="#2A261F"} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.whatsapp} onChange={e=>setForm(prev=>({...prev,whatsapp:e.target.checked}))} className="mt-1" style={{ accentColor:"#C8963C" }} />
                <span className="text-sm opacity-50" style={{ color:"#EDE8DE" }}>Acepto recibir recordatorio por WhatsApp 24h antes de mi reserva</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t p-4 z-40" style={{ borderColor:"#2A261F", backgroundColor:"rgba(10,9,7,0.97)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {selectedService!==null ? (
            <div>
              <p className="font-mono text-xs opacity-30 tracking-wider">TOTAL</p>
              <p className="font-display text-2xl font-semibold" style={{ color:"#C8963C" }}>{services[selectedService].priceStr}</p>
            </div>
          ) : <div />}
          <button onClick={()=>step<4?setStep(s=>s+1):setConfirmed(true)} disabled={!canContinue()}
            className="flex items-center gap-2 px-8 py-4 rounded text-sm font-semibold tracking-wide transition-all"
            style={{ backgroundColor: canContinue()?"#C8963C":"#2A261F", color: canContinue()?"#0A0907":"#3A3630" }}>
            {step<4?"Continuar":"Confirmar reserva"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
