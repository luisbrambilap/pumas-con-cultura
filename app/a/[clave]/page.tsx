'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const supabase = createClient();

export default function ParticiparActividad() {
  const params = useParams();
  const router = useRouter();
  const clave = params.clave as string;

  const [actividad, setActividad] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarActividad();
  }, [clave]);

  const cargarActividad = async () => {
    try {
      // Verificar sesión
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Obtener datos del usuario
        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', user.email)
          .single();
        
        if (usuarioData) {
          setUsuario(usuarioData);
        }
      }

      // Obtener datos de la actividad
      const { data: actividadData, error: actividadError } = await supabase
        .from('actividades')
        .select('*')
        .eq('clave_actividad', clave)
        .single();

      if (actividadError || !actividadData) {
        setLoading(false);
        return;
      }

      // Obtener evento si existe
      if (actividadData.evento_id) {
        const { data: eventoData } = await supabase
          .from('eventos')
          .select('nombre, codigo_evento, estado')
          .eq('id', actividadData.evento_id)
          .single();
        
        if (eventoData) {
          actividadData.evento = eventoData;
        }
      }

      setActividad(actividadData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (!actividad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Actividad no encontrada</h1>
          <p className="text-gray-600 mb-6">
            La clave <span className="font-mono bg-gray-100 px-2 py-1 rounded">{clave}</span> no corresponde a ninguna actividad
          </p>
          <Link 
            href="/dashboard/estudiante" 
            className="inline-block bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#003366] to-[#004080] text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{actividad.nombre}</h1>
                <p className="text-blue-100 text-sm mt-1">
                  {actividad.evento?.nombre ? `${actividad.evento.nombre} • ` : ''}{actividad.puntaje} puntos
                </p>
              </div>
              <div className="text-right">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  {actividad.clave_actividad}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold mb-2">📱 Cómo participar:</p>
              <ol className="text-sm text-blue-700 space-y-1 ml-4">
                <li>1. Inicia sesión en tu cuenta de estudiante</li>
                <li>2. Ve a tu dashboard</li>
                <li>3. Usa el botón "Abrir Escáner QR"</li>
                <li>4. Escanea el código QR de esta actividad</li>
                <li>5. ¡Tu participación se registrará automáticamente!</li>
              </ol>
            </div>

            {actividad.descripcion && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600">{actividad.descripcion}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {actividad.ubicacion && (
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-medium text-gray-900">📍 {actividad.ubicacion}</p>
                </div>
              )}
              {actividad.horario_inicio && actividad.horario_fin && (
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-medium text-gray-900">
                    🕐 {actividad.horario_inicio} - {actividad.horario_fin}
                  </p>
                </div>
              )}
            </div>

            {actividad.requiere_validacion && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Esta actividad requiere validación del responsable antes de obtener los puntos
                </p>
              </div>
            )}

            <div className="space-y-3">
              {usuario ? (
                <Link
                  href="/dashboard/estudiante"
                  className="block w-full bg-[#003366] text-white py-3 rounded-lg font-semibold hover:bg-[#004080] transition text-center"
                >
                  Ir al Dashboard para Escanear
                </Link>
              ) : (
                <>
                  <Link
                    href={`/auth/login/estudiante?redirect=/dashboard/estudiante`}
                    className="block w-full bg-[#003366] text-white py-3 rounded-lg font-semibold hover:bg-[#004080] transition text-center"
                  >
                    Iniciar Sesión para Participar
                  </Link>
                  
                  <Link
                    href="/auth/login/estudiante"
                    className="block text-center text-gray-600 hover:text-gray-900"
                  >
                    ¿No tienes cuenta? Regístrate
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}