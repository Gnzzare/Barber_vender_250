import { useState } from "react";
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

type View = "landing" | "booking" | "admin-login" | "admin";

export default function App() {
  const [view, setView]           = useState<View>("landing");
  const [adminPage, setAdminPage] = useState("dashboard");

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

  if (view === "admin") {
    return (
      <AdminLayout currentPage={adminPage} onNavigate={setAdminPage} onLogout={()=>setView("landing")}>
        {renderAdminPage()}
      </AdminLayout>
    );
  }
  if (view === "admin-login") return <AdminLogin onLogin={()=>{ setView("admin"); setAdminPage("dashboard"); }} />;
  if (view === "booking")     return <Booking onBack={()=>setView("landing")} />;

  return (
    <div className="relative">
      <Landing onBook={()=>setView("booking")} />
      {/* Demo nav */}
      <div className="fixed bottom-5 right-5 z-50">
        <div className="rounded border p-3 space-y-2" style={{ backgroundColor:"rgba(10,9,7,0.95)", borderColor:"#2A261F", backdropFilter:"blur(16px)", boxShadow:"0 8px 40px rgba(0,0,0,0.5)" }}>
          <p className="font-mono text-[9px] tracking-widest opacity-30 text-center" style={{ color:"#EDE8DE" }}>VER PANTALLAS</p>
          <button onClick={()=>setView("booking")}
            className="w-full px-4 py-2.5 rounded font-mono text-xs tracking-wider text-left flex items-center gap-2 hover:bg-[#1E1B17] transition-colors"
            style={{ color:"#C8963C" }}>
            ◆ Flujo reserva
          </button>
          <button onClick={()=>setView("admin-login")}
            className="w-full px-4 py-2.5 rounded font-mono text-xs tracking-wider text-left flex items-center gap-2 hover:bg-[#1E1B17] transition-colors"
            style={{ color:"#7A7367" }}>
            ◆ Panel admin
          </button>
        </div>
      </div>
    </div>
  );
}
