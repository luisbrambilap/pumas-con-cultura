import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import GenerarQREstudiante from '@/components/GenerarQREstudiante';
import EscanearActividad from '@/components/EscanearActividad';

export default async function DashboardEstudiante() {
  const supabase = await createClient();

  // ✅ Seguridad: getUser() valida el JWT con el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('📍 Dashboard Estudiante - Usuario:', user ? `${user.email}` : 'No existe');

  if (!user) {
    console.log('❌ No hay usuario, redirigiendo al login');
    redirect('/auth/login');
  }

  // Obtener datos del usuario (sin verificar rol)
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', user.email)
    .single();

  // Si no hay usuario en la BD, usar datos básicos de user
  const usuarioDisplay = usuario || {
    nombre: user.email?.split('@')[0] || 'Usuario',
    apellido_paterno: '',
    matricula_externa: 'N/A',
    grupo: 'N/A',
    folio_unico: 'N/A',
    id: user.id,
  };

  // Obtener participaciones del alumno
  const { data: participaciones } = await supabase
    .from('participaciones')
    .select(`
      *,
      actividad:actividades(nombre, puntaje)
    `)
    .eq('alumno_id', usuarioDisplay.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Calcular puntos totales directamente desde participaciones validadas
  const { data: todasParticipaciones } = await supabase
    .from('participaciones')
    .select('puntos_otorgados')
    .eq('alumno_id', usuarioDisplay.id)
    .eq('estado', 'validada');

  const totalPuntos = todasParticipaciones?.reduce((acc, p) => acc + (p.puntos_otorgados || 0), 0) || 0;

  // Obtener actividades disponibles
  const { data: actividadesDisponibles } = await supabase
    .from('actividades')
    .select('*')
    .eq('estado', 'activa')
    .limit(6);

  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login/estudiante');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-md border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Sistema de Actividades Culturales</h1>
            <p className="text-gray-300 text-sm">
              {usuarioDisplay.nombre} {usuarioDisplay.apellido_paterno} | Grupo: {usuarioDisplay.grupo} | Matrícula: {usuarioDisplay.matricula_externa}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/ranking"
              className="bg-[#FFB81C] text-[#003366] hover:bg-yellow-400 px-4 py-2 rounded-md transition text-sm font-bold flex items-center gap-2"
            >
              🏆 Ranking
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">Puntos Totales</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">{totalPuntos}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">Validadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {participaciones?.filter((p) => p.estado === 'validada').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">En Revisión</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {participaciones?.filter((p) => p.estado === 'pendiente').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Escáner QR para participar */}
        <div className="mb-8">
          <EscanearActividad />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actividades Disponibles */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Actividades Disponibles</h2>
              <Link
                href="/dashboard/estudiante/actividades"
                className="text-blue-900 hover:underline text-sm"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-4">
              {actividadesDisponibles && actividadesDisponibles.length > 0 ? (
                actividadesDisponibles.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{actividad.nombre}</h3>
                      <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                        {actividad.puntaje} pts
                      </span>
                    </div>
                    {actividad.descripcion && (
                      <p className="text-gray-600 text-sm mb-3">{actividad.descripcion}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {actividad.ubicacion && `📍 ${actividad.ubicacion}`}
                      </div>
                      <Link
                        href={`/a/${actividad.clave_actividad}`}
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
                      >
                        Participar
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay actividades disponibles en este momento
                </p>
              )}
            </div>
          </div>

          {/* Mis Participaciones */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Mis Participaciones Recientes</h2>
            <div className="space-y-3">
              {participaciones && participaciones.length > 0 ? (
                participaciones.map((participacion) => (
                  <div
                    key={participacion.id}
                    className="border-l-4 border-gray-200 pl-4 py-2"
                    style={{
                      borderLeftColor:
                        participacion.estado === 'validada'
                          ? '#10b981'
                          : participacion.estado === 'pendiente'
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {participacion.actividad?.nombre || 'Actividad'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(participacion.created_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-900">
                          {participacion.estado === 'validada' ? '+' : ''}
                          {participacion.actividad?.puntaje || 0} pts
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{participacion.estado}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aún no has participado en ninguna actividad
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mi QR */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Mi Código de Identificación</h2>
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 p-8 rounded-xl">
              {usuarioDisplay.qr_code_url ? (
                <img src={usuarioDisplay.qr_code_url} alt="Mi QR" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-4xl mb-2">📱</p>
                    <p>QR no generado</p>
                    <p className="text-sm">Folio: {usuarioDisplay.folio_unico}</p>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-4 text-gray-600 text-center">
              Muestra este código a los responsables de actividades
            </p>
            <p className="text-sm text-gray-500 mb-4">Folio: {usuarioDisplay.folio_unico}</p>
            
            {!usuarioDisplay.qr_code_url && (
              <GenerarQREstudiante />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

