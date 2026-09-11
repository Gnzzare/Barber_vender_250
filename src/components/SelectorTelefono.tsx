import { PAISES, validarTelefono } from "../lib/queries";

interface Props {
  codigoPais: string;
  numero: string;
  onChangePais: (code: string) => void;
  onChangeNumero: (numero: string) => void;
  borderColor: string;
  bgColor: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  errorColor?: string;
}

export default function SelectorTelefono({
  codigoPais, numero, onChangePais, onChangeNumero,
  borderColor, bgColor, textColor, mutedColor, accentColor, errorColor = "#C9552A",
}: Props) {
  const validacion = numero ? validarTelefono(codigoPais, numero) : { valido: true };

  function handleNumero(v: string) {
    // Solo dígitos, espacios, guiones
    const limpio = v.replace(/[^\d\s-]/g, "").slice(0, 16);
    onChangeNumero(limpio);
  }

  return (
    <div>
      <div className="flex items-stretch">
        <select value={codigoPais} onChange={e => onChangePais(e.target.value)}
                className="px-2 py-3.5 rounded-l border border-r-0 font-mono text-sm outline-none cursor-pointer"
                style={{ borderColor, backgroundColor: bgColor, color: textColor }}>
          {PAISES.map(p => (
            <option key={p.code} value={p.code} style={{ backgroundColor: bgColor }}>
              {p.flag} +{p.code}
            </option>
          ))}
        </select>
        <input type="tel" value={numero} placeholder="9 1234 5678"
               onChange={e => handleNumero(e.target.value)}
               className="w-full px-4 py-3.5 rounded-r border text-sm outline-none bg-transparent font-mono"
               style={{ borderColor, color: textColor }}
               onFocus={e => e.target.style.borderColor = accentColor}
               onBlur={e => e.target.style.borderColor = borderColor} />
      </div>
      {!validacion.valido && (
        <p className="text-xs mt-1.5" style={{ color: errorColor }}>{validacion.error}</p>
      )}
    </div>
  );
}