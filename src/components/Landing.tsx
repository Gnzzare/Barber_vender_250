import { useState, useEffect } from "react";
import { ArrowUpRight, MapPin, MessageCircle, Star, Menu, X, ArrowRight, Loader2, Clock, Phone } from "lucide-react";
import { getServicios, getBarberos, getConfiguracion, type Servicio, type Barbero, type Configuracion } from "../lib/queries";

// ─── Paleta ────────────────────────────────────────────
const C = {
  bg:         "#13110D",
  surface:    "#1C1914",
  border:     "#302A22",
  text:       "#EDE4D3",
  muted:      "#8A7F6D",
  muted2:     "#5F5849",
  rust:       "#C9552A",
  rustHover:  "#D9663A",
  green:      "#3D5A4A",
  cream:      "#F2E9D8",
  creamBorder:"#DFD3BC",
  creamText:  "#1A1714",
  creamMuted: "#6B6055",
};

const IMG_HERO = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1000&h=1400&fit=crop&auto=format";
const IMG_SHOP = "https://images.unsplash.com/photo-1546664278-c0a27e0cdc88?w=900&h=600&fit=crop&auto=format";

interface LandingProps { onBook: () => void }

export default function Landing({ onBook }: LandingProps) {
  const [menu, setMenu]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered]   = useState<string | null>(null);

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberos, setBarberos]   = useState<Barbero[]>([]);
  const [config, setConfig]       = useState<Configuracion | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    Promise.all([getServicios(), getBarberos(), getConfiguracion()])
      .then(([s, b, c]) => { setServicios(s); setBarberos(b); setConfig(c); })
      .catch(err => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <Loader2 className="animate-spin" size={32} style={{ color: C.rust }} />
      </div>
    );
  }

  const nombre   = config?.nombre_negocio ?? "BarberFlow";
  const direccion= config?.direccion     ?? "Av. Providencia 1234";
  const telefono = config?.telefono      ?? "+56 9 8765 4321";

  return (
    <div style={{ backgroundColor: C.bg, color: C.text }}>

      {/* ─── TOP STRIP ─────────────────────────────── */}
      <div className="text-[10px] tracking-[0.2em] uppercase font-mono"
           style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, color: C.muted }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-9 flex items-center justify-between">
          <span>Providencia · Est. 2016</span>
          <span className="hidden md:block">Lun–Vie 10–20h · Sáb 10–18h</span>
          <a href={`tel:${telefono}`} className="hover:opacity-100 opacity-70 transition-opacity flex items-center gap-1.5">
            <Phone size={11} /> {telefono}
          </a>
        </div>
      </div>

      {/* ─── NAV ───────────────────────────────────── */}
      <nav className="sticky top-0 z-50 transition-all duration-300"
           style={{
             backgroundColor: scrolled ? "rgba(19,17,13,0.9)" : C.bg,
             backdropFilter: scrolled ? "blur(14px)" : "none",
             borderBottom: `1px solid ${C.border}`
           }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center font-display font-bold text-sm italic"
                 style={{ backgroundColor: C.rust, color: C.bg }}>BF</div>
            <span className="font-display font-semibold text-base tracking-tight">{nombre}</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {["Servicios", "Equipo", "Cómo funciona", "Contacto"].map(l => (
              <a key={l} href="#" className="text-xs tracking-widest uppercase font-medium opacity-50 hover:opacity-100 transition-opacity">{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onBook}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: C.rust, color: C.bg }}>
              Reservar <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMenu(!menu)}>
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menu && (
          <div className="md:hidden px-6 pb-6 pt-2 space-y-4" style={{ borderTop: `1px solid ${C.border}` }}>
            {["Servicios", "Equipo", "Cómo funciona", "Contacto"].map(l => (
              <a key={l} href="#" onClick={() => setMenu(false)}
                 className="block text-xs tracking-widest uppercase opacity-60 hover:opacity-100">{l}</a>
            ))}
            <button onClick={onBook} className="w-full py-3 rounded-sm text-xs font-bold tracking-widest uppercase"
                    style={{ backgroundColor: C.rust, color: C.bg }}>
              Reservar ahora
            </button>
          </div>
        )}
      </nav>

      {/* ─── HERO ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-[52%_48%] gap-12 lg:gap-16 items-center">

          {/* Texto */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px" style={{ backgroundColor: C.rust }} />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.rust }}>
                Barbería en Providencia
              </span>
            </div>

            <h1 className="font-display mb-8"
                style={{
                  fontSize: "clamp(48px, 7.5vw, 96px)",
                  fontWeight: 500,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  color: C.text,
                }}>
              Cortes que<br />
              aguantan.<br />
              <span style={{ fontStyle: "italic", color: C.rust, fontWeight: 400 }}>Barberos</span> que saben.
            </h1>

            <p className="text-base leading-relaxed max-w-md mb-10" style={{ color: C.muted }}>
              Barbería de barrio desde 2016. Agendás en 30 segundos, te atiende un maestro con oficio, y te vas con un corte como la gente.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <button onClick={onBook}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-sm text-sm font-bold tracking-wider uppercase transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: C.rust, color: C.bg }}>
                Reservar mi hora <ArrowRight size={16} />
              </button>
              <button className="flex items-center gap-2 px-6 py-3.5 rounded-sm text-sm font-medium tracking-wider uppercase border transition-all hover:border-[#C9552A] hover:text-[#C9552A]"
                      style={{ borderColor: C.border, color: C.muted }}>
                Ver la carta
              </button>
            </div>

            <div className="flex items-center gap-6 pt-6" style={{ borderTop: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={C.rust} color={C.rust} />)}
                <span className="text-xs font-medium ml-1">4.9</span>
                <span className="text-xs" style={{ color: C.muted }}>en Google</span>
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: C.border }} />
              <span className="text-xs" style={{ color: C.muted }}>
                {barberos.length} barberos con oficio
              </span>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-sm aspect-[4/5]">
              <img src={IMG_HERO} alt="Barbero trabajando"
                   className="w-full h-full object-cover"
                   style={{ filter: "sepia(8%) contrast(105%)" }} />
              <div className="absolute inset-0"
                   style={{ background: `linear-gradient(to top, ${C.bg} 0%, transparent 40%)` }} />
            </div>

            {/* Tarjeta flotante */}
            <div className="absolute -bottom-4 -left-4 lg:-left-8 rounded-sm p-4 shadow-xl"
                 style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, minWidth: 220 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.green }} />
                <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: C.green }}>
                  Disponible hoy
                </span>
              </div>
              <p className="font-display italic text-lg" style={{ color: C.text }}>
                Hora y media libre
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                En la agenda de Matías
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICIOS (carta) ─────────────────────── */}
      <section style={{ backgroundColor: C.cream, color: C.creamText }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ backgroundColor: C.rust }} />
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.rust }}>
                  La carta
                </span>
              </div>
              <h2 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
                Servicios y precios
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed" style={{ color: C.creamMuted }}>
              Todo lo que hacemos, con precio claro. Sin sorpresas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
            {servicios.map((s, i) => (
              <div key={s.id}
                   className="group cursor-pointer py-7"
                   style={{
                     borderTop: `1px solid ${C.creamBorder}`,
                     borderBottom: i >= servicios.length - 2 ? `1px solid ${C.creamBorder}` : "none"
                   }}
                   onMouseEnter={() => setHovered(s.id)}
                   onMouseLeave={() => setHovered(null)}
                   onClick={onBook}>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="font-display transition-colors"
                      style={{
                        fontSize: "clamp(22px, 2.2vw, 28px)",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        color: hovered === s.id ? C.rust : C.creamText,
                      }}>
                    {s.nombre}
                  </h3>
                  <span className="font-display tabular-nums transition-colors"
                        style={{
                          fontSize: "clamp(20px, 2vw, 26px)",
                          fontWeight: 600,
                          color: hovered === s.id ? C.rust : C.creamText,
                        }}>
                    ${s.precio.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono tracking-wider uppercase" style={{ color: C.creamMuted }}>
                    <Clock size={11} className="inline mb-0.5 mr-1" />{s.duracion} min
                  </span>
                  <span className="opacity-40">·</span>
                  <span style={{ color: C.creamMuted }}>{s.descripcion}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex items-center gap-4">
            <button onClick={onBook}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-sm text-sm font-bold tracking-wider uppercase transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: C.rust, color: C.bg }}>
              Reservar mi hora <ArrowRight size={16} />
            </button>
            <span className="text-xs font-mono tracking-wider" style={{ color: C.creamMuted }}>
              Sin pago online · Pagás al llegar
            </span>
          </div>
        </div>
      </section>

      {/* ─── EQUIPO ────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ backgroundColor: C.rust }} />
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.rust }}>
                  El equipo
                </span>
              </div>
              <h2 className="font-display" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
                Los que cortan
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed" style={{ color: C.muted }}>
              Cada uno con su estilo. Elegí al que más te tinca.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barberos.map((b, i) => (
              <div key={b.id}
                   className="group cursor-pointer"
                   onClick={onBook}
                   style={{ marginTop: i === 1 ? "0" : i === 2 ? "32px" : "32px" }}>
                <div className="relative overflow-hidden rounded-sm aspect-[3/4] mb-5">
                  <img src={b.foto_url ?? ""} alt={b.nombre}
                       className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                       style={{ filter: "sepia(6%) contrast(102%)" }} />
                  <div className="absolute inset-0"
                       style={{ background: "linear-gradient(to top, rgba(19,17,13,0.85) 0%, transparent 55%)" }} />

                  {/* Número grande */}
                  <div className="absolute top-4 left-4 font-display italic text-3xl opacity-30" style={{ color: C.text }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-display text-2xl leading-none mb-1">{b.nombre}</p>
                    <p className="font-display text-2xl leading-none font-semibold" style={{ color: C.rust }}>
                      {b.apellido}
                    </p>
                    <p className="text-xs mt-3 opacity-70 leading-relaxed">{b.especialidad}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, si) => <Star key={si} size={10} fill={C.rust} color={C.rust} />)}
                    <span className="text-xs ml-1.5 font-medium">4.9</span>
                  </div>
                  <span className="font-mono text-[10px] tracking-widest uppercase opacity-40 group-hover:opacity-100 group-hover:text-[#C9552A] transition-all">
                    Reservar →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CÓMO FUNCIONA ─────────────────────────── */}
      <section style={{ backgroundColor: C.cream, color: C.creamText }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-8 h-px" style={{ backgroundColor: C.rust }} />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.rust }}>
              Cómo funciona
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: "01", title: "Elegís servicio", text: "De la carta, lo que necesitás. Con precio y duración claros." },
              { n: "02", title: "Elegís barbero y hora", text: "Al que te guste, a la hora que te acomode. Sin filas." },
              { n: "03", title: "Llegás y listo", text: "Te mandamos recordatorio por WhatsApp 24h antes. Vas, te sentás, te cortás." },
            ].map(s => (
              <div key={s.n}>
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-display italic text-5xl font-semibold" style={{ color: C.rust, opacity: 0.5 }}>
                    {s.n}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: C.creamBorder }} />
                </div>
                <h3 className="font-display text-2xl font-medium mb-3" style={{ letterSpacing: "-0.01em" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.creamMuted }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <button onClick={onBook}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-sm text-sm font-bold tracking-wider uppercase transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: C.rust, color: C.bg }}>
              Comenzar reserva <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIO ────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px" style={{ backgroundColor: C.rust }} />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.rust }}>
              Lo que dicen
            </span>
          </div>

          <blockquote className="font-display mb-10"
                      style={{
                        fontSize: "clamp(28px, 4vw, 48px)",
                        fontWeight: 400,
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                      }}>
            “Voy desde hace 4 años. Antes probé como 5 barberías. Matías es el único que me deja el pelo como me gusta sin que yo tenga que explicar nada.”
          </blockquote>

          <div className="flex items-center gap-4 pt-6" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold"
                 style={{ backgroundColor: C.rust, color: C.bg }}>
              AM
            </div>
            <div>
              <p className="font-semibold text-sm">Andrés Morales</p>
              <p className="text-xs" style={{ color: C.muted }}>Cliente desde 2022</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={C.rust} color={C.rust} />)}
              <span className="text-xs ml-1" style={{ color: C.muted }}>Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── UBICACIÓN + HORARIO ───────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="px-8 lg:px-16 py-20 flex flex-col justify-center"
             style={{ backgroundColor: C.surface, borderRight: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px" style={{ backgroundColor: C.rust }} />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.rust }}>
              Ubicación
            </span>
          </div>
          <h2 className="font-display mb-6"
              style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Providencia,<br />a pasos del metro.
          </h2>
          <div className="space-y-2 mb-8">
            <p className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
              <MapPin size={14} style={{ color: C.rust }} /> {direccion}
            </p>
            <p className="text-sm pl-6" style={{ color: C.muted }}>Metro Manuel Montt · 2 min caminando</p>
          </div>
          <a href={`https://wa.me/${telefono.replace(/\D/g, "")}`}
             className="inline-flex items-center gap-2 px-5 py-3 rounded-sm w-fit text-sm font-bold tracking-wider uppercase transition-all hover:scale-[1.02]"
             style={{ backgroundColor: C.green, color: C.text }}>
            <MessageCircle size={16} /> Escribir por WhatsApp
          </a>
        </div>

        <div className="px-8 lg:px-16 py-20 flex flex-col justify-center"
             style={{ backgroundColor: C.cream, color: C.creamText }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px" style={{ backgroundColor: C.rust }} />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: C.rust }}>
              Horario
            </span>
          </div>
          <div>
            {[
              { d: "Lunes a Viernes", h: "10:00 — 20:00", open: true },
              { d: "Sábado",          h: "10:00 — 18:00", open: true },
              { d: "Domingo",         h: "Cerrado",        open: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-5"
                   style={{ borderBottom: `1px solid ${C.creamBorder}` }}>
                <span className="font-display text-lg font-medium" style={{ letterSpacing: "-0.01em" }}>{r.d}</span>
                <span className="font-mono text-sm" style={{ color: r.open ? C.creamText : C.rust }}>
                  {r.h}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs font-mono tracking-wider" style={{ color: C.creamMuted }}>
            Cerrado en feriados irrenunciables
          </p>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="h-40 overflow-hidden relative">
          <img src={IMG_SHOP} alt="Interior" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0"
               style={{ background: `linear-gradient(to bottom, ${C.bg} 0%, transparent 40%, ${C.bg} 100%)` }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center font-display font-bold text-sm italic"
                   style={{ backgroundColor: C.rust, color: C.bg }}>BF</div>
              <span className="font-display font-semibold">{nombre}</span>
            </div>
            <div className="flex flex-wrap gap-6">
              {["Servicios", "Equipo", "Cómo funciona", "Reservar"].map(l => (
                <a key={l} href="#" className="text-xs tracking-widest uppercase opacity-30 hover:opacity-80 transition-opacity">{l}</a>
              ))}
            </div>
            <p className="font-mono text-[10px] tracking-widest opacity-30">
              © {new Date().getFullYear()} {nombre.toUpperCase()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}