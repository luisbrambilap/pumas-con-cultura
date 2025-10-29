import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DebugActividadesPage() {
  const supabase = await createClient();

  // Obtener todas las actividades
  const { data: actividades, error } = await supabase
    .from('actividades')
    .select(`
      *,
      responsable:usuarios!actividades_responsable_id_fkey(nombre, apellido_paterno),
      evento:eventos(nombre, codigo_evento)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error al cargar actividades</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug - Actividades Disponibles</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Total de actividades: {actividades?.length || 0}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {actividades && actividades.length > 0 ? (
              actividades.map((actividad) => (
                <div key={actividad.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {actividad.nombre}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">ID:</span> 
                          <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                            {actividad.id}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Clave:</span> 
                          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {actividad.clave_actividad}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Estado:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            actividad.estado === 'activa' ? 'bg-green-100 text-green-800' :
                            actividad.estado === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {actividad.estado}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Puntos:</span> 
                          <span className="ml-2 font-semibold">{actividad.puntaje}</span>
                        </div>
                        <div>
                          <span className="font-medium">Responsable:</span> 
                          <span className="ml-2">
                            {actividad.responsable ? 
                              `${actividad.responsable.nombre} ${actividad.responsable.apellido_paterno}` : 
                              'Sin asignar'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Evento:</span> 
                          <span className="ml-2">{actividad.evento?.nombre || 'Sin evento'}</span>
                        </div>
                      </div>

                      {actividad.descripcion && (
                        <p className="text-gray-700 text-sm mb-4">{actividad.descripcion}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <Link
                        href={`/dashboard/super-admin/actividades/${actividad.id}`}
                        className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#004080] transition text-sm font-medium text-center"
                      >
                        Ver (Super Admin)
                      </Link>
                      <Link
                        href={`/dashboard/admin/actividad/${actividad.id}`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium text-center"
                      >
                        Ver (Admin)
                      </Link>
                      <Link
                        href={`/dashboard/admin/escanear/${actividad.id}`}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-medium text-center"
                      >
                        Escanear
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500">No hay actividades disponibles</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Instrucciones de Uso</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• <strong>ID:</strong> Usa este ID en las URLs para acceder a las actividades</p>
            <p>• <strong>Clave:</strong> Esta es la clave que los estudiantes usan para participar</p>
            <p>• <strong>Ver (Super Admin):</strong> Acceso completo con QR y estadísticas</p>
            <p>• <strong>Ver (Admin):</strong> Vista limitada para responsables</p>
            <p>• <strong>Escanear:</strong> Página para escanear códigos QR de estudiantes</p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/super-admin"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
