import { useState, useEffect } from "react";
import { Upload, MessageCircle, Calendar, Link as LinkIcon, Loader2, AlertCircle, Check } from "lucide-react";
import { getConfiguracion, actualizarConfiguracion, type Configuracion } from "../../lib/queries";

const DIAS_CONFIG = [
  { key: "lunes",     label: "Lunes" },
  { key: "martes",    label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves",    label: "Jueves" },
  { key: "viernes",   label: "Viernes" },
  { key: "sabado",    label: "Sábado" },
  { key: "domingo",   label: "Domingo" },
];

type Tab = "perfil" | "horarios" | "notificaciones" | "apariencia" | "integraciones";
const TABS: { id: Tab; label: string }[] = [
  { id: "perfil",         label: "Perfil del negocio" },
  { id: "horarios",       label: "Horarios" },
  { id: "notificaciones", label: "Notificaciones" },
  { id: "apariencia",     label: "Apariencia" },
  { id: "integraciones",  label: "Integraciones" },
];

function Tog({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="relative rounded-full flex-shrink-0 transition-all"
            style={{ backgroundColor: active ? "#C8963C" : "#2A261F", width: 36, height: 20 }}>
      <span className="absolute top-[2px] rounded-full bg-white shadow transition-all duration-200"
            style={{ left: active ? "calc(100% - 18px)" : 2, width: 16, height: 16 }} />
    </button>
  );
}

const inputCls = "w-full px-4 py-3 rounded border text-sm outline-none bg-transparent transition-all";
const inputStyle = { borderColor: "#2A261F", color: "#EDE8DE" };

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("perfil");
  const [config, setConfig]       = useState<Configuracion | null>(null);
  const [loading, setLoading]     = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [exito, setExito]         = useState(false);

  useEffect(() => {
    getConfiguracion()
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleGuardar() {
    if (!config) return;
    setGuardando(true); setError(null); setExito(false);
    try {
      const actualizado = await actualizarConfiguracion(config.id, config);
      setConfig(actualizado);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  function update<K extends keyof Configuracion>(key: K, value: Configuracion[K]) {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  }

  function updateHorario(dia: string, campo: string, valor: any) {
    if (!config) return;
    const nuevos = { ...config.horarios };
    nuevos[dia] = { ...nuevos[dia], [campo]: valor };
    setConfig({ ...config, horarios: nuevos });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" size={28} style={{ color: "#C8963C" }} />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-20">
        <p className="font-display italic text-lg opacity-30" style={{ color: "#EDE8DE" }}>
          No se pudo cargar la configuración
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="flex-shrink-0 px-4 py-2.5 rounded text-xs font-semibold tracking-wide transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: activeTab === t.id ? "#C8963C" : "#131210",
                    color: activeTab === t.id ? "#0A0907" : "#7A7367",
                    border: `1px solid ${activeTab === t.id ? "#C8963C" : "#1E1B17"}`,
                  }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-5 rounded border p-3 flex items-start gap-2 text-xs"
             style={{ borderColor: "#5F2A22", backgroundColor: "rgba(201,85,42,0.08)", color: "#F2B8A0" }}>
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {exito && (
        <div className="mb-5 rounded border p-3 flex items-start gap-2 text-xs"
             style={{ borderColor: "rgba(46,125,91,0.4)", backgroundColor: "rgba(46,125,91,0.08)", color: "#7DCFA8" }}>
          <Check size={14} className="flex-shrink-0 mt-0.5" /><span>Cambios guardados correctamente</span>
        </div>
      )}

      {/* PERFIL */}
      {activeTab === "perfil" && (
        <div className="rounded border p-6 max-w-xl space-y-5"
             style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor: "#1E1B17" }}>
            <div className="w-16 h-16 rounded flex items-center justify-center text-3xl"
                 style={{ backgroundColor: "#0F0D0B" }}>
              ✂️
            </div>
            <div>
              <p className="font-mono text-xs tracking-wider opacity-40 mb-2" style={{ color: "#EDE8DE" }}>
                LOGO DEL NEGOCIO
              </p>
              <button className="flex items-center gap-2 px-3 py-2 rounded border font-mono text-xs tracking-wider hover:border-[#C8963C] transition-all"
                      style={{ borderColor: "#2A261F", color: "#7A7367" }}>
                <Upload size={12} /> SUBIR (próximamente)
              </button>
            </div>
          </div>

          {[
            { key: "nombre_negocio", label: "Nombre del negocio", placeholder: "BarberFlow" },
            { key: "direccion",      label: "Dirección",          placeholder: "Av. Providencia 1234" },
            { key: "telefono",       label: "Teléfono",           placeholder: "+56 9 1234 5678" },
            { key: "instagram",      label: "Instagram",          placeholder: "@barberflow.cl" },
            { key: "email",          label: "Email",              placeholder: "contacto@barberflow.cl" },
          ].map(f => (
            <div key={f.key}>
              <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                     style={{ color: "#EDE8DE" }}>{f.label}</label>
              <input value={(config as any)[f.key] ?? ""} placeholder={f.placeholder}
                     onChange={e => update(f.key as keyof Configuracion, e.target.value as any)}
                     className={inputCls} style={inputStyle}
                     onFocus={e => e.target.style.borderColor = "#C8963C"}
                     onBlur={e => e.target.style.borderColor = "#2A261F"} />
            </div>
          ))}

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                   style={{ color: "#EDE8DE" }}>Descripción</label>
            <textarea value={config.descripcion ?? ""} rows={3}
                      onChange={e => update("descripcion", e.target.value)}
                      className={inputCls + " resize-none"} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#C8963C"}
                      onBlur={e => e.target.style.borderColor = "#2A261F"} />
          </div>

          <button onClick={handleGuardar} disabled={guardando}
                  className="px-6 py-3 rounded text-xs font-semibold tracking-wider flex items-center gap-2"
                  style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: guardando ? 0.7 : 1 }}>
            {guardando && <Loader2 size={14} className="animate-spin" />}
            GUARDAR CAMBIOS
          </button>
        </div>
      )}

      {/* HORARIOS */}
      {activeTab === "horarios" && (
        <div className="rounded border p-6 max-w-2xl"
             style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-5" style={{ color: "#EDE8DE" }}>
            Horario de atención del negocio
          </p>
          <div className="space-y-0">
            {DIAS_CONFIG.map(d => {
              const h = config.horarios[d.key];
              if (!h) return null;
              return (
                <div key={d.key} className="flex items-center gap-4 py-4 border-b last:border-0"
                     style={{ borderColor: "#1E1B17" }}>
                  <Tog active={h.activo} onToggle={() => updateHorario(d.key, "activo", !h.activo)} />
                  <span className="w-24 text-sm font-display italic font-light"
                        style={{ color: h.activo ? "#EDE8DE" : "#7A7367" }}>
                    {d.label}
                  </span>
                  {h.activo ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={h.abre}
                             onChange={e => updateHorario(d.key, "abre", e.target.value)}
                             className="px-3 py-2 rounded border font-mono text-xs outline-none bg-transparent"
                             style={{ borderColor: "#2A261F", color: "#EDE8DE" }} />
                      <span className="opacity-30" style={{ color: "#EDE8DE" }}>—</span>
                      <input type="time" value={h.cierra}
                             onChange={e => updateHorario(d.key, "cierra", e.target.value)}
                             className="px-3 py-2 rounded border font-mono text-xs outline-none bg-transparent"
                             style={{ borderColor: "#2A261F", color: "#EDE8DE" }} />
                    </div>
                  ) : (
                    <span className="font-mono text-xs" style={{ color: "#C0392B" }}>CERRADO</span>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={handleGuardar} disabled={guardando}
                  className="mt-5 px-6 py-3 rounded text-xs font-semibold tracking-wider flex items-center gap-2"
                  style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: guardando ? 0.7 : 1 }}>
            {guardando && <Loader2 size={14} className="animate-spin" />}
            GUARDAR
          </button>
        </div>
      )}

      {/* NOTIFICACIONES */}
      {activeTab === "notificaciones" && (
        <div className="rounded border p-6 max-w-xl space-y-5"
             style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-2" style={{ color: "#EDE8DE" }}>
            Notificaciones automáticas
          </p>
          {[
            { key: "whatsapp_activo", label: "Recordatorio por WhatsApp", desc: "Recordatorio automático antes de la reserva" },
            { key: "email_activo",    label: "Recordatorio por email",    desc: "Confirmación y recordatorio por correo" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-4 border-b"
                 style={{ borderColor: "#1E1B17" }}>
              <div>
                <p className="text-sm font-medium mb-0.5" style={{ color: "#EDE8DE" }}>{n.label}</p>
                <p className="font-mono text-xs opacity-30" style={{ color: "#EDE8DE" }}>{n.desc}</p>
              </div>
              <Tog active={(config as any)[n.key]} onToggle={() => update(n.key as keyof Configuracion, !(config as any)[n.key] as any)} />
            </div>
          ))}
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                   style={{ color: "#EDE8DE" }}>Horas antes del recordatorio</label>
            <select value={config.horas_recordatorio}
                    onChange={e => update("horas_recordatorio", Number(e.target.value))}
                    className="px-4 py-3 rounded border font-mono text-xs outline-none"
                    style={{ borderColor: "#2A261F", backgroundColor: "#0F0D0B", color: "#EDE8DE" }}>
              {[1, 2, 6, 12, 24, 48].map(h => (
                <option key={h} value={h} style={{ backgroundColor: "#131210" }}>{h}h antes</option>
              ))}
            </select>
          </div>
          <button onClick={handleGuardar} disabled={guardando}
                  className="px-6 py-3 rounded text-xs font-semibold tracking-wider flex items-center gap-2"
                  style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: guardando ? 0.7 : 1 }}>
            {guardando && <Loader2 size={14} className="animate-spin" />}
            GUARDAR
          </button>
        </div>
      )}

      {/* APARIENCIA */}
      {activeTab === "apariencia" && (
        <div className="rounded border p-6 max-w-xl"
             style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-5" style={{ color: "#EDE8DE" }}>
            Color principal del negocio
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { c: "#C8963C", l: "Ámbar" },
              { c: "#C9552A", l: "Óxido" },
              { c: "#2E7D5B", l: "Esmeralda" },
              { c: "#6B8ED4", l: "Índigo" },
              { c: "#8B6BD4", l: "Violeta" },
              { c: "#C0392B", l: "Rojo" },
            ].map(p => (
              <button key={p.c} onClick={() => update("color_principal", p.c)}
                      className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 rounded-full border-2 transition-all group-hover:scale-110"
                     style={{ backgroundColor: p.c, borderColor: config.color_principal === p.c ? "#EDE8DE" : "transparent" }} />
                <span className="font-mono text-[9px] opacity-40 tracking-wider" style={{ color: "#EDE8DE" }}>
                  {p.l.toUpperCase()}
                </span>
              </button>
            ))}
          </div>

          <div className="p-5 rounded border" style={{ borderColor: "#2A261F", backgroundColor: "#0F0D0B" }}>
            <p className="font-mono text-[9px] tracking-widest opacity-30 mb-4" style={{ color: "#EDE8DE" }}>
              VISTA PREVIA
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded text-xs font-semibold tracking-wider"
                      style={{ backgroundColor: config.color_principal, color: "#0A0907" }}>
                Reservar ahora
              </button>
              <button className="px-5 py-2.5 rounded border text-xs font-semibold tracking-wider"
                      style={{ borderColor: config.color_principal, color: config.color_principal }}>
                Ver servicios
              </button>
            </div>
          </div>

          <p className="text-xs opacity-40 mt-5 font-mono" style={{ color: "#EDE8DE" }}>
            Nota: Esto solo sera posible si el cliente quiere alguna mejora en su pagina.
          </p>

          <button onClick={handleGuardar} disabled={guardando}
                  className="mt-5 px-6 py-3 rounded text-xs font-semibold tracking-wider flex items-center gap-2"
                  style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: guardando ? 0.7 : 1 }}>
            {guardando && <Loader2 size={14} className="animate-spin" />}
            GUARDAR
          </button>
        </div>
      )}

      {/* INTEGRACIONES */}
      {activeTab === "integraciones" && (
        <div className="rounded border p-6 max-w-xl space-y-4"
             style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-2" style={{ color: "#EDE8DE" }}>
            Integraciones
          </p>
          {[
            { Icon: MessageCircle, name: "WhatsApp Business", desc: "Confirmaciones y recordatorios automáticos", connected: true,  color: "#25D366" },
            { Icon: Calendar,      name: "Google Calendar",   desc: "Sincroniza reservas con tu calendario",     connected: false, color: "#4285F4" },
            { Icon: LinkIcon,     name: "Instagram",          desc: "Muestra disponibilidad en tu perfil",       connected: false, color: "#E1306C" },
            { Icon: LinkIcon,     name: "Booking widget",     desc: "Embed de reservas para tu sitio web",       connected: false, color: "#7A7367" },
          ].map(int => (
            <div key={int.name} className="flex items-center gap-4 py-4 border-b last:border-0"
                 style={{ borderColor: "#1E1B17" }}>
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: `${int.color}12` }}>
                <int.Icon size={18} style={{ color: int.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-0.5" style={{ color: "#EDE8DE" }}>{int.name}</p>
                <p className="font-mono text-[10px] opacity-30 tracking-wide" style={{ color: "#EDE8DE" }}>{int.desc}</p>
              </div>
              <button className="px-3 py-2 rounded font-mono text-[10px] tracking-wider transition-all"
                      style={{
                        backgroundColor: int.connected ? "rgba(46,125,91,0.1)" : "#1E1B17",
                        color: int.connected ? "#2E7D5B" : "#7A7367",
                        border: `1px solid ${int.connected ? "rgba(46,125,91,0.3)" : "#2A261F"}`,
                      }}>
                {int.connected ? "CONECTADO ✓" : "PRÓXIMAMENTE"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}