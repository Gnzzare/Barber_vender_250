import { supabase } from './supabase'

// ============================================
// TIPOS (TypeScript)
// ============================================

export interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  duracion: number
  precio: number
  icono: string
  color: string
  activo: boolean
  orden: number
}

export interface Barbero {
  id: string
  nombre: string
  apellido: string
  especialidad: string | null
  foto_url: string | null
  instagram: string | null
  color: string
  activo: boolean
  orden: number
  horarios: HorariosBarbero
}

export interface Configuracion {
  id: string
  nombre_negocio: string
  descripcion: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  instagram: string | null
  logo_url: string | null
  color_principal: string
  color_fondo: string
  horarios: Record<string, { activo: boolean; abre: string; cierra: string }>
  whatsapp_activo: boolean
  email_activo: boolean
  horas_recordatorio: number
}

// ============================================
// CONSULTAS
// ============================================

export async function getServicios(): Promise<Servicio[]> {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getBarberos(): Promise<Barbero[]> {
  const { data, error } = await supabase
    .from('barberos')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getConfiguracion(): Promise<Configuracion | null> {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// ============================================
// TIPOS extra para reservas
// ============================================

export interface Reserva {
  id: string
  cliente_id: string | null
  barbero_id: string | null
  servicio_id: string | null
  fecha: string
  hora_inicio: string
  duracion: number
  precio: number
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no-show'
  notas: string | null
  created_at: string
  updated_at: string
}

export interface NuevaReserva {
  nombreCliente: string
  telefonoCliente: string
  emailCliente?: string
  barberoId: string | null
  servicioId: string
  fecha: string         // "2026-09-15"
  horaInicio: string    // "10:30"
  duracion: number
  precio: number
  notas?: string
}

// ============================================
// FUNCIONES DE RESERVA
// ============================================

/**
 * Busca un cliente por teléfono o lo crea si no existe.
 * Devuelve el UUID del cliente.
 */
export async function buscarOCrearCliente(
  nombre: string,
  telefono: string,
  email?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('buscar_o_crear_cliente', {
    p_nombre: nombre,
    p_telefono: telefono,
    p_email: email ?? null,
  })

  if (error) throw error
  return data as string
}

/**
 * Crea una reserva nueva. Antes resuelve el cliente.
 */
export async function crearReserva(input: NuevaReserva): Promise<Reserva> {
  // 1. Buscar o crear cliente
  const clienteId = await buscarOCrearCliente(
    input.nombreCliente,
    input.telefonoCliente,
    input.emailCliente
  )

  // 2. Insertar reserva
  const { data, error } = await supabase
    .from('reservas')
    .insert({
      cliente_id:  clienteId,
      barbero_id:  input.barberoId,
      servicio_id: input.servicioId,
      fecha:       input.fecha,
      hora_inicio: input.horaInicio,
      duracion:    input.duracion,
      precio:      input.precio,
      notas:       input.notas ?? null,
      estado:      'confirmada',
    })
    .select()
    .single()

  if (error) throw error
  return data as Reserva
}

/**
 * Devuelve las horas ya tomadas para un barbero en una fecha dada.
 * Sirve para deshabilitar esos slots en el flujo de reserva.
 */
export async function getHorariosOcupados(
  barberoId: string,
  fecha: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('hora_inicio')
    .eq('barbero_id', barberoId)
    .eq('fecha', fecha)
    .in('estado', ['pendiente', 'confirmada'])

  if (error) throw error
  return (data ?? []).map(r => r.hora_inicio)
}

// ============================================
// AUTENTICACIÓN
// ============================================

export interface AdminUser {
  id: string
  email: string
}

/**
 * Inicia sesión con email y password.
 */
export async function signIn(email: string, password: string): Promise<AdminUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) throw error
  if (!data.user) throw new Error('No se pudo iniciar sesión')

  return {
    id:    data.user.id,
    email: data.user.email ?? '',
  }
}

/**
 * Cierra la sesión actual.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Devuelve la sesión actual (o null si no hay).
 */
export async function getSession(): Promise<AdminUser | null> {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!session?.user) return null

  return {
    id:    session.user.id,
    email: session.user.email ?? '',
  }
}

/**
 * Escucha cambios en el estado de autenticación.
 * Devuelve una función para cancelar la suscripción.
 */
export function onAuthChange(callback: (user: AdminUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({ id: session.user.id, email: session.user.email ?? '' })
    } else {
      callback(null)
    }
  })

  return () => subscription.unsubscribe()
}

// ============================================
// QUERIES DEL ADMIN
// ============================================

export interface ReservaCompleta {
  id: string
  fecha: string
  hora_inicio: string
  duracion: number
  precio: number
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no-show'
  notas: string | null
  cliente: { id: string; nombre: string; telefono: string } | null
  barbero: { id: string; nombre: string; apellido: string; color: string } | null
  servicio: { id: string; nombre: string; duracion: number; precio: number } | null
}

/** Reservas de un rango de fechas (para agenda y dashboard) */
export async function getReservasEntre(
  fechaDesde: string,
  fechaHasta: string
): Promise<ReservaCompleta[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id, fecha, hora_inicio, duracion, precio, estado, notas,
      cliente:clientes (id, nombre, telefono),
      barbero:barberos (id, nombre, apellido, color),
      servicio:servicios (id, nombre, duracion, precio)
    `)
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as ReservaCompleta[]
}

/** Reservas de hoy */
export async function getReservasHoy(): Promise<ReservaCompleta[]> {
  const hoy = new Date().toISOString().slice(0, 10)
  return getReservasEntre(hoy, hoy)
}

/** Cambiar el estado de una reserva */
export async function cambiarEstadoReserva(
  reservaId: string,
  nuevoEstado: ReservaCompleta['estado']
): Promise<void> {
  const { error } = await supabase
    .from('reservas')
    .update({ estado: nuevoEstado })
    .eq('id', reservaId)

  if (error) throw error
}

/** Todos los clientes (para admin) */
export interface ClienteCompleto {
  id: string
  nombre: string
  telefono: string
  email: string | null
  notas: string | null
  total_visitas: number
  total_gastado: number
  ultima_visita: string | null
  created_at: string
}

export async function getClientes(): Promise<ClienteCompleto[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('ultima_visita', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

/** Historial de reservas de un cliente */
export async function getHistorialCliente(clienteId: string): Promise<ReservaCompleta[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      id, fecha, hora_inicio, duracion, precio, estado, notas,
      cliente:clientes (id, nombre, telefono),
      barbero:barberos (id, nombre, apellido, color),
      servicio:servicios (id, nombre, duracion, precio)
    `)
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(20)

  if (error) throw error
  return (data ?? []) as unknown as ReservaCompleta[]
}

/** CRUD de servicios (para admin) */
export async function getTodosLosServicios(): Promise<Servicio[]> {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function crearServicio(input: Omit<Servicio, 'id'>): Promise<Servicio> {
  const { data, error } = await supabase.from('servicios').insert(input).select().single()
  if (error) throw error
  return data
}

export async function actualizarServicio(id: string, input: Partial<Servicio>): Promise<Servicio> {
  const { data, error } = await supabase.from('servicios').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function eliminarServicio(id: string): Promise<void> {
  const { error } = await supabase.from('servicios').delete().eq('id', id)
  if (error) throw error
}

/** CRUD de barberos */
export async function getTodosLosBarberos(): Promise<Barbero[]> {
  const { data, error } = await supabase
    .from('barberos')
    .select('*')
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function crearBarbero(input: Omit<Barbero, 'id'>): Promise<Barbero> {
  const { data, error } = await supabase.from('barberos').insert(input).select().single()
  if (error) throw error
  return data
}

export async function actualizarBarbero(id: string, input: Partial<Barbero>): Promise<Barbero> {
  const { data, error } = await supabase.from('barberos').update(input).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function eliminarBarbero(id: string): Promise<void> {
  const { error } = await supabase.from('barberos').delete().eq('id', id)
  if (error) throw error
}

/** Actualizar configuración del negocio */
export async function actualizarConfiguracion(
  id: string,
  input: Partial<Configuracion>
): Promise<Configuracion> {
  const { data, error } = await supabase
    .from('configuracion')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// HORARIOS DE BARBEROS
// ============================================

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface HorarioDia {
  activo: boolean;
  abre: string;
  cierra: string;
  almuerzo: {
    activo: boolean;
    abre: string;
    cierra: string;
  };
}

export type HorariosBarbero = Record<DiaSemana, HorarioDia>;

export interface BloqueoBarbero {
  id: string;
  barbero_id: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  motivo: string | null;
  created_at: string;
}

/** Días de la semana en orden */
export const DIAS: DiaSemana[] = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];

/** Etiquetas cortas para mostrar */
export const DIAS_LABEL: Record<DiaSemana, string> = {
  lunes: 'Lun', martes: 'Mar', miercoles: 'Mié',
  jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom',
};

/** Convierte una fecha (Date) al nombre del día en español */
export function getDiaSemana(fecha: Date): DiaSemana {
  const idx = fecha.getDay(); // 0 = domingo
  return idx === 0 ? 'domingo'
    : idx === 1 ? 'lunes'
    : idx === 2 ? 'martes'
    : idx === 3 ? 'miercoles'
    : idx === 4 ? 'jueves'
    : idx === 5 ? 'viernes'
    : 'sabado';
}

/** Actualiza el horario de un barbero */
export async function actualizarHorariosBarbero(
  barberoId: string,
  horarios: HorariosBarbero
): Promise<void> {
  const { error } = await supabase
    .from('barberos')
    .update({ horarios })
    .eq('id', barberoId)

  if (error) throw error
}

/** Bloqueos de un barbero */
export async function getBloqueosBarbero(barberoId: string): Promise<BloqueoBarbero[]> {
  const { data, error } = await supabase
    .from('bloqueos_barbero')
    .select('*')
    .eq('barbero_id', barberoId)
    .gte('fecha', new Date().toISOString().slice(0, 10))
    .order('fecha', { ascending: true })

  if (error) throw error
  return data ?? []
}

/** Todos los bloqueos (para la agenda) */
export async function getBloqueosEnFecha(fecha: string): Promise<BloqueoBarbero[]> {
  const { data, error } = await supabase
    .from('bloqueos_barbero')
    .select('*')
    .eq('fecha', fecha)

  if (error) throw error
  return data ?? []
}

/** Crear bloqueo */
export async function crearBloqueo(input: {
  barberoId: string
  fecha: string
  horaInicio?: string | null
  horaFin?: string | null
  motivo?: string | null
}): Promise<BloqueoBarbero> {
  const { data, error } = await supabase
    .from('bloqueos_barbero')
    .insert({
      barbero_id:  input.barberoId,
      fecha:       input.fecha,
      hora_inicio: input.horaInicio ?? null,
      hora_fin:    input.horaFin ?? null,
      motivo:      input.motivo ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Eliminar bloqueo */
export async function eliminarBloqueo(id: string): Promise<void> {
  const { error } = await supabase.from('bloqueos_barbero').delete().eq('id', id)
  if (error) throw error
}

// ============================================
// HELPERS DE DISPONIBILIDAD
// ============================================

/**
 * Dado un barbero, una fecha y un servicio, devuelve las horas disponibles.
 * Respeta: día activo, horario abre/cierra, almuerzo, bloqueos, reservas existentes.
 */
export function calcularSlotsDisponibles(
  barbero: { id: string; horarios: HorariosBarbero },
  fecha: Date,
  duracionServicio: number,
  reservasExistentes: { hora_inicio: string; duracion: number }[],
  bloqueos: BloqueoBarbero[],
  slotsBase: string[] = [
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30",
  ]
): { hora: string; disponible: boolean; motivo?: string }[] {
  const dia = getDiaSemana(fecha);
  const horario = barbero.horarios[dia];

  // Si no trabaja ese día → nada disponible
  if (!horario?.activo) {
    return slotsBase.map(hora => ({ hora, disponible: false, motivo: 'No trabaja este día' }));
  }

  const abre = horario.abre;
  const cierra = horario.cierra;
  const almuerzo = horario.almuerzo;

  // Bloqueos del barbero ese día
  const bloqueosDia = bloqueos.filter(b => b.barbero_id === barbero.id);

  return slotsBase.map(hora => {
    // Fuera de horario del barbero
    if (hora < abre || hora >= cierra) {
      return { hora, disponible: false, motivo: 'Fuera de horario' };
    }

    // Calcular hora de fin del servicio
    const [hh, mm] = hora.split(':').map(Number);
    const totalMin = hh * 60 + mm + duracionServicio;
    const finHora = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

    // Se pasaría del cierre
    if (finHora > cierra) {
      return { hora, disponible: false, motivo: 'No alcanza el tiempo' };
    }

    // Está en almuerzo
    if (almuerzo?.activo) {
      if (hora < almuerzo.cierra && finHora > almuerzo.abre) {
        return { hora, disponible: false, motivo: 'Almuerzo' };
      }
    }

    // Está en un bloqueo
    for (const b of bloqueosDia) {
      // Bloqueo todo el día
      if (!b.hora_inicio && !b.hora_fin) {
        return { hora, disponible: false, motivo: b.motivo ?? 'Bloqueado' };
      }
      // Bloqueo parcial
      if (b.hora_inicio && b.hora_fin) {
        if (hora < b.hora_fin && finHora > b.hora_inicio) {
          return { hora, disponible: false, motivo: b.motivo ?? 'Bloqueado' };
        }
      }
    }

    // Ya hay una reserva que se solapa
    for (const r of reservasExistentes) {
      const [rh, rm] = r.hora_inicio.split(':').map(Number);
      const rFinMin = rh * 60 + rm + r.duracion;
      const rFin = `${String(Math.floor(rFinMin / 60)).padStart(2, '0')}:${String(rFinMin % 60).padStart(2, '0')}`;

      if (hora < rFin && finHora > r.hora_inicio) {
        return { hora, disponible: false, motivo: 'Ocupado' };
      }
    }

    return { hora, disponible: true };
  });
}
// ============================================
// TELÉFONOS INTERNACIONALES
// ============================================

export interface Pais {
  code: string;      // código sin +, ej "56"
  flag: string;      // emoji
  nombre: string;    // "Chile"
  digits: number;    // cantidad esperada de dígitos (sin código)
}

/** Países frecuentes en Chile (orden por relevancia) */
export const PAISES: Pais[] = [
  { code: "56",  flag: "🇨🇱", nombre: "Chile",       digits: 9 },
  { code: "58",  flag: "🇻🇪", nombre: "Venezuela",   digits: 10 },
  { code: "57",  flag: "🇨🇴", nombre: "Colombia",    digits: 10 },
  { code: "51",  flag: "🇵🇪", nombre: "Perú",        digits: 9 },
  { code: "54",  flag: "🇦🇷", nombre: "Argentina",   digits: 10 },
  { code: "591", flag: "🇧🇴", nombre: "Bolivia",     digits: 8 },
  { code: "593", flag: "🇪🇨", nombre: "Ecuador",     digits: 9 },
  { code: "595", flag: "🇵🇾", nombre: "Paraguay",    digits: 9 },
  { code: "598", flag: "🇺🇾", nombre: "Uruguay",     digits: 8 },
  { code: "509", flag: "🇭🇹", nombre: "Haití",       digits: 8 },
  { code: "1",   flag: "🇺🇸", nombre: "USA/Canadá",  digits: 10 },
  { code: "34",  flag: "🇪🇸", nombre: "España",      digits: 9 },
  { code: "55",  flag: "🇧🇷", nombre: "Brasil",      digits: 11 },
];

/**
 * Formatea un teléfono para guardar: solo + y dígitos.
 * Ej: "+56", "9 1234 5678" → "+56912345678"
 */
export function normalizarTelefono(codigoPais: string, numero: string): string {
  const soloDigitos = numero.replace(/\D/g, "");
  return `+${codigoPais}${soloDigitos}`;
}

/**
 * Valida un teléfono según el país.
 */
export function validarTelefono(codigoPais: string, numero: string): { valido: boolean; error?: string } {
  const pais = PAISES.find(p => p.code === codigoPais);
  if (!pais) return { valido: false, error: "País no soportado" };

  const soloDigitos = numero.replace(/\D/g, "");
  if (soloDigitos.length === 0) return { valido: false, error: "Ingresa el número" };
  if (soloDigitos.length < pais.digits - 2 || soloDigitos.length > pais.digits + 2) {
    return { valido: false, error: `Debe tener ~${pais.digits} dígitos` };
  }
  return { valido: true };
}

/**
 * Formatea visualmente un teléfono para mostrar.
 * Ej: "+56912345678" → "+56 9 1234 5678"
 */
export function formatearTelefonoVisual(telefonoE164: string): string {
  if (!telefonoE164.startsWith("+")) return telefonoE164;
  const sinMas = telefonoE164.slice(1);
  // Buscar el país cuyo código coincida con el inicio
  const pais = [...PAISES].sort((a, b) => b.code.length - a.code.length)
    .find(p => sinMas.startsWith(p.code));
  if (!pais) return telefonoE164;
  const numero = sinMas.slice(pais.code.length);
  // Formatear con espacios cada 3-4 dígitos para lectura
  const partes = numero.match(/.{1,4}/g) ?? [numero];
  return `+${pais.code} ${partes.join(" ")}`;
}
// ============================================
// STORAGE — Subida de archivos
// ============================================

/**
 * Sube una foto de barbero al bucket "barberos" y devuelve la URL pública.
 */
export async function subirFotoBarbero(file: File, prefijo?: string): Promise<string> {
  // Validar tamaño (5MB máx)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen no puede pesar más de 5 MB");
  }

  // Validar tipo
  const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!tiposPermitidos.includes(file.type)) {
    throw new Error("Formato no soportado. Usa PNG, JPG o WEBP.");
  }

  // Nombre único: prefijo-timestamp.ext
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const nombreArchivo = `${prefijo ?? "barbero"}-${Date.now()}.${ext}`;

  // Subir
  const { error: uploadError } = await supabase.storage
    .from("barberos")
    .upload(nombreArchivo, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Obtener URL pública
  const { data } = supabase.storage.from("barberos").getPublicUrl(nombreArchivo);
  return data.publicUrl;
}

/**
 * Elimina una foto del bucket. Se llama cuando se cambia la foto.
 */
export async function eliminarFotoBarbero(url: string): Promise<void> {
  // Extraer el nombre del archivo desde la URL
  const partes = url.split("/barberos/");
  if (partes.length < 2) return;
  const nombreArchivo = partes[1];

  const { error } = await supabase.storage.from("barberos").remove([nombreArchivo]);
  if (error) {
    console.warn("No se pudo eliminar la foto:", error.message);
    // No tiramos error porque no es crítico
  }
}