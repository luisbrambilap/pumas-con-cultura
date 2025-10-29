'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QRScanner from './QRScanner';

export default function EscanearActividad() {
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
      console.log('QR escaneado:', qrData);
      
      // Verificar si es una URL de participación
      let claveActividad = '';
      
      if (qrData.includes('/a/')) {
        // Extraer la clave de la URL
        const parts = qrData.split('/a/');
        claveActividad = parts[parts.length - 1];
      } else {
        // Asumir que es directamente la clave
        claveActividad = qrData;
      }

      console.log('Clave de actividad:', claveActividad);

      // Verificar que la actividad existe
      const { data: actividad, error: actividadError } = await supabase
        .from('actividades')
        .select('*')
        .eq('clave_actividad', claveActividad)
        .single();

      if (actividadError || !actividad) {
        setMessage({ type: 'error', text: 'Código QR inválido o actividad no encontrada' });
        setProcessing(false);
        return;
      }

      // Verificar que la actividad esté activa
      if (actividad.estado !== 'activa') {
        setMessage({ type: 'error', text: 'Esta actividad no está activa en este momento' });
        setProcessing(false);
        return;
      }

      // Obtener datos del usuario
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push(`/auth/login/estudiante?redirect=/a/${claveActividad}`);
        return;
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!usuario) {
        setMessage({ type: 'error', text: 'Usuario no encontrado' });
        setProcessing(false);
        return;
      }

      // Verificar si ya participó (si no permite registro múltiple)
      if (!actividad.registro_multiple) {
        const { data: participacionExistente, error: checkError } = await supabase
          .from('participaciones')
          .select('id')
          .eq('alumno_id', usuario.id)
          .eq('actividad_id', actividad.id)
          .maybeSingle();

        if (participacionExistente) {
          setMessage({ type: 'error', text: 'Ya te has registrado en esta actividad' });
          setProcessing(false);
          return;
        }
      }

      // Verificar límite de participantes
      if (actividad.limite_participantes) {
        const { count } = await supabase
          .from('participaciones')
          .select('id', { count: 'exact', head: true })
          .eq('actividad_id', actividad.id)
          .eq('estado', 'validada');

        if (count && count >= actividad.limite_participantes) {
          setMessage({ type: 'error', text: 'Esta actividad ya alcanzó el límite de participantes' });
          setProcessing(false);
          return;
        }
      }

      // Registrar participación - Sin evento_id por problemas de caché de PostgREST
      const participacionData: any = {
        alumno_id: usuario.id,
        actividad_id: actividad.id,
        // evento_id temporalmente omitido debido a problemas de caché de Supabase
        metodo_registro: 'qr_actividad',
        estado: actividad.requiere_validacion ? 'pendiente' : 'validada',
        puntos_otorgados: actividad.requiere_validacion ? 0 : actividad.puntaje,
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
      }

      if (participacionError) {
        throw participacionError;
      }

      // Registrar log de escaneo exitoso
      await supabase.from('logs_escaneo').insert({
        alumno_id: usuario.id,
        actividad_id: actividad.id,
        tipo_escaneo: 'qr_actividad',
        exitoso: true,
      });

      setMessage({
        type: 'success',
        text: actividad.requiere_validacion
          ? `¡Registro exitoso en "${actividad.nombre}"! Tu participación está pendiente de validación.`
          : `¡Felicidades! Has participado en "${actividad.nombre}" y ganado ${actividad.puntaje} puntos.`
      });

      // Recargar la página después de 2 segundos
      setTimeout(() => {
        setScannedCode(null);
        setMessage(null);
        setProcessing(false);
        router.refresh();
      }, 2000);

    } catch (error: any) {
      console.error('Error al procesar participación:', error);
      setMessage({ type: 'error', text: error.message || 'Error al registrar participación' });
      setScannedCode(null);
      setProcessing(false);
    }
  };

  const handleError = (error: string) => {
    setMessage({ type: 'error', text: error });
    setShowScanner(false);
  };

  return (
    <>
      {/* Botón para abrir escáner */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Participar en Actividad</h2>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Escanea el Código QR</h3>
          <p className="text-sm text-gray-600 mb-4">
            Escanea el código QR de la actividad para registrar tu participación automáticamente
          </p>
          <button
            onClick={() => setShowScanner(true)}
            disabled={processing}
            className="bg-[#003366] text-white px-8 py-3 rounded-lg hover:bg-[#004080] transition font-medium disabled:opacity-50"
          >
            {processing ? 'Procesando...' : 'Abrir Escáner QR'}
          </button>
        </div>
      </div>

      {/* Mensaje de resultado */}
      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      {/* Escáner QR */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onError={handleError}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
