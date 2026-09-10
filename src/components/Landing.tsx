import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, MapPin, Clock, MessageCircle, Star, Menu, X, ArrowRight } from "lucide-react";

const IMG_HERO    = "https://images.unsplash.com/photo-1619233543112-fe382ff3693d?w=900&h=1200&fit=crop&auto=format";
const IMG_CUT     = "https://images.unsplash.com/photo-1661849817260-55bfa0927e4d?w=800&h=1000&fit=crop&auto=format";
const IMG_SHOP    = "https://images.unsplash.com/photo-1546664278-c0a27e0cdc88?w=900&h=600&fit=crop&auto=format";
const IMG_B1      = "https://images.unsplash.com/photo-1598524374912-6b0b0bab43dd?w=700&h=900&fit=crop&auto=format";
const IMG_B2      = "https://images.unsplash.com/photo-1663077639920-f5ebd9a6296c?w=700&h=900&fit=crop&auto=format";
const IMG_B3      = "https://images.unsplash.com/photo-1635273051839-003bf06a8751?w=700&h=900&fit=crop&auto=format";

const SERVICES = [
  { n: "01", name: "Corte clásico",    duration: "30 min", price: "$8.000" },
  { n: "02", name: "Corte + barba",    duration: "45 min", price: "$12.000" },
  { n: "03", name: "Arreglo de barba", duration: "20 min", price: "$6.000" },
  { n: "04", name: "Afeitado premium", duration: "40 min", price: "$10.000" },
  { n: "05", name: "Diseño de cejas",  duration: "15 min", price: "$4.000" },
  { n: "06", name: "Corte niño",       duration: "25 min", price: "$6.000" },
];

const BARBERS = [
  { name: "Matías",    last: "González", specialty: "Fades & cortes modernos",   img: IMG_B1 },
  { name: "Sebastián", last: "Rojas",    specialty: "Barba & afeitado clásico",  img: IMG_B2 },
  { name: "Diego",     last: "Fuentes",  specialty: "Diseños & degradados",      img: IMG_B3 },
];

interface LandingProps { onBook: () => void }

