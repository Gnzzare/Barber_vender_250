import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import Booking from "./components/Booking";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminAgenda from "./components/admin/AdminAgenda";
import AdminClients from "./components/admin/AdminClients";
import AdminServices from "./components/admin/AdminServices";
import AdminReports from "./components/admin/AdminReports";
import AdminSettings from "./components/admin/AdminSettings";
import { getSession, signOut } from "./lib/queries";
import { Loader2 } from "lucide-react";

type View = "landing" | "booking" | "admin-login" | "admin";

export default function App() {
  const [view, setView]           = useState<View>("landing");
  const [adminPage, setAdminPage] = useState("dashboard");
  const [checking, setChecking]   = useState(true);

  // Al arrancar: verificar si hay sesión activa
  useEffect(() => {
    getSession()
      .then(user => {
        if (user) {
          setView("admin");
          setAdminPage("dashboard");
        }
      })
      .catch(err => console.error("Error verificando sesión:", err))
      .finally(() => setChecking(false));
  }, []);

  // Logout real
  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setView("landing");
      setAdminPage("dashboard");
    }
  }

  const renderAdminPage = () => {
    switch (adminPage) {
      case "dashboard": return <AdminDashboard />;
      case "agenda":    return <AdminAgenda />;
      case "clients":   return <AdminClients />;
      case "services":
      case "barbers":   return <AdminServices />;
      case "reports":   return <AdminReports />;
      case "settings":  return <AdminSettings />;
      default:          return <AdminDashboard />;
    }
  };

  // Spinner mientras verifica sesión
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#13110D" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "#C9552A" }} />
      </div>
    );
  }

  if (view === "admin") {
    return (
      <AdminLayout
        currentPage={adminPage}
        onNavigate={setAdminPage}
        onLogout={handleLogout}
      >
        {renderAdminPage()}
      </AdminLayout>
    );
  }

  if (view === "admin-login") {
    return (
      <AdminLogin
        onLogin={() => { setView("admin"); setAdminPage("dashboard"); }}
      />
    );
  }

  if (view === "booking") {
    return <Booking onBack={() => setView("landing")} />;
  }

  return (
    <div className="relative">
      <Landing onBook={() => setView("booking")} />
      {/* Demo nav */}
      <div className="fixed bottom-5 right-5 z-50">
        <div className="rounded border p-3 space-y-2"
             style={{ backgroundColor: "rgba(19,17,13,0.95)", borderColor: "#302A22", backdropFilter: "blur(16px)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
          <p className="font-mono text-[9px] tracking-widest opacity-30 text-center" style={{ color: "#EDE4D3" }}>
            VER PANTALLAS
          </p>
          <button onClick={() => setView("booking")}
                  className="w-full px-4 py-2.5 rounded font-mono text-xs tracking-wider text-left flex items-center gap-2 hover:bg-[#1C1914] transition-colors"
                  style={{ color: "#C9552A" }}>
            ◆ Flujo reserva
          </button>
          <button onClick={() => setView("admin-login")}
                  className="w-full px-4 py-2.5 rounded font-mono text-xs tracking-wider text-left flex items-center gap-2 hover:bg-[#1C1914] transition-colors"
                  style={{ color: "#8A7F6D" }}>
            ◆ Panel admin
          </button>
        </div>
      </div>
    </div>
  );
}