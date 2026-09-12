import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, X, Loader2, Clock, Calendar, AlertCircle, Check, Upload } from "lucide-react";
import {
  getTodosLosServicios, crearServicio, actualizarServicio, eliminarServicio,
  getTodosLosBarberos, crearBarbero, actualizarBarbero, eliminarBarbero,
  actualizarHorariosBarbero, getBloqueosBarbero, crearBloqueo, eliminarBloqueo,
  subirFotoBarbero,
  DIAS, DIAS_LABEL,
  type Servicio, type Barbero, type BloqueoBarbero,
  type HorariosBarbero, type HorarioDia, type DiaSemana,
} from "../../lib/queries";

function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="relative rounded-full flex-shrink-0 transition-all"
            style={{ backgroundColor: active ? "#C8963C" : "#2A261F", width: 36, height: 20 }}>
      <span className="absolute top-[2px] rounded-full bg-white shadow transition-all duration-200"
            style={{ left: active ? "calc(100% - 18px)" : 2, width: 16, height: 16 }} />
    </button>
  );
}

// ─── Modal Servicio ────────────────────────────────────
function ModalServicio({ open, servicio, onClose, onSaved }: {
  open: boolean; servicio: Servicio | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nombre: "", descripcion: "", duracion: 30, precio: 8000,
    icono: "✂️", color: "#C8963C", orden: 0, activo: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (servicio) setForm({
      nombre: servicio.nombre, descripcion: servicio.descripcion ?? "",
      duracion: servicio.duracion, precio: servicio.precio,
      icono: servicio.icono, color: servicio.color,
      orden: servicio.orden, activo: servicio.activo,
    });
    else setForm({ nombre: "", descripcion: "", duracion: 30, precio: 8000, icono: "✂️", color: "#C8963C", orden: 0, activo: true });
  }, [servicio, open]);

  async function handleGuardar() {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (form.duracion <= 0) { setError("La duración debe ser mayor a 0"); return; }
    if (form.precio < 0) { setError("El precio no puede ser negativo"); return; }

    setGuardando(true); setError(null);
    try {
      if (servicio) await actualizarServicio(servicio.id, form);
      else          await crearServicio(form);
      onSaved(); onClose();
    } catch (e: any) { setError(e?.message ?? "Error al guardar"); }
    finally { setGuardando(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="rounded border w-full max-w-md" style={{ backgroundColor: "#131210", borderColor: "#2A261F" }}
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1B17" }}>
          <h3 className="font-display italic text-xl" style={{ color: "#EDE8DE" }}>
            {servicio ? "Editar servicio" : "Nuevo servicio"}
          </h3>
          <button onClick={onClose} className="opacity-30 hover:opacity-70">
            <X size={18} style={{ color: "#EDE8DE" }} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="rounded border p-3 text-xs flex items-start gap-2"
                 style={{ borderColor: "#5F2A22", backgroundColor: "rgba(201,85,42,0.08)", color: "#F2B8A0" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          {[
            { label: "Nombre",        key: "nombre",      type: "text",   placeholder: "Corte clásico" },
            { label: "Descripción",   key: "descripcion", type: "text",   placeholder: "Breve descripción" },
            { label: "Duración (min)",key: "duracion",    type: "number", placeholder: "30" },
            { label: "Precio (CLP)",  key: "precio",      type: "number", placeholder: "8000" },
            { label: "Icono",         key: "icono",       type: "text",   placeholder: "✂️" },
            { label: "Orden",         key: "orden",       type: "number", placeholder: "0" },
          ].map(f => (
            <div key={f.key}>
              <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                     style={{ color: "#EDE8DE" }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                     onChange={e => setForm(p => ({ ...p, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                     className="w-full px-4 py-3 rounded border text-sm outline-none bg-transparent"
                     style={{ borderColor: "#2A261F", color: "#EDE8DE" }}
                     onFocus={e => e.target.style.borderColor = "#C8963C"}
                     onBlur={e => e.target.style.borderColor = "#2A261F"} />
            </div>
          ))}

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                   style={{ color: "#EDE8DE" }}>Color</label>
            <div className="flex gap-2">
              {["#C8963C","#6B8ED4","#2E7D5B","#8B6BD4","#C0392B","#C9552A"].map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                        className="w-8 h-8 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c, borderColor: form.color === c ? "#EDE8DE" : "transparent" }} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: "#1E1B17" }}>
            <span className="text-sm" style={{ color: "#EDE8DE" }}>Activo</span>
            <ToggleSwitch active={form.activo} onToggle={() => setForm(p => ({ ...p, activo: !p.activo }))} />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "#1E1B17" }}>
          <button onClick={onClose} disabled={guardando}
                  className="flex-1 py-3 rounded border text-xs font-semibold tracking-wider hover:bg-[#1E1B17] transition-colors"
                  style={{ borderColor: "#2A261F", color: "#7A7367" }}>
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded text-xs font-semibold tracking-wider"
                  style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: guardando ? 0.7 : 1 }}>
            {guardando ? <><Loader2 size={14} className="animate-spin" />Guardando...</> : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Barbero ─────────────────────────────────────
function ModalBarbero({ open, barbero, onClose, onSaved }: {
  open: boolean; barbero: Barbero | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nombre: "", apellido: "", especialidad: "", foto_url: "",
    instagram: "", color: "#C8963C", activo: true, orden: 0,
  });
  const [guardando, setGuardando]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [previewFoto, setPreviewFoto]   = useState<string>("");

  useEffect(() => {
    if (barbero) {
      setForm({
        nombre: barbero.nombre, apellido: barbero.apellido,
        especialidad: barbero.especialidad ?? "", foto_url: barbero.foto_url ?? "",
        instagram: barbero.instagram ?? "", color: barbero.color,
        activo: barbero.activo, orden: barbero.orden,
      });
      setPreviewFoto(barbero.foto_url ?? "");
    } else {
      setForm({
        nombre: "", apellido: "", especialidad: "", foto_url: "",
        instagram: "", color: "#C8963C", activo: true, orden: 0,
      });
      setPreviewFoto("");
    }
  }, [barbero, open]);

  async function handleGuardar() {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!form.apellido.trim()) { setError("El apellido es obligatorio"); return; }

    setGuardando(true); setError(null);
    try {
      if (barbero) {
        await actualizarBarbero(barbero.id, form);
      } else {
        const horariosDefault = {
          lunes:     { activo: true,  abre: "10:00", cierra: "20:00", almuerzo: { activo: true,  abre: "13:00", cierra: "14:00" } },
          martes:    { activo: true,  abre: "10:00", cierra: "20:00", almuerzo: { activo: true,  abre: "13:00", cierra: "14:00" } },
          miercoles: { activo: true,  abre: "10:00", cierra: "20:00", almuerzo: { activo: true,  abre: "13:00", cierra: "14:00" } },
          jueves:    { activo: true,  abre: "10:00", cierra: "20:00", almuerzo: { activo: true,  abre: "13:00", cierra: "14:00" } },
          viernes:   { activo: true,  abre: "10:00", cierra: "20:00", almuerzo: { activo: true,  abre: "13:00", cierra: "14:00" } },
          sabado:    { activo: true,  abre: "10:00", cierra: "18:00", almuerzo: { activo: false, abre: "13:00", cierra: "14:00" } },
          domingo:   { activo: false, abre: "10:00", cierra: "18:00", almuerzo: { activo: false, abre: "13:00", cierra: "14:00" } },
        };
        await crearBarbero({ ...form, horarios: horariosDefault } as any);
      }
      onSaved(); onClose();
    } catch (e: any) { setError(e?.message ?? "Error al guardar"); }
    finally { setGuardando(false); }
  }

  async function handleSubirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFoto(true);
    setError(null);
    try {
      const url = await subirFotoBarbero(file, form.nombre.toLowerCase() || "barbero");
      setForm(p => ({ ...p, foto_url: url }));
      setPreviewFoto(url);
    } catch (err: any) {
      setError(err?.message ?? "Error al subir la foto");
    } finally {
      setSubiendoFoto(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="rounded border w-full max-w-md" style={{ backgroundColor: "#131210", borderColor: "#2A261F" }}
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1E1B17" }}>
          <h3 className="font-display italic text-xl" style={{ color: "#EDE8DE" }}>
            {barbero ? "Editar barbero" : "Nuevo barbero"}
          </h3>
          <button onClick={onClose} className="opacity-30 hover:opacity-70">
            <X size={18} style={{ color: "#EDE8DE" }} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="rounded border p-3 text-xs flex items-start gap-2"
                 style={{ borderColor: "#5F2A22", backgroundColor: "rgba(201,85,42,0.08)", color: "#F2B8A0" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          {/* Foto */}
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                   style={{ color: "#EDE8DE" }}>Foto</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-2"
                   style={{ borderColor: "#2A261F", backgroundColor: "#0F0D0B" }}>
                {previewFoto ? (
                  <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl opacity-30">👤</span>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded border font-mono text-xs tracking-wider hover:border-[#C8963C] transition-all"
                       style={{ borderColor: "#2A261F", color: "#C8963C" }}>
                  {subiendoFoto ? (
                    <><Loader2 size={12} className="animate-spin" /> Subiendo...</>
                  ) : (
                    <><Upload size={12} /> Subir foto</>
                  )}
                  <input type="file" accept="image/png,image/jpeg,image/webp"
                         onChange={handleSubirFoto} disabled={subiendoFoto}
                         className="hidden" />
                </label>
                <p className="font-mono text-[10px] tracking-wider opacity-30 mt-2" style={{ color: "#EDE8DE" }}>
                  PNG, JPG o WEBP · máx 5 MB
                </p>
                {form.foto_url && (
                  <button type="button"
                          onClick={() => { setForm(p => ({ ...p, foto_url: "" })); setPreviewFoto(""); }}
                          className="font-mono text-[10px] tracking-wider mt-2 hover:opacity-80"
                          style={{ color: "#C0392B" }}>
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Campos */}
          {[
            { label: "Nombre",      key: "nombre",       type: "text",   placeholder: "Matías" },
            { label: "Apellido",    key: "apellido",     type: "text",   placeholder: "González" },
            { label: "Especialidad",key: "especialidad", type: "text",   placeholder: "Fades & cortes modernos" },
            { label: "Instagram",   key: "instagram",    type: "text",   placeholder: "@matias.cuts" },
            { label: "Orden",       key: "orden",        type: "number", placeholder: "0" },
          ].map(f => (
            <div key={f.key}>
              <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                     style={{ color: "#EDE8DE" }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                     onChange={e => setForm(p => ({ ...p, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                     className="w-full px-4 py-3 rounded border text-sm outline-none bg-transparent"
                     style={{ borderColor: "#2A261F", color: "#EDE8DE" }}
                     onFocus={e => e.target.style.borderColor = "#C8963C"}
                     onBlur={e => e.target.style.borderColor = "#2A261F"} />
            </div>
          ))}

          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase mb-2 opacity-40"
                   style={{ color: "#EDE8DE" }}>Color</label>
            <div className="flex gap-2">
              {["#C8963C","#6B8ED4","#2E7D5B","#8B6BD4","#C0392B","#C9552A"].map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                        className="w-8 h-8 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c, borderColor: form.color === c ? "#EDE8DE" : "transparent" }} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: "#1E1B17" }}>
            <span className="text-sm" style={{ color: "#EDE8DE" }}>Activo</span>
            <ToggleSwitch active={form.activo} onToggle={() => setForm(p => ({ ...p, activo: !p.activo }))} />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "#1E1B17" }}>
          <button onClick={onClose} disabled={guardando}
                  className="flex-1 py-3 rounded border text-xs font-semibold tracking-wider hover:bg-[#1E1B17]"
                  style={{ borderColor: "#2A261F", color: "#7A7367" }}>
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded text-xs font-semibold tracking-wider"
                  style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: guardando ? 0.7 : 1 }}>
            {guardando ? <><Loader2 size={14} className="animate-spin" />Guardando...</> : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Horarios ────────────────────────────────────
function ModalHorarios({ open, barbero, onClose, onSaved }: {
  open: boolean; barbero: Barbero | null; onClose: () => void; onSaved: () => void;
}) {
  const [horarios, setHorarios] = useState<HorariosBarbero | null>(null);
  const [bloqueos, setBloqueos] = useState<BloqueoBarbero[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevoBloqueo, setNuevoBloqueo] = useState({ fecha: "", horaInicio: "", horaFin: "", motivo: "", todoElDia: true });
  const [agregandoBloqueo, setAgregandoBloqueo] = useState(false);

  useEffect(() => {
    if (barbero && open) {
      setHorarios(barbero.horarios);
      getBloqueosBarbero(barbero.id).then(setBloqueos).catch(console.error);
    }
  }, [barbero, open]);

  function updateDia(dia: DiaSemana, cambios: Partial<HorarioDia>) {
    if (!horarios) return;
    setHorarios({ ...horarios, [dia]: { ...horarios[dia], ...cambios } });
  }

  function updateAlmuerzo(dia: DiaSemana, cambios: Partial<HorarioDia['almuerzo']>) {
    if (!horarios) return;
    setHorarios({ ...horarios, [dia]: { ...horarios[dia], almuerzo: { ...horarios[dia].almuerzo, ...cambios } } });
  }

  async function handleGuardar() {
    if (!barbero || !horarios) return;
    setGuardando(true); setError(null);
    try {
      await actualizarHorariosBarbero(barbero.id, horarios);
      onSaved(); onClose();
    } catch (e: any) { setError(e?.message ?? "Error al guardar"); }
    finally { setGuardando(false); }
  }

  async function handleAgregarBloqueo() {
    if (!barbero || !nuevoBloqueo.fecha) { setError("Selecciona una fecha"); return; }
    if (!nuevoBloqueo.todoElDia && (!nuevoBloqueo.horaInicio || !nuevoBloqueo.horaFin)) {
      setError("Ingresa hora inicio y fin"); return;
    }
    setAgregandoBloqueo(true); setError(null);
    try {
      await crearBloqueo({
        barberoId: barbero.id,
        fecha: nuevoBloqueo.fecha,
        horaInicio: nuevoBloqueo.todoElDia ? null : nuevoBloqueo.horaInicio,
        horaFin:    nuevoBloqueo.todoElDia ? null : nuevoBloqueo.horaFin,
        motivo:     nuevoBloqueo.motivo.trim() || null,
      });
      const nuevos = await getBloqueosBarbero(barbero.id);
      setBloqueos(nuevos);
      setNuevoBloqueo({ fecha: "", horaInicio: "", horaFin: "", motivo: "", todoElDia: true });
    } catch (e: any) { setError(e?.message ?? "Error al crear bloqueo"); }
    finally { setAgregandoBloqueo(false); }
  }

  async function handleEliminarBloqueo(id: string) {
    if (!barbero) return;
    try {
      await eliminarBloqueo(id);
      setBloqueos(prev => prev.filter(b => b.id !== id));
    } catch (e: any) { setError(e?.message ?? "Error al eliminar"); }
  }

  if (!open || !barbero || !horarios) return null;

  const inputCls = "px-2 py-1.5 rounded border text-xs outline-none bg-transparent font-mono";
  const inputStyle = { borderColor: "#2A261F", color: "#EDE8DE" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="rounded border w-full max-w-3xl max-h-[90vh] flex flex-col"
           style={{ backgroundColor: "#131210", borderColor: "#2A261F" }}
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
             style={{ borderColor: "#1E1B17" }}>
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-0.5"
               style={{ color: "#EDE8DE" }}>Horarios y bloqueos</p>
            <h3 className="font-display italic text-xl" style={{ color: "#EDE8DE" }}>
              {barbero.nombre} {barbero.apellido}
            </h3>
          </div>
          <button onClick={onClose} className="opacity-30 hover:opacity-70">
            <X size={18} style={{ color: "#EDE8DE" }} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="rounded border p-3 text-xs flex items-start gap-2"
                 style={{ borderColor: "#5F2A22", backgroundColor: "rgba(201,85,42,0.08)", color: "#F2B8A0" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-3"
               style={{ color: "#EDE8DE" }}>Horario semanal</p>
            <div className="space-y-2">
              {DIAS.map(dia => {
                const d = horarios[dia];
                return (
                  <div key={dia} className="rounded border p-3" style={{ borderColor: "#1E1B17", backgroundColor: "#0F0D0B" }}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <ToggleSwitch active={d.activo} onToggle={() => updateDia(dia, { activo: !d.activo })} />
                      <span className="font-display italic w-12 text-sm"
                            style={{ color: d.activo ? "#EDE8DE" : "#5F5849" }}>
                        {DIAS_LABEL[dia]}
                      </span>
                      {d.activo ? (
                        <>
                          <input type="time" value={d.abre} onChange={e => updateDia(dia, { abre: e.target.value })}
                                 className={inputCls} style={inputStyle} />
                          <span className="opacity-30 text-xs" style={{ color: "#EDE8DE" }}>—</span>
                          <input type="time" value={d.cierra} onChange={e => updateDia(dia, { cierra: e.target.value })}
                                 className={inputCls} style={inputStyle} />

                          <div className="flex items-center gap-2 ml-auto">
                            <span className="font-mono text-[10px] tracking-wider opacity-30"
                                  style={{ color: "#EDE8DE" }}>ALMUERZO</span>
                            <ToggleSwitch active={d.almuerzo.activo}
                                          onToggle={() => updateAlmuerzo(dia, { activo: !d.almuerzo.activo })} />
                            {d.almuerzo.activo && (
                              <>
                                <input type="time" value={d.almuerzo.abre}
                                       onChange={e => updateAlmuerzo(dia, { abre: e.target.value })}
                                       className={inputCls} style={inputStyle} />
                                <span className="opacity-30 text-xs" style={{ color: "#EDE8DE" }}>—</span>
                                <input type="time" value={d.almuerzo.cierra}
                                       onChange={e => updateAlmuerzo(dia, { cierra: e.target.value })}
                                       className={inputCls} style={inputStyle} />
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="font-mono text-xs" style={{ color: "#C0392B" }}>NO TRABAJA</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-40 mb-3"
               style={{ color: "#EDE8DE" }}>Bloqueos puntuales</p>

            {bloqueos.length === 0 ? (
              <p className="font-mono text-xs opacity-30 text-center py-4" style={{ color: "#EDE8DE" }}>
                SIN BLOQUEOS ACTIVOS
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {bloqueos.map(b => (
                  <div key={b.id} className="flex items-center gap-3 rounded border p-3"
                       style={{ borderColor: "#1E1B17", backgroundColor: "#0F0D0B" }}>
                    <Calendar size={14} style={{ color: "#C8963C" }} />
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: "#EDE8DE" }}>
                        {b.fecha}
                        {b.hora_inicio && b.hora_fin && ` · ${b.hora_inicio.slice(0,5)}—${b.hora_fin.slice(0,5)}`}
                        {!b.hora_inicio && !b.hora_fin && ' · Todo el día'}
                      </p>
                      {b.motivo && (
                        <p className="font-mono text-[10px] opacity-40 mt-0.5" style={{ color: "#EDE8DE" }}>{b.motivo}</p>
                      )}
                    </div>
                    <button onClick={() => handleEliminarBloqueo(b.id)}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17] transition-colors">
                      <Trash2 size={12} style={{ color: "#C0392B" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded border p-4 space-y-3" style={{ borderColor: "#2A261F", backgroundColor: "#0F0D0B" }}>
              <p className="font-mono text-[10px] tracking-wider uppercase opacity-40" style={{ color: "#EDE8DE" }}>
                + Agregar bloqueo
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={nuevoBloqueo.fecha}
                       onChange={e => setNuevoBloqueo(p => ({ ...p, fecha: e.target.value }))}
                       className={inputCls + " w-full"} style={inputStyle} />
                <input type="text" placeholder="Motivo (vacaciones, dentista...)"
                       value={nuevoBloqueo.motivo}
                       onChange={e => setNuevoBloqueo(p => ({ ...p, motivo: e.target.value }))}
                       className="px-2 py-1.5 rounded border text-xs outline-none bg-transparent"
                       style={inputStyle} />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={nuevoBloqueo.todoElDia}
                       onChange={e => setNuevoBloqueo(p => ({ ...p, todoElDia: e.target.checked }))}
                       style={{ accentColor: "#C8963C" }} />
                <span className="font-mono text-xs" style={{ color: "#EDE8DE" }}>Todo el día</span>
              </label>

              {!nuevoBloqueo.todoElDia && (
                <div className="flex items-center gap-2">
                  <input type="time" value={nuevoBloqueo.horaInicio}
                         onChange={e => setNuevoBloqueo(p => ({ ...p, horaInicio: e.target.value }))}
                         className={inputCls} style={inputStyle} />
                  <span className="opacity-30 text-xs" style={{ color: "#EDE8DE" }}>—</span>
                  <input type="time" value={nuevoBloqueo.horaFin}
                         onChange={e => setNuevoBloqueo(p => ({ ...p, horaFin: e.target.value }))}
                         className={inputCls} style={inputStyle} />
                </div>
              )}

              <button onClick={handleAgregarBloqueo} disabled={agregandoBloqueo}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-xs font-semibold"
                      style={{ backgroundColor: "#1E1B17", color: "#C8963C", opacity: agregandoBloqueo ? 0.7 : 1 }}>
                {agregandoBloqueo ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Agregar bloqueo
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1E1B17" }}>
          <button onClick={onClose} disabled={guardando}
                  className="flex-1 py-3 rounded border text-xs font-semibold tracking-wider hover:bg-[#1E1B17]"
                  style={{ borderColor: "#2A261F", color: "#7A7367" }}>
            Cerrar
          </button>
          <button onClick={handleGuardar} disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded text-xs font-semibold tracking-wider"
                  style={{ backgroundColor: "#C8963C", color: "#0A0907", opacity: guardando ? 0.7 : 1 }}>
            {guardando ? <><Loader2 size={14} className="animate-spin" />Guardando...</> : "Guardar horarios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────
export default function AdminServices() {
  const [tab, setTab] = useState<"services" | "barbers">("services");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberos, setBarberos]   = useState<Barbero[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalServicio, setModalServicio] = useState<{ open: boolean; servicio: Servicio | null }>({ open: false, servicio: null });
  const [modalHorarios, setModalHorarios] = useState<{ open: boolean; barbero: Barbero | null }>({ open: false, barbero: null });
  const [modalBarbero, setModalBarbero] = useState<{ open: boolean; barbero: Barbero | null }>({ open: false, barbero: null });

  async function cargarTodo() {
    try {
      const [s, b] = await Promise.all([getTodosLosServicios(), getTodosLosBarberos()]);
      setServicios(s); setBarberos(b);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargarTodo(); }, []);

  async function toggleServicioActivo(s: Servicio) {
    try { await actualizarServicio(s.id, { activo: !s.activo }); await cargarTodo(); }
    catch (e) { console.error(e); alert("No se pudo actualizar"); }
  }

  async function handleEliminarServicio(id: string) {
    if (!confirm("¿Eliminar este servicio? Esta acción no se puede deshacer.")) return;
    try { await eliminarServicio(id); await cargarTodo(); }
    catch (e) { console.error(e); alert("No se pudo eliminar"); }
  }

  async function toggleBarberoActivo(b: Barbero) {
    try { await actualizarBarbero(b.id, { activo: !b.activo }); await cargarTodo(); }
    catch (e) { console.error(e); alert("No se pudo actualizar"); }
  }

  async function handleEliminarBarbero(id: string) {
    if (!confirm("¿Eliminar este barbero? También se eliminarán sus bloqueos.")) return;
    try { await eliminarBarbero(id); await cargarTodo(); }
    catch (e) { console.error(e); alert("No se pudo eliminar"); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" size={28} style={{ color: "#C8963C" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded border w-fit" style={{ borderColor: "#1E1B17", backgroundColor: "#131210" }}>
        {(["services","barbers"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
                  className="px-5 py-2 rounded text-xs font-semibold tracking-wider uppercase transition-all"
                  style={{ backgroundColor: tab === t ? "#C8963C" : "transparent", color: tab === t ? "#0A0907" : "#7A7367" }}>
            {t === "services" ? "Servicios" : "Barberos"}
          </button>
        ))}
      </div>

      {/* TAB SERVICIOS */}
      {tab === "services" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs opacity-30 tracking-wider" style={{ color: "#EDE8DE" }}>
              {servicios.filter(s => s.activo).length} ACTIVOS
            </p>
            <button onClick={() => setModalServicio({ open: true, servicio: null })}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-semibold tracking-wide"
                    style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
              <Plus size={14} /> Nuevo servicio
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {servicios.map(s => (
              <div key={s.id} className="rounded border p-5"
                   style={{ backgroundColor: "#131210", borderColor: "#1E1B17", opacity: s.activo ? 1 : 0.45 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded flex items-center justify-center text-lg"
                         style={{ backgroundColor: `${s.color}12` }}>{s.icono}</div>
                    <div>
                      <p className="font-display italic font-medium text-sm" style={{ color: "#EDE8DE" }}>{s.nombre}</p>
                      <p className="font-mono text-[10px] opacity-30 tracking-wider mt-0.5">{s.duracion} min</p>
                    </div>
                  </div>
                  <ToggleSwitch active={s.activo} onToggle={() => toggleServicioActivo(s)} />
                </div>
                <p className="text-xs mb-4 opacity-40 leading-relaxed" style={{ color: "#EDE8DE" }}>{s.descripcion}</p>
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#1E1B17" }}>
                  <span className="font-display italic text-xl font-semibold" style={{ color: "#C8963C" }}>
                    ${s.precio.toLocaleString("es-CL")}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setModalServicio({ open: true, servicio: s })}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17]">
                      <Edit size={13} style={{ color: "#7A7367" }} />
                    </button>
                    <button onClick={() => handleEliminarServicio(s.id)}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#1E1B17]">
                      <Trash2 size={13} style={{ color: "#C0392B" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setModalServicio({ open: true, servicio: null })}
                    className="rounded border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2 min-h-[140px] transition-all hover:border-[#C8963C]"
                    style={{ borderColor: "#1E1B17" }}>
              <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(200,150,60,0.08)" }}>
                <Plus size={18} style={{ color: "#C8963C" }} />
              </div>
              <span className="font-mono text-xs tracking-wider opacity-30" style={{ color: "#EDE8DE" }}>AGREGAR</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB BARBEROS */}
      {tab === "barbers" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs opacity-30 tracking-wider" style={{ color: "#EDE8DE" }}>
              {barberos.filter(b => b.activo).length} ACTIVOS
            </p>
            <button onClick={() => setModalBarbero({ open: true, barbero: null })}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-semibold tracking-wide"
                    style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
              <Plus size={14} /> Agregar barbero
            </button>
          </div>
          <div className="space-y-3">
            {barberos.map(b => (
              <div key={b.id} className="rounded border p-5 flex items-center gap-4"
                   style={{ backgroundColor: "#131210", borderColor: "#1E1B17", opacity: b.activo ? 1 : 0.45 }}>
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                     style={{ backgroundColor: "#0F0D0B" }}>
                  {b.foto_url ? (
                    <img src={b.foto_url} alt={b.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg opacity-30">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-display italic font-medium" style={{ color: "#EDE8DE" }}>
                      {b.nombre} {b.apellido}
                    </p>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-sm tracking-wider"
                          style={{
                            backgroundColor: b.activo ? "rgba(46,125,91,0.1)" : "rgba(192,57,43,0.1)",
                            color: b.activo ? "#2E7D5B" : "#C0392B",
                          }}>
                      {b.activo ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>
                  <p className="text-xs opacity-40 mb-1" style={{ color: "#EDE8DE" }}>{b.especialidad}</p>
                  <p className="font-mono text-[10px] opacity-30" style={{ color: "#EDE8DE" }}>
                    {b.horarios ? DIAS.filter(d => b.horarios[d]?.activo).map(d => DIAS_LABEL[d]).join(" · ") : "Sin horario"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModalHorarios({ open: true, barbero: b })}
                          className="px-3 py-2 rounded border font-mono text-[10px] tracking-wider flex items-center gap-1.5 hover:border-[#C8963C] transition-all"
                          style={{ borderColor: "#1E1B17", color: "#C8963C" }}>
                    <Clock size={12} /> Horarios
                  </button>
                  <ToggleSwitch active={b.activo} onToggle={() => toggleBarberoActivo(b)} />
                  <button onClick={() => setModalBarbero({ open: true, barbero: b })}
                          className="w-8 h-8 rounded border flex items-center justify-center hover:border-[#C8963C] transition-all"
                          style={{ borderColor: "#1E1B17" }}>
                    <Edit size={13} style={{ color: "#7A7367" }} />
                  </button>
                  <button onClick={() => handleEliminarBarbero(b.id)}
                          className="w-8 h-8 rounded border flex items-center justify-center hover:border-[#C0392B] transition-all"
                          style={{ borderColor: "#1E1B17" }}>
                    <Trash2 size={13} style={{ color: "#C0392B" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales */}
      <ModalServicio open={modalServicio.open} servicio={modalServicio.servicio}
                     onClose={() => setModalServicio({ open: false, servicio: null })}
                     onSaved={cargarTodo} />
      <ModalHorarios open={modalHorarios.open} barbero={modalHorarios.barbero}
                     onClose={() => setModalHorarios({ open: false, barbero: null })}
                     onSaved={cargarTodo} />
      <ModalBarbero open={modalBarbero.open} barbero={modalBarbero.barbero}
                    onClose={() => setModalBarbero({ open: false, barbero: null })}
                    onSaved={cargarTodo} />
    </div>
  );
}