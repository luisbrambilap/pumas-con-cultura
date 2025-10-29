'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QRScanner from './QRScanner';

interface EscanearAlumnoProps {
  actividadId: string;
  actividadNombre: string;
  actividadPuntaje: number;
  requiereValidacion: boolean;
}

export default function EscanearAlumno({
  actividadId,
  actividadNombre,
  actividadPuntaje,
  requiereValidacion,
}: EscanearAlumnoProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleScan = async (qrData: string) => {
    // Prevenir procesamiento duplicado
    if (processing || scannedCode === qrData) {
      console.log('QR ya procesado, ignorando...');
      return;
    }

    setScannedCode(qrData);
    setProcessing(true);
    setShowScanner(false);

    try {
      console.log('QR de alumno escaneado:', qrData);

      // Intentar parsear el QR como JSON
      let alumnoId = '';
      
      try {
        const qrObject = JSON.parse(qrData);
        // El QR contiene un objeto con id, folio, matricula, nombre, grupo
        if (qrObject.id) {
          alumnoId = qrObject.id;
        } else {
          throw new Error('QR no contiene ID válido');
        }
      } catch (parseError) {
        // Si no es JSON, intentar otros formatos
        if (qrData.includes('/estudiante/')) {
          // Formato: http://localhost:3000/estudiante/FOLIO123
          const parts = qrData.split('/estudiante/');
          const folioUnico = parts[1];
          
          // Buscar por folio_unico
          const { data: alumnoByFolio, error: folioError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('folio_unico', folioUnico)
            .eq('rol', 'alumno')
            .single();
          
          if (folioError || !alumnoByFolio) {
            throw new Error('Código QR no válido o alumno no encontrado');
          }
          
          alumnoId = alumnoByFolio.id;
        } else {
          throw new Error('Código QR no válido');
        }
      }

      console.log('ID de alumno extraído:', alumnoId);

      if (!alumnoId) {
        throw new Error('Código QR de alumno no válido');
      }

      // Buscar al alumno por ID
      const { data: alumno, error: alumnoError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', alumnoId)
        .eq('rol', 'alumno')
        .single();

      if (alumnoError || !alumno) {
        throw new Error('Alumno no encontrado');
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
        throw new Error(`${alumno.nombre} ya está registrado en esta actividad`);
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
        metodo_registro: 'qr_alumno',
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

      // Registrar log de escaneo exitoso
      await supabase.from('logs_escaneo').insert({
        alumno_id: alumno.id,
        actividad_id: actividadId,
        tipo_escaneo: 'qr_alumno',
        exitoso: true,
      });

      setMessage({
        type: 'success',
        text: `✅ ${alumno.nombre} ${alumno.apellido_paterno} registrado exitosamente. ${
          requiereValidacion
            ? 'Pendiente de validación.'
            : `+${actividadPuntaje} puntos otorgados.`
        }`,
      });

      // Limpiar después de 3 segundos y permitir escanear otro alumno
      setTimeout(() => {
        setScannedCode(null);
        setMessage(null);
        setProcessing(false);
        setShowScanner(true); // Reabrir escáner para siguiente alumno
      }, 3000);
    } catch (error: any) {
      console.error('Error al procesar participación:', error);
      setMessage({ type: 'error', text: error.message || 'Error al registrar participación' });

      // Registrar log de error
      await supabase.from('logs_escaneo').insert({
        actividad_id: actividadId,
        tipo_escaneo: 'qr_alumno',
        exitoso: false,
        razon_fallo: error.message,
      });

      setScannedCode(null);
      setProcessing(false);
    }
  };

  const handleError = (error: string) => {
    setMessage({ type: 'error', text: error });
    setShowScanner(false);
    setProcessing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Escanear Código QR del Alumno</h3>
          <p className="text-sm text-gray-600 mt-1">
            Escanea el código QR del estudiante para registrar su participación en{' '}
            <span className="font-semibold">{actividadNombre}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{actividadPuntaje}</div>
          <div className="text-xs text-gray-500">puntos</div>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {!showScanner && !processing && !message && (
        <div className="text-center py-8">
          <div className="bg-gray-100 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Listo para escanear</h4>
          <p className="text-sm text-gray-600 mb-4">
            Haz clic en el botón para activar la cámara y escanear códigos QR de alumnos
          </p>
          <button
            onClick={() => setShowScanner(true)}
            className="bg-[#003366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004080] transition"
          >
            Activar Cámara
          </button>
        </div>
      )}

      {processing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando...</p>
        </div>
      )}

      {showScanner && (
        <QRScanner 
          onScan={handleScan} 
          onError={handleError}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

