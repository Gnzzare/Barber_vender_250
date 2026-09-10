import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1536520002442-39764a41e987?w=900&h=1200&fit=crop&auto=format";

interface AdminLoginProps { onLogin: () => void }

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail]       = useState("admin@barberflow.cl");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0A0907" }}>
      {/* Left image */}
      <div className="hidden lg:block w-[42%] relative overflow-hidden">
        <img src={IMG} alt="BarberFlow interior" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, #0A0907 100%)" }} />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-4xl font-light leading-tight mb-4" style={{ fontStyle:"italic", color:"#EDE8DE" }}>
            "Gestiona tu barbería como un profesional."
          </p>
          <p className="font-mono text-xs tracking-widest opacity-30" style={{ color:"#EDE8DE" }}>BARBERFLOW · PANEL DE ADMINISTRACIÓN</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded flex items-center justify-center font-display font-bold text-sm italic" style={{ backgroundColor:"#C8963C", color:"#0A0907" }}>BF</div>
            <span className="font-display font-semibold" style={{ color:"#EDE8DE" }}>BarberFlow</span>
            <span className="ml-2 font-mono text-xs opacity-30 tracking-widest" style={{ color:"#EDE8DE" }}>ADMIN</span>
          </div>

          <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40" style={{ color:"#EDE8DE" }}>Acceso al panel</p>
          <h1 className="font-display text-3xl font-light mb-12" style={{ fontStyle:"italic", color:"#EDE8DE" }}>Bienvenido de vuelta</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase mb-2 opacity-40" style={{ color:"#EDE8DE" }}>Correo</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full px-4 py-4 rounded border text-sm outline-none bg-transparent transition-all"
                style={{ borderColor:"#2A261F", color:"#EDE8DE" }}
                onFocus={e=>e.target.style.borderColor="#C8963C"}
                onBlur={e=>e.target.style.borderColor="#2A261F"} />
            </div>
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase mb-2 opacity-40" style={{ color:"#EDE8DE" }}>Contraseña</label>
              <div className="relative">
                <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  className="w-full px-4 py-4 rounded border text-sm outline-none bg-transparent transition-all pr-12"
                  style={{ borderColor:"#2A261F", color:"#EDE8DE" }}
                  onFocus={e=>e.target.style.borderColor="#C8963C"}
                  onBlur={e=>e.target.style.borderColor="#2A261F"} />
                <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity">
                  {showPass ? <EyeOff size={16} style={{ color:"#EDE8DE" }} /> : <Eye size={16} style={{ color:"#EDE8DE" }} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs opacity-40 hover:opacity-70 transition-opacity" style={{ color:"#EDE8DE" }}>
                <input type="checkbox" defaultChecked style={{ accentColor:"#C8963C" }} />
                Recordarme
              </label>
              <button type="button" className="font-mono text-xs opacity-40 hover:opacity-70 transition-opacity tracking-wider" style={{ color:"#C8963C" }}>
                Olvidé contraseña
              </button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded text-sm font-semibold tracking-wide transition-all hover:opacity-90"
              style={{ backgroundColor:"#C8963C", color:"#0A0907", opacity:loading?0.7:1 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0A0907]/30 border-t-[#0A0907] rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : <><span>Ingresar</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-12 font-mono text-xs opacity-20 text-center tracking-wider" style={{ color:"#EDE8DE" }}>
            ¿Problemas? Contacta a soporte
          </p>
        </div>
      </div>
    </div>
  );
}