export default function Landing({ onBook }: LandingProps) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ backgroundColor: "#0A0907", color: "#EDE8DE" }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ backgroundColor: scrolled ? "rgba(10,9,7,0.92)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid #2A261F" : "none" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded flex items-center justify-center font-display font-bold text-sm italic" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>BF</div>
            <span className="font-display font-semibold text-base tracking-tight" style={{ color: "#EDE8DE" }}>BarberFlow</span>
          </a>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {["Servicios", "Equipo", "Cómo funciona", "Contacto"].map(l => (
              <a key={l} href="#" className="text-xs tracking-widest uppercase font-medium transition-colors hover:opacity-100 opacity-50" style={{ color: "#EDE8DE" }}>{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onBook} className="flex items-center gap-1.5 px-5 py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
              Reservar <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMenu(!menu)} style={{ color: "#EDE8DE" }}>
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menu && (
          <div className="md:hidden px-6 pb-6 pt-2 border-t space-y-4" style={{ borderColor: "#2A261F", backgroundColor: "#0A0907" }}>
            {["Servicios", "Equipo", "Cómo funciona", "Contacto"].map(l => (
              <a key={l} href="#" className="block text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-colors" style={{ color: "#EDE8DE" }} onClick={() => setMenu(false)}>{l}</a>
            ))}
            <button onClick={onBook} className="w-full py-3 rounded text-xs font-bold tracking-wider uppercase" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
              Reservar ahora
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-[58%_42%] overflow-hidden">
        {/* Left */}
        <div className="flex flex-col justify-end px-6 lg:px-16 pb-16 pt-32 lg:pt-40 relative">
          {/* Background detail */}
          <div className="absolute top-1/3 left-0 w-px h-48 opacity-20" style={{ backgroundColor: "#C8963C" }} />

          <div className="mb-6 flex items-center gap-4">
            <span className="font-mono text-xs tracking-widest opacity-40" style={{ color: "#EDE8DE" }}>EST. 2016</span>
            <div className="h-px flex-1 max-w-16 opacity-20" style={{ backgroundColor: "#C8963C" }} />
            <span className="font-mono text-xs tracking-widest opacity-40" style={{ color: "#EDE8DE" }}>SANTIAGO, CL</span>
          </div>

          <h1 className="font-display leading-[0.9] mb-10" style={{ fontSize: "clamp(68px,10vw,140px)", fontStyle: "italic", color: "#EDE8DE", fontWeight: 300, letterSpacing: "-0.02em" }}>
            El arte<br />
            de un<br />
            <span style={{ color: "#C8963C" }}>buen</span><br />
            corte.
          </h1>

          <p className="text-base leading-relaxed max-w-sm mb-10 opacity-60" style={{ color: "#EDE8DE" }}>
            Barbería de autor en Providencia. Reserva con los mejores de la ciudad, en menos de 30 segundos.
          </p>

          <div className="flex flex-wrap gap-3 mb-14">
            <button onClick={onBook}
              className="flex items-center gap-2 px-7 py-4 rounded text-sm font-semibold tracking-wide transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
              Reservar ahora <ArrowRight size={16} />
            </button>
            <button
              className="flex items-center gap-2 px-7 py-4 rounded text-sm font-medium tracking-wide border transition-all hover:border-[#C8963C] hover:text-[#C8963C]"
              style={{ borderColor: "#2A261F", color: "#7A7367" }}>
              Ver servicios
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-8 pt-6 border-t" style={{ borderColor: "#2A261F" }}>
            {[
              { v: "4.9", l: "estrellas" },
              { v: "+500", l: "clientes" },
              { v: "30s", l: "para reservar" },
              { v: "3", l: "barberos" },
            ].map(s => (
              <div key={s.l}>
                <p className="font-display font-semibold text-2xl leading-none" style={{ color: "#EDE8DE" }}>{s.v}</p>
                <p className="font-mono text-xs mt-1 opacity-40 tracking-widest uppercase">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: photo strip */}
        <div className="hidden lg:block relative overflow-hidden" style={{ backgroundColor: "#131210" }}>
          <img src={IMG_HERO} alt="Barbero en acción" className="absolute inset-0 w-full h-full object-cover opacity-80"
            style={{ objectPosition: "center 20%" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0A0907 0%, transparent 30%)" }} />
          {/* Label */}
          <div className="absolute bottom-8 left-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border" style={{ borderColor: "rgba(200,150,60,0.3)", backgroundColor: "rgba(200,150,60,0.08)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#C8963C" }} />
              <span className="font-mono text-xs tracking-widest" style={{ color: "#C8963C" }}>DISPONIBLE HOY</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ─────────────────────────────── */}
      <div className="border-y overflow-hidden py-4" style={{ borderColor: "#2A261F" }}>
        <div className="marquee-track">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center gap-12 pr-12">
              {["500+ CLIENTES SATISFECHOS", "4.9 ESTRELLAS EN GOOGLE", "3 MAESTROS BARBEROS", "PROVIDENCIA · SANTIAGO", "RESERVA EN 30 SEGUNDOS", "DESDE 2016", "LUNES A SÁBADO"].map(t => (
                <span key={t} className="flex items-center gap-12 whitespace-nowrap">
                  <span className="font-mono text-xs tracking-[0.25em] opacity-40" style={{ color: "#EDE8DE" }}>{t}</span>
                  <span style={{ color: "#C8963C", opacity: 0.4 }}>◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ────────────────────────────────────── */}
      <section style={{ backgroundColor: "#F2EDE3" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
          {/* Service list */}
          <div>
            <div className="flex items-center gap-4 mb-12">
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "#C8963C" }}>SERVICIOS</span>
              <div className="h-px flex-1" style={{ backgroundColor: "#D8D0C4" }} />
            </div>
            <div>
              {SERVICES.map((s, i) => (
                <div key={i}
                  className="group flex items-center gap-4 py-5 border-b cursor-pointer transition-all duration-200 relative px-4 -mx-4 rounded"
                  style={{ borderColor: "#D8D0C4" }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={onBook}>
                  <div className="absolute inset-0 rounded transition-all duration-200" style={{ backgroundColor: hovered === i ? "#0A0907" : "transparent" }} />
                  <span className="font-mono text-xs relative z-10 w-6 flex-shrink-0 transition-colors duration-200" style={{ color: hovered === i ? "#C8963C" : "#B0A898" }}>{s.n}</span>
                  <span className="font-display text-xl font-medium italic relative z-10 flex-1 transition-colors duration-200" style={{ color: hovered === i ? "#EDE8DE" : "#1A1714" }}>{s.name}</span>
                  <div className="flex items-center gap-6 relative z-10">
                    <span className="font-mono text-xs transition-colors duration-200" style={{ color: hovered === i ? "#7A7367" : "#A09888" }}>{s.duration}</span>
                    <span className="font-display text-xl font-semibold transition-colors duration-200" style={{ color: hovered === i ? "#C8963C" : "#1A1714" }}>{s.price}</span>
                    <ArrowUpRight size={16} className="transition-all duration-200" style={{ color: "#C8963C", opacity: hovered === i ? 1 : 0, transform: hovered === i ? "scale(1)" : "scale(0.5)" }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onBook} className="mt-10 flex items-center gap-2 px-7 py-4 rounded text-sm font-semibold tracking-wide transition-all hover:scale-105" style={{ backgroundColor: "#0A0907", color: "#EDE8DE" }}>
              Reservar mi hora <ArrowRight size={16} />
            </button>
          </div>

          {/* Right photo */}
          <div className="hidden lg:block relative overflow-hidden rounded-sm" style={{ backgroundColor: "#D8D0C4" }}>
            <img src={IMG_CUT} alt="Barbero trabajando" className="w-full h-full object-cover" style={{ filter: "grayscale(20%)" }} />
          </div>
        </div>
      </section>

      {/* ── TEAM ────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-4 mb-14">
          <span className="font-mono text-xs tracking-widest uppercase opacity-40">EQUIPO</span>
          <div className="h-px flex-1" style={{ backgroundColor: "#2A261F" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BARBERS.map((b, i) => (
            <div key={i} className="group relative cursor-pointer" onClick={onBook}>
              {/* Photo */}
              <div className="relative overflow-hidden rounded-sm aspect-[3/4]" style={{ backgroundColor: "#131210" }}>
                <img src={b.img} alt={b.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" style={{ filter: "grayscale(60%)" }} />
                <div className="absolute inset-0 transition-opacity duration-300" style={{ background: "linear-gradient(to top, rgba(10,9,7,0.9) 0%, rgba(10,9,7,0.1) 60%)" }} />
                {/* Reserve pill on hover */}
                <div className="absolute top-4 right-4 transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ transform: "translateY(-4px)" }}>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-sm" style={{ backgroundColor: "#C8963C" }}>
                    <span className="font-mono text-xs font-medium" style={{ color: "#0A0907" }}>Reservar</span>
                    <ArrowUpRight size={11} style={{ color: "#0A0907" }} />
                  </div>
                </div>
                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="overflow-hidden">
                    <p className="font-display text-3xl font-light italic leading-tight transition-transform duration-500" style={{ color: "#EDE8DE", transform: "translateY(0)" }}>
                      {b.name}
                    </p>
                  </div>
                  <p className="font-display text-3xl font-semibold leading-tight" style={{ color: "#C8963C" }}>{b.last}</p>
                  <p className="font-mono text-xs mt-3 opacity-50 tracking-wider">{b.specialty}</p>
                </div>
              </div>
              {/* Stars */}
              <div className="flex items-center gap-1 mt-4 ml-1">
                {[...Array(5)].map((_, si) => <Star key={si} size={11} fill="#C8963C" color="#C8963C" />)}
                <span className="font-mono text-xs ml-1 opacity-40" style={{ color: "#EDE8DE" }}>4.{9 - i > 7 ? 9 : 9 - i}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section style={{ backgroundColor: "#F2EDE3" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28">
          <div className="flex items-center gap-4 mb-16">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "#C8963C" }}>CÓMO FUNCIONA</span>
            <div className="h-px flex-1" style={{ backgroundColor: "#D8D0C4" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Elige tu servicio", text: "Selecciona el corte o servicio que buscas entre nuestra carta completa." },
              { n: "02", title: "Escoge barbero y hora", text: "Elige al maestro de tu preferencia y el horario que mejor te acomode." },
              { n: "03", title: "Confirmación al instante", text: "Recibes tu reserva confirmada y un recordatorio 24h antes por WhatsApp." },
            ].map(s => (
              <div key={s.n} className="relative pt-2">
                <p className="font-display font-bold absolute top-0 right-0 leading-none select-none pointer-events-none" style={{ fontSize: "clamp(80px,10vw,120px)", color: "#E0D9CE", fontStyle: "italic" }}>{s.n}</p>
                <div className="relative z-10 pt-16">
                  <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: "#1A1714", fontStyle: "italic" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B6055" }}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <button onClick={onBook} className="flex items-center gap-2 px-8 py-4 rounded text-sm font-semibold tracking-wide transition-all hover:scale-105" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
              Comenzar reserva <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ─────────────────────────────────── */}
      <section className="py-28 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="font-display leading-none mb-6 select-none" style={{ fontSize: 120, color: "#C8963C", opacity: 0.3, fontStyle: "italic", lineHeight: 0.7 }}>"</p>
          <blockquote className="font-display text-3xl md:text-4xl font-light leading-tight mb-10" style={{ color: "#EDE8DE", fontStyle: "italic" }}>
            El mejor corte que he tenido en años. Matías sabe exactamente qué hacer — llegué sin saber bien qué quería y salí perfecto.
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>AM</div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#EDE8DE" }}>Andrés Morales</p>
              <div className="flex gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="#C8963C" color="#C8963C" />)}
              </div>
            </div>
            <div className="ml-auto h-px flex-1 max-w-32 opacity-10" style={{ backgroundColor: "#EDE8DE" }} />
            <span className="font-mono text-xs opacity-30 tracking-widest">RESEÑA VERIFICADA</span>
          </div>
        </div>
      </section>

      {/* ── LOCATION ───────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
        {/* Dark side */}
        <div className="px-10 lg:px-16 py-20 flex flex-col justify-center border-r" style={{ borderColor: "#2A261F", backgroundColor: "#0A0907" }}>
          <span className="font-mono text-xs tracking-widest uppercase mb-8 opacity-40">UBICACIÓN</span>
          <h2 className="font-display leading-tight mb-3" style={{ fontSize: "clamp(36px,5vw,60px)", fontStyle: "italic", color: "#EDE8DE", fontWeight: 300 }}>
            Providencia,<br />Santiago
          </h2>
          <p className="text-sm mb-2 opacity-50" style={{ color: "#EDE8DE" }}>Av. Providencia 1234, of. 201</p>
          <p className="text-sm mb-8 opacity-50" style={{ color: "#EDE8DE" }}>Metro Manuel Montt</p>
          <a href="https://wa.me/56987654321" className="inline-flex items-center gap-2 px-6 py-3 rounded w-fit text-sm font-semibold transition-all hover:scale-105" style={{ backgroundColor: "#25D366", color: "white" }}>
            <MessageCircle size={16} /> Escríbenos por WhatsApp
          </a>
        </div>
        {/* Cream side — hours */}
        <div className="px-10 lg:px-16 py-20 flex flex-col justify-center" style={{ backgroundColor: "#F2EDE3" }}>
          <span className="font-mono text-xs tracking-widest uppercase mb-8" style={{ color: "#C8963C" }}>HORARIO</span>
          <div className="space-y-0">
            {[
              { d: "Lunes — Viernes", h: "10:00 · 20:00", open: true },
              { d: "Sábado",          h: "10:00 · 18:00", open: true },
              { d: "Domingo",         h: "Cerrado",        open: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-5 border-b" style={{ borderColor: "#D8D0C4" }}>
                <span className="font-display text-lg font-medium" style={{ color: "#1A1714", fontStyle: "italic" }}>{r.d}</span>
                <span className="font-mono text-sm" style={{ color: r.open ? "#1A1714" : "#C0392B" }}>{r.h}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2">
            <MapPin size={14} style={{ color: "#C8963C" }} />
            <span className="text-xs font-mono opacity-50" style={{ color: "#1A1714" }}>A 2 min del metro Manuel Montt</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: "#2A261F" }}>
        {/* Big shop photo strip */}
        <div className="h-48 overflow-hidden relative">
          <img src={IMG_SHOP} alt="Interior BarberFlow" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #0A0907 0%, transparent 40%, #0A0907 100%)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded flex items-center justify-center font-display font-bold text-sm italic" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>BF</div>
              <span className="font-display font-semibold text-base" style={{ color: "#EDE8DE" }}>BarberFlow</span>
            </div>
            <div className="flex flex-wrap gap-8">
              {["Servicios", "Equipo", "Cómo funciona", "Reservar"].map(l => (
                <a key={l} href="#" className="text-xs tracking-widest uppercase opacity-30 hover:opacity-70 transition-opacity" style={{ color: "#EDE8DE" }}>{l}</a>
              ))}
            </div>
            <p className="font-mono text-xs opacity-20" style={{ color: "#EDE8DE" }}>© 2026 BarberFlow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
