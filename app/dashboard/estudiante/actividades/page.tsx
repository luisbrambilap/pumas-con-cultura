import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ActividadesEstudiantePage() {
  const supabase = await createClient();

  // ✅ Seguridad: getUser() valida el JWT con el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login/estudiante');
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', user.email)
    .single();

  // Si no hay usuario en la BD, usar datos básicos de user
  const usuarioDisplay = usuario || {
    nombre: user.email?.split('@')[0] || 'Usuario',
    apellido_paterno: '',
    id: user.id,
  };

  // Obtener TODAS las actividades (sin filtro de estado)
  const { data: todasActividades } = await supabase
    .from('actividades')
    .select(`
      *,
      responsable:usuarios!actividades_responsable_id_fkey(nombre, apellido_paterno)
    `)
    .order('created_at', { ascending: false });

  // Obtener las participaciones del estudiante para marcar en cuáles ya participó
  const { data: misParticipaciones } = await supabase
    .from('participaciones')
    .select('actividad_id, estado, created_at')
    .eq('alumno_id', usuarioDisplay.id);

  const participacionesMap = new Map(
    misParticipaciones?.map((p) => [p.actividad_id, p]) || []
  );

  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login/estudiante');
  };

  // Agrupar actividades por estado
  const actividadesActivas = todasActividades?.filter((a) => a.estado === 'activa') || [];
  const actividadesPausadas = todasActividades?.filter((a) => a.estado === 'pausada') || [];
  const actividadesFinalizadas = todasActividades?.filter((a) => a.estado === 'finalizada') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-md border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Todas las Actividades</h1>
            <p className="text-gray-300 text-sm">
              {usuarioDisplay.nombre} {usuarioDisplay.apellido_paterno}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/estudiante"
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition text-sm font-medium"
            >
              ← Volver
            </Link>
            <Link
              href="/dashboard/ranking"
              className="bg-[#FFB81C] text-[#003366] hover:bg-yellow-400 px-4 py-2 rounded-md transition text-sm font-bold flex items-center gap-2"
            >
              Ranking
            </Link>
            <form action={handleLogout}>
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Resumen */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-blue-900 mb-2">
                Total de Actividades: {todasActividades?.length || 0}
              </h2>
              <div className="flex gap-6 text-sm text-blue-800">
                <span>Activas: {actividadesActivas.length}</span>
                <span>Pausadas: {actividadesPausadas.length}</span>
                <span>Finalizadas: {actividadesFinalizadas.length}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                {misParticipaciones?.length || 0}
              </div>
              <div className="text-sm text-blue-700">Participaciones</div>
            </div>
          </div>
        </div>

        {/* Actividades Activas */}
        {actividadesActivas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Activas
              </span>
              <span className="text-xl">({actividadesActivas.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actividadesActivas.map((actividad) => {
                const participacion = participacionesMap.get(actividad.id);
                return (
                  <div
                    key={actividad.id}
                    className="bg-white rounded-lg border-2 border-gray-200 hover:border-[#003366] shadow-sm hover:shadow-md transition p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{actividad.nombre}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#003366]">{actividad.puntaje}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {actividad.descripcion || 'Sin descripción'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Código:</span>
                        <span className="font-mono font-semibold text-[#003366]">
                          {actividad.codigo_actividad}
                        </span>
                      </div>
                      {actividad.responsable && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            {actividad.responsable.nombre} {actividad.responsable.apellido_paterno}
                          </span>
                        </div>
                      )}
                    </div>

                    {participacion ? (
                      <div
                        className={`text-center py-2 rounded-lg text-sm font-semibold ${
                          participacion.estado === 'validada'
                            ? 'bg-[#003366] text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {participacion.estado === 'validada' ? 'Participaste' : 'Pendiente'}
                      </div>
                    ) : (
                      <div className="bg-[#003366] text-white text-center py-2 rounded-lg text-sm font-semibold">
                        ¡Puedes participar!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actividades Pausadas */}
        {actividadesPausadas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                Pausadas
              </span>
              <span className="text-xl">({actividadesPausadas.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actividadesPausadas.map((actividad) => {
                const participacion = participacionesMap.get(actividad.id);
                return (
                  <div
                    key={actividad.id}
                    className="bg-white rounded-lg border-2 border-yellow-200 shadow-sm p-6 opacity-75"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{actividad.nombre}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">{actividad.puntaje}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {actividad.descripcion || 'Sin descripción'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Código:</span>
                        <span className="font-mono font-semibold text-yellow-700">
                          {actividad.codigo_actividad}
                        </span>
                      </div>
                      {actividad.responsable && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            {actividad.responsable.nombre} {actividad.responsable.apellido_paterno}
                          </span>
                        </div>
                      )}
                    </div>

                    {participacion ? (
                      <div
                        className={`text-center py-2 rounded-lg text-sm font-semibold ${
                          participacion.estado === 'validada'
                            ? 'bg-[#003366] text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {participacion.estado === 'validada' ? 'Participaste' : 'Pendiente'}
                      </div>
                    ) : (
                      <div className="bg-yellow-500 text-white text-center py-2 rounded-lg text-sm font-semibold">
                        Pausada temporalmente
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actividades Finalizadas */}
        {actividadesFinalizadas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                Finalizadas
              </span>
              <span className="text-xl">({actividadesFinalizadas.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actividadesFinalizadas.map((actividad) => {
                const participacion = participacionesMap.get(actividad.id);
                return (
                  <div
                    key={actividad.id}
                    className="bg-white rounded-lg border-2 border-gray-300 shadow-sm p-6 opacity-60"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{actividad.nombre}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-600">{actividad.puntaje}</div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {actividad.descripcion || 'Sin descripción'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Código:</span>
                        <span className="font-mono font-semibold text-gray-600">
                          {actividad.codigo_actividad}
                        </span>
                      </div>
                      {actividad.responsable && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            {actividad.responsable.nombre} {actividad.responsable.apellido_paterno}
                          </span>
                        </div>
                      )}
                    </div>

                    {participacion ? (
                      <div
                        className={`text-center py-2 rounded-lg text-sm font-semibold ${
                          participacion.estado === 'validada'
                            ? 'bg-[#003366] text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {participacion.estado === 'validada' ? 'Participaste' : 'Pendiente'}
                      </div>
                    ) : (
                      <div className="bg-gray-400 text-white text-center py-2 rounded-lg text-sm font-semibold">
                        Finalizada
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sin actividades */}
        {(!todasActividades || todasActividades.length === 0) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay actividades aún</h3>
            <p className="text-gray-600 mb-6">Las actividades aparecerán aquí cuando sean creadas</p>
            <Link
              href="/dashboard/estudiante"
              className="inline-block bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition font-medium"
            >
              Volver al Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

