import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "../../lib/queries";

const IMG = "https://images.unsplash.com/photo-1536520002442-39764a41e987?w=900&h=1200&fit=crop&auto=format";

interface AdminLoginProps { onLogin: () => void }

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      onLogin();
    } catch (err: any) {
      console.error(err);
      const msg = err?.message ?? "";

      if (msg.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos.");
      } else if (msg.includes("Email not confirmed")) {
        setError("El email no está confirmado. Contacta al administrador.");
      } else if (msg.includes("rate limit") || msg.includes("Too many")) {
        setError("Demasiados intentos. Espera un minuto e intenta de nuevo.");
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#13110D" }}>
      {/* Lado imagen */}
      <div className="hidden lg:block w-[42%] relative overflow-hidden">
        <img src={IMG} alt="BarberFlow interior"
             className="absolute inset-0 w-full h-full object-cover"
             style={{ filter: "sepia(15%) contrast(105%) opacity(0.5)" }} />
        <div className="absolute inset-0"
             style={{ background: "linear-gradient(to right, transparent 60%, #13110D 100%)" }} />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-4xl font-light leading-tight mb-4"
             style={{ fontStyle: "italic", color: "#EDE4D3" }}>
            "Gestiona tu barbería como un profesional."
          </p>
          <p className="font-mono text-xs tracking-widest opacity-30" style={{ color: "#EDE4D3" }}>
            BARBERFLOW · PANEL DE ADMINISTRACIÓN
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center font-display font-bold text-sm italic"
                 style={{ backgroundColor: "#C9552A", color: "#13110D" }}>BF</div>
            <span className="font-display font-semibold" style={{ color: "#EDE4D3" }}>BarberFlow</span>
            <span className="ml-2 font-mono text-xs opacity-30 tracking-widest" style={{ color: "#EDE4D3" }}>
              ADMIN
            </span>
          </div>

          <p className="font-mono text-xs tracking-widest uppercase mb-3 opacity-40" style={{ color: "#EDE4D3" }}>
            Acceso al panel
          </p>
          <h1 className="font-display text-3xl font-light mb-12"
              style={{ fontStyle: "italic", color: "#EDE4D3" }}>
            Bienvenido de vuelta
          </h1>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded border p-3 flex items-start gap-2 text-xs"
                 style={{ borderColor: "#5F2A22", backgroundColor: "rgba(201,85,42,0.08)", color: "#F2B8A0" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase mb-2 opacity-40"
                     style={{ color: "#EDE4D3" }}>
                Correo
              </label>
              <input type="email" required value={email} disabled={loading}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="admin@barberflow.cl"
                     className="w-full px-4 py-4 rounded border text-sm outline-none bg-transparent transition-all"
                     style={{ borderColor: "#302A22", color: "#EDE4D3" }}
                     onFocus={e => e.target.style.borderColor = "#C9552A"}
                     onBlur={e => e.target.style.borderColor = "#302A22"} />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase mb-2 opacity-40"
                     style={{ color: "#EDE4D3" }}>
                Contraseña
              </label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required value={password} disabled={loading}
                       onChange={e => setPassword(e.target.value)}
                       placeholder="••••••••"
                       className="w-full px-4 py-4 rounded border text-sm outline-none bg-transparent transition-all pr-12"
                       style={{ borderColor: "#302A22", color: "#EDE4D3" }}
                       onFocus={e => e.target.style.borderColor = "#C9552A"}
                       onBlur={e => e.target.style.borderColor = "#302A22"} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity">
                  {showPass ? <EyeOff size={16} style={{ color: "#EDE4D3" }} />
                            : <Eye    size={16} style={{ color: "#EDE4D3" }} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs opacity-40 hover:opacity-70 transition-opacity"
                     style={{ color: "#EDE4D3" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "#C9552A" }} />
                Recordarme
              </label>
              <button type="button"
                      className="font-mono text-xs opacity-40 hover:opacity-70 transition-opacity tracking-wider"
                      style={{ color: "#C9552A" }}>
                Olvidé contraseña
              </button>
            </div>

            <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded text-sm font-semibold tracking-wide transition-all hover:opacity-90"
                    style={{ backgroundColor: "#C9552A", color: "#13110D", opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Ingresando...
                </span>
              ) : (
                <><span>Ingresar</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-12 font-mono text-xs opacity-20 text-center tracking-wider" style={{ color: "#EDE4D3" }}>
            ¿Problemas? Contacta a soporte
          </p>
        </div>
      </div>
    </div>
  );
}