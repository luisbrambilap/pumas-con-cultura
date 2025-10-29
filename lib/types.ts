// Tipos de la base de datos
export type RolUsuario = 'alumno' | 'responsable' | 'admin';
export type Turno = 'Matutino' | 'Vespertino';
export type Grupo = '1A' | '2A' | '3 Humanidades' | 'FM';
export type EstadoEvento = 'borrador' | 'activo' | 'finalizado';
export type EstadoActividad = 'activa' | 'pausada' | 'finalizada';
export type EstadoParticipacion = 'pendiente' | 'validada' | 'rechazada';
export type MetodoRegistro = 'qr_alumno' | 'qr_actividad' | 'clave_manual' | 'responsable_manual';
export type TipoEvidencia = 'foto' | 'video' | 'documento';

export interface Usuario {
  id: string;
  matricula_externa: string;
  matricula_interna: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  grupo?: Grupo;
  ciclo_escolar?: string;
  turno?: Turno;
  rol: RolUsuario;
  folio_unico?: string;
  qr_code_url?: string;
  foto_perfil_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  curp: string;
}

export interface Evento {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  ciclo_escolar?: string;
  estado: EstadoEvento;
  codigo_evento: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Actividad {
  id: string;
  evento_id?: string;
  nombre: string;
  descripcion?: string;
  puntaje: number;
  clave_actividad: string;
  qr_code_url?: string;
  requiere_evidencia: boolean;
  tipo_evidencia?: TipoEvidencia;
  requiere_validacion: boolean;
  limite_participantes?: number;
  registro_multiple: boolean;
  estado: EstadoActividad;
  responsable_id?: string;
  ubicacion?: string;
  horario_inicio?: string;
  horario_fin?: string;
  created_at: string;
  updated_at: string;
}

export interface Participacion {
  id: string;
  alumno_id?: string;
  actividad_id?: string;
  evento_id?: string;
  puntos_otorgados: number;
  metodo_registro: MetodoRegistro;
  estado: EstadoParticipacion;
  validado_por?: string;
  fecha_participacion: string;
  hora_registro: string;
  evidencia_url?: string;
  observaciones?: string;
  ip_registro: string;
  dispositivo: string;
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  id: string;
  alumno_id?: string;
  evento_id?: string;
  total_puntos: number;
  posicion?: number;
  numero_actividades: number;
  ultima_actualizacion: string;
}

export interface LogEscaneo {
  id: string;
  alumno_id?: string;
  actividad_id?: string;
  tipo_escaneo: 'qr_alumno' | 'qr_actividad' | 'clave';
  exitoso: boolean;
  razon_fallo?: string;
  ip: string;
  dispositivo: string;
  created_at: string;
}

