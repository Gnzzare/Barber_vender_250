import { useState } from "react";
import {
  LayoutDashboard, Calendar, Users, Scissors, UserCheck, BarChart3,
  Settings, LogOut, Bell, Search, Plus, Menu, X
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",     id: "dashboard" },
  { icon: Calendar,        label: "Agenda",         id: "agenda"    },
  { icon: Users,           label: "Clientes",       id: "clients"   },
  { icon: Scissors,        label: "Servicios",      id: "services"  },
  { icon: UserCheck,       label: "Barberos",       id: "barbers"   },
  { icon: BarChart3,       label: "Reportes",       id: "reports"   },
  { icon: Settings,        label: "Configuración",  id: "settings"  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function AdminLayout({ children, currentPage, onNavigate, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitles: Record<string, string> = {
    dashboard: "Dashboard", agenda: "Agenda", clients: "Clientes",
    services: "Servicios & Barberos", barbers: "Servicios & Barberos",
    reports: "Reportes", settings: "Configuración",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0F0D0B" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col border-r transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 220, backgroundColor: "#0A0907", borderColor: "#1E1B17", flexShrink: 0 }}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "#1E1B17" }}>
          <div className="w-7 h-7 rounded flex items-center justify-center font-display font-bold text-xs italic flex-shrink-0" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>BF</div>
          <span className="font-display font-semibold text-sm" style={{ color: "#EDE8DE" }}>BarberFlow</span>
          <button className="ml-auto lg:hidden opacity-40 hover:opacity-70" onClick={() => setSidebarOpen(false)}>
            <X size={16} style={{ color: "#EDE8DE" }} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p className="font-mono text-[10px] tracking-widest uppercase opacity-20 px-2 py-2 mt-2" style={{ color: "#EDE8DE" }}>Navegación</p>
          {navItems.map(item => {
            const active = currentPage === item.id || (item.id === "services" && currentPage === "barbers");
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all relative group"
                style={{
                  backgroundColor: active ? "rgba(200,150,60,0.08)" : "transparent",
                  color: active ? "#C8963C" : "#7A7367",
                  borderLeft: `2px solid ${active ? "#C8963C" : "transparent"}`,
                }}>
                <item.icon size={16} />
                <span className="font-medium text-xs tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "#1E1B17" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 font-display italic" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>MG</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "#EDE8DE" }}>Matías González</p>
              <p className="font-mono text-[10px] tracking-wider opacity-30 truncate" style={{ color: "#EDE8DE" }}>ADMIN</p>
            </div>
            <button onClick={onLogout} className="opacity-20 hover:opacity-60 transition-opacity flex-shrink-0">
              <LogOut size={14} style={{ color: "#EDE8DE" }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b flex items-center px-5 gap-4 flex-shrink-0" style={{ borderColor: "#1E1B17", backgroundColor: "#0A0907" }}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} style={{ color: "#EDE8DE" }} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg font-light italic" style={{ color: "#EDE8DE" }}>{pageTitles[currentPage]}</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded border" style={{ borderColor: "#1E1B17", backgroundColor: "#131210", minWidth: 200 }}>
            <Search size={14} style={{ color: "#7A7367" }} />
            <input placeholder="Buscar..." className="text-xs outline-none w-full bg-transparent" style={{ color: "#EDE8DE" }} />
          </div>
          <button className="relative p-2 rounded border transition-all hover:border-[#C8963C]" style={{ borderColor: "#1E1B17" }}>
            <Bell size={16} style={{ color: "#7A7367" }} />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center font-mono" style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>3</span>
          </button>
          <button onClick={() => onNavigate("agenda")}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold tracking-wide transition-all hover:opacity-90"
            style={{ backgroundColor: "#C8963C", color: "#0A0907" }}>
            <Plus size={14} /> Nueva reserva
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: "#0F0D0B" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
