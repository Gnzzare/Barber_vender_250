import { useState, useEffect, useMemo } from "react";
import { Search, MessageCircle, ChevronRight, X, Clock, Loader2, Calendar, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  getClientes, getHistorialCliente,
  type ClienteCompleto, type ReservaCompleta,
} from "../../lib/queries";

const tagConfig: Record<string, { bg: string; color: string }> = {
  VIP:       { bg: "rgba(200,150,60,0.1)",  color: "#C8963C" },
  Frecuente: { bg: "rgba(107,142,212,0.1)", color: "#6B8ED4" },
  Nuevo:     { bg: "rgba(46,125,91,0.1)",   color: "#2E7D5B" },
};

const monthShort = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

type SortKey = "nombre" | "total_visitas" | "total_gastado" | "ultima_visita";
type SortDir = "asc" | "desc";

function calcularTags(c: ClienteCompleto): string[] {
  const tags: string[] = [];
  if (c.total_visitas >= 20) tags.push("VIP");
  if (c.total_visitas >= 5) tags.push("Frecuente");
  if (c.total_visitas <= 2) tags.push("Nuevo");
  return tags;
}

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return `${d.getDate()} ${monthShort[d.getMonth()]} ${d.getFullYear()}`;
}

function iniciales(nombre: string): string {
  return nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const ESTADO_COLORS: Record<string, string> = {
  confirmada: "#2E7D5B",
  pendiente:  "#C8963C",
  completada: "#6B8ED4",
  cancelada:  "#7A7367",
  "no-show":  "#C0392B",
};

export default function AdminClients() {
  const [clientes, setClientes]     = useState<ClienteCompleto[]>([]);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<ClienteCompleto | null>(null);
  const [historial, setHistorial]   = useState<ReservaCompleta[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingHist, setLoadingHist] = useState(false);

  // Ordenamiento
  const [sortKey, setSortKey] = useState<SortKey>("ultima_visita");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    getClientes()
      .then(setClientes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingHist(true);
    getHistorialCliente(selected.id)
      .then(setHistorial)
      .catch(console.error)
      .finally(() => setLoadingHist(false));
  }, [selected]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      // Mismo campo → invertir dirección
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      // Nuevo campo → default: desc para números/fechas, asc para texto
      setSortKey(key);
      setSortDir(key === "nombre" ? "asc" : "desc");
    }
  }

  // Filtro + ordenamiento
  const filtered = useMemo(() => {
    const filtrados = clientes.filter(c =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.telefono.includes(search)
    );

    const sorted = [...filtrados].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "nombre":
          cmp = a.nombre.localeCompare(b.nombre, "es");
          break;
        case "total_visitas":
          cmp = a.total_visitas - b.total_visitas;
          break;
        case "total_gastado":
          cmp = a.total_gastado - b.total_gastado;
          break;
        case "ultima_visita":
          const fa = a.ultima_visita ? new Date(a.ultima_visita).getTime() : 0;
          const fb = b.ultima_visita ? new Date(b.ultima_visita).getTime() : 0;
          cmp = fa - fb;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [clientes, search, sortKey, sortDir]);

  // Componente de header ordenable
  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    const activo = sortKey === field;
    const Icon = !activo ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th className="text-left px-5 py-3">
        <button onClick={() => toggleSort(field)}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors group"
                style={{ color: activo ? "#C8963C" : "#EDE8DE", opacity: activo ? 1 : 0.3 }}>
          {label}
          <Icon size={11} className={activo ? "" : "opacity-0 group-hover:opacity-50 transition-opacity"} />
        </button>
      </th>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        {/* Buscador */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded border"
               style={{ borderColor: "#1E1B17", backgroundColor: "#131210" }}>
            <Search size={14} style={{ color: "#7A7367" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Buscar por nombre o teléfono..."
                   className="flex-1 text-sm outline-none bg-transparent"
                   style={{ color: "#EDE8DE" }} />
          </div>
          <div className="px-4 py-2.5 rounded border font-mono text-xs flex items-center gap-2"
               style={{ borderColor: "#1E1B17", backgroundColor: "#131210", color: "#7A7367" }}>
            <span style={{ color: "#C8963C" }}>{filtered.length}</span> clientes
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded border overflow-hidden" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin" size={28} style={{ color: "#C8963C" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-display italic text-lg opacity-30 mb-1" style={{ color: "#EDE8DE" }}>
                {search ? "Sin resultados" : "Aún no hay clientes"}
              </p>
              <p className="font-mono text-xs opacity-20" style={{ color: "#EDE8DE" }}>
                {search ? "Probá con otro término" : "Los clientes aparecen al reservar"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#0F0D0B" }}>
                    <SortHeader label="Cliente"       field="nombre" />
                    <th className="text-left px-5 py-3 font-mono text-[10px] tracking-widest uppercase opacity-30"
                        style={{ color: "#EDE8DE" }}>Teléfono</th>
                    <SortHeader label="Visitas"       field="total_visitas" />
                    <SortHeader label="Última visita" field="ultima_visita" />
                    <SortHeader label="Gastado"       field="total_gastado" />
                    <th className="text-left px-5 py-3 font-mono text-[10px] tracking-widest uppercase opacity-30"
                        style={{ color: "#EDE8DE" }}>Tags</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const tags = calcularTags(c);
                    return (
                      <tr key={c.id}
                          className="border-t hover:bg-[#0F0D0B] transition-colors cursor-pointer"
                          style={{ borderColor: "#1E1B17" }}
                          onClick={() => setSelected(c)}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-display italic flex-shrink-0"
                                 style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
                              {iniciales(c.nombre)}
                            </div>
                            <span className="text-sm font-medium" style={{ color: "#EDE8DE" }}>{c.nombre}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs opacity-40" style={{ color: "#EDE8DE" }}>
                          {c.telefono}
                        </td>
                        <td className="px-5 py-4 font-display italic font-semibold"
                            style={{ color: sortKey === "total_visitas" ? "#C8963C" : "#EDE8DE" }}>
                          {c.total_visitas}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs"
                            style={{ color: sortKey === "ultima_visita" ? "#C8963C" : "#EDE8DE", opacity: sortKey === "ultima_visita" ? 1 : 0.4 }}>
                          {formatearFecha(c.ultima_visita)}
                        </td>
                        <td className="px-5 py-4 font-display italic font-semibold"
                            style={{ color: sortKey === "total_gastado" ? "#C8963C" : "#C8963C" }}>
                          ${c.total_gastado.toLocaleString("es-CL")}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {tags.map(t => (
                              <span key={t} className="px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wider"
                                    style={{ backgroundColor: tagConfig[t].bg, color: tagConfig[t].color }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 opacity-20">
                          <ChevronRight size={14} style={{ color: "#EDE8DE" }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Panel lateral */}
      {selected && (
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Card cliente */}
          <div className="rounded border p-5" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs tracking-widest opacity-40" style={{ color: "#EDE8DE" }}>CLIENTE</span>
              <button onClick={() => setSelected(null)}
                      className="opacity-20 hover:opacity-60 transition-opacity">
                <X size={15} style={{ color: "#EDE8DE" }} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-display italic mx-auto mb-3"
                   style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
                {iniciales(selected.nombre)}
              </div>
              <p className="font-display italic text-xl font-light" style={{ color: "#EDE8DE" }}>
                {selected.nombre}
              </p>
              <div className="flex gap-1.5 justify-center mt-2">
                {calcularTags(selected).map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wider"
                        style={{ backgroundColor: tagConfig[t].bg, color: tagConfig[t].color }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              {[
                { l: "Visitas",  v: selected.total_visitas },
                { l: "Gastado",  v: `$${(selected.total_gastado / 1000).toFixed(0)}k` },
                { l: "Última",   v: selected.ultima_visita ? formatearFecha(selected.ultima_visita).split(" ").slice(0, 2).join(" ") : "—" },
              ].map(s => (
                <div key={s.l} className="py-3 rounded" style={{ backgroundColor: "#0F0D0B" }}>
                  <p className="font-display italic font-semibold text-sm" style={{ color: "#C8963C" }}>{s.v}</p>
                  <p className="font-mono text-[9px] tracking-wider opacity-30 mt-0.5" style={{ color: "#EDE8DE" }}>
                    {s.l.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <a href={`https://wa.me/${selected.telefono.replace(/\D/g, "")}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded text-xs font-semibold"
                 style={{ backgroundColor: "#25D366", color: "white" }}>
                <MessageCircle size={13} /> WhatsApp
              </a>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded border text-xs font-semibold hover:bg-[#1E1B17] transition-colors"
                      style={{ borderColor: "#1E1B17", color: "#EDE8DE" }}>
                <Calendar size={13} /> Reservar
              </button>
            </div>
          </div>

          {/* Historial */}
          <div className="rounded border p-5" style={{ backgroundColor: "#131210", borderColor: "#1E1B17" }}>
            <p className="font-mono text-xs tracking-widest uppercase opacity-40 mb-4" style={{ color: "#EDE8DE" }}>
              Historial
            </p>
            {loadingHist ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin" size={20} style={{ color: "#C8963C" }} />
              </div>
            ) : historial.length === 0 ? (
              <p className="font-mono text-xs opacity-30 text-center py-6" style={{ color: "#EDE8DE" }}>
                SIN RESERVAS
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historial.slice(0, 10).map(h => (
                  <div key={h.id} className="flex items-start gap-3 pb-3 border-b last:border-0"
                       style={{ borderColor: "#1E1B17" }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: `${ESTADO_COLORS[h.estado]}15` }}>
                      <Clock size={12} style={{ color: ESTADO_COLORS[h.estado] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "#EDE8DE" }}>
                        {h.servicio?.nombre ?? "—"}
                      </p>
                      <p className="font-mono text-[10px] opacity-30 mt-0.5 truncate">
                        {h.barbero?.nombre ?? "—"} · {formatearFecha(h.fecha)}
                      </p>
                    </div>
                    <span className="font-display italic font-semibold text-sm flex-shrink-0"
                          style={{ color: "#C8963C" }}>
                      ${h.precio.toLocaleString("es-CL")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}