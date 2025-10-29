'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface RegistrarManualProps {
  actividadId: string;
  actividadNombre: string;
  actividadPuntaje: number;
  requiereValidacion: boolean;
}

export default function RegistrarManual({
  actividadId,
  actividadNombre,
  actividadPuntaje,
  requiereValidacion,
}: RegistrarManualProps) {
  const [matricula, setMatricula] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matricula.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa una matrícula' });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      console.log('Buscando alumno con matrícula:', matricula);

      // Buscar al alumno por matrícula externa o interna
      const { data: alumno, error: alumnoError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('rol', 'alumno')
        .or(`matricula_externa.eq.${matricula},matricula_interna.eq.${matricula}`)
        .maybeSingle();

      if (alumnoError) {
        console.error('Error al buscar alumno:', alumnoError);
        throw new Error('Error al buscar el alumno en la base de datos');
      }

      if (!alumno) {
        throw new Error(`No se encontró ningún alumno con la matrícula: ${matricula}`);
      }

      console.log('Alumno encontrado:', alumno.nombre);

      // Verificar si ya tiene una participación en esta actividad
      const { data: participacionExistente } = await supabase
        .from('participaciones')
        .select('id')
        .eq('alumno_id', alumno.id)
        .eq('actividad_id', actividadId)
        .maybeSingle();

      if (participacionExistente) {
        throw new Error(`${alumno.nombre} ${alumno.apellido_paterno} ya está registrado en esta actividad`);
      }

      // Obtener el usuario actual (responsable)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No hay sesión activa');
      }

      const { data: responsable } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', user.email)
        .single();

      // Registrar participación
      const participacionData: any = {
        alumno_id: alumno.id,
        actividad_id: actividadId,
        metodo_registro: 'responsable_manual',
        estado: requiereValidacion ? 'pendiente' : 'validada',
        puntos_otorgados: requiereValidacion ? 0 : actividadPuntaje,
        validado_por: responsable?.id || null,
        ip_registro: '0.0.0.0',
        dispositivo: navigator.userAgent || 'Desconocido',
        fecha_participacion: new Date().toISOString(),
      };

      console.log('📝 Datos de participación:', participacionData);

      const { error: participacionError } = await supabase
        .from('participaciones')
        .insert(participacionData);

      if (participacionError) {
        console.error('❌ Error al insertar participación:', participacionError);
        throw participacionError;
      }

      // Registrar log de registro exitoso
      await supabase.from('logs_escaneo').insert({
        alumno_id: alumno.id,
        actividad_id: actividadId,
        tipo_escaneo: 'clave',
        exitoso: true,
      });

      setMessage({
        type: 'success',
        text: `✅ ${alumno.nombre} ${alumno.apellido_paterno} (${alumno.grupo || 'Sin grupo'}) registrado exitosamente. ${
          requiereValidacion
            ? 'Pendiente de validación.'
            : `+${actividadPuntaje} puntos otorgados.`
        }`,
      });

      // Limpiar el formulario después de 2 segundos
      setTimeout(() => {
        setMatricula('');
        setMessage(null);
        setProcessing(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error al procesar participación:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al registrar participación' 
      });

      // Registrar log de error
      await supabase.from('logs_escaneo').insert({
        actividad_id: actividadId,
        tipo_escaneo: 'clave',
        exitoso: false,
        razon_fallo: error.message,
      });

      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información de la actividad */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Información de la Actividad</h3>
            <p className="text-sm text-gray-600 mt-1">
              Registra participaciones en <span className="font-semibold">{actividadNombre}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{actividadPuntaje}</div>
            <div className="text-xs text-gray-500">puntos</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {requiereValidacion ? (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              ⏳ Requiere validación posterior
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              ✓ Validación automática
            </span>
          )}
        </div>
      </div>

      {/* Formulario de registro */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Estudiante</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-2">
              Matrícula del Estudiante
            </label>
            <input
              type="text"
              id="matricula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              disabled={processing}
              placeholder="Ejemplo: 91028312312344324"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 text-lg text-black placeholder-gray-400"
              autoComplete="off"
            />
            <p className="mt-2 text-sm text-gray-500">
              Ingresa la matrícula externa o interna del estudiante
            </p>
          </div>

          <button
            type="submit"
            disabled={processing || !matricula.trim()}
            className="w-full bg-[#003366] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#004080] transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </span>
            ) : (
              '✓ Registrar Participación'
            )}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="font-semibold">{message.text}</p>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Instrucciones</h3>
        <ul className="text-sm text-blue-800 space-y-2 ml-4">
          <li>• Pide al estudiante su matrícula</li>
          <li>• Ingresa la matrícula completa en el campo de arriba</li>
          <li>• Haz clic en "Registrar Participación"</li>
          <li>• El sistema buscará al estudiante y registrará su participación automáticamente</li>
          <li>• Si hay algún error, se mostrará un mensaje explicando el problema</li>
        </ul>
      </div>
    </div>
  );
}

