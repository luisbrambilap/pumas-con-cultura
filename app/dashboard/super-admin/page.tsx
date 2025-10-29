import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

export default async function DashboardSuperAdmin() {
  const supabase = await createClient();

  // ✅ Seguridad: getUser() valida el JWT con el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login/personal');
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', user.email)
    .single();

  // Si no hay usuario, usar datos básicos
  const usuarioDisplay = usuario || {
    nombre: user.email?.split('@')[0] || 'Admin',
    apellido_paterno: '',
    rol: 'admin',
    id: user.id,
  };

  // Obtener estadísticas generales
  const { count: totalAlumnos } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'alumno')
    .eq('activo', true);

  const { count: totalActividades } = await supabase
    .from('actividades')
    .select('*', { count: 'exact', head: true });

  const { count: totalParticipaciones } = await supabase
    .from('participaciones')
    .select('*', { count: 'exact', head: true });

  const { count: pendientesValidacion } = await supabase
    .from('participaciones')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente');

  // Obtener actividades recientes
  const { data: actividadesRecientes } = await supabase
    .from('actividades')
    .select(`
      *,
      responsable:usuarios!actividades_responsable_id_fkey(nombre, apellido_paterno)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Obtener eventos para las actividades recientes que los tienen
  if (actividadesRecientes && actividadesRecientes.length > 0) {
    const eventoIds = actividadesRecientes
      .filter(a => a.evento_id)
      .map(a => a.evento_id);
    
    if (eventoIds.length > 0) {
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, nombre, codigo_evento')
        .in('id', eventoIds);
      
      if (eventos) {
        actividadesRecientes.forEach(actividad => {
          if (actividad.evento_id) {
            actividad.evento = eventos.find(e => e.id === actividad.evento_id);
          }
        });
      }
    }
  }

  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login/personal');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader
        title="Panel de Super Administrador"
        userName={`${usuarioDisplay.nombre} ${usuarioDisplay.apellido_paterno}`}
        showRanking={true}
        showBackButton={true}
        backHref="/dashboard/admin"
        backText="Panel Responsable"
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Alumnos Activos</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">{totalAlumnos || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Actividades</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">{totalActividades || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Participaciones</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">{totalParticipaciones || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">{pendientesValidacion || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/super-admin/actividades/crear"
              className="bg-[#003366] text-white p-4 rounded-lg text-center hover:bg-[#004080] transition flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div className="font-semibold">Crear Actividad</div>
            </Link>
            <Link
              href="/dashboard/ranking"
              className="bg-[#003366] text-white p-4 rounded-lg text-center hover:bg-[#004080] transition flex flex-col items-center gap-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="font-semibold">Ver Ranking</div>
            </Link>
          </div>
        </div>

        {/* Actividades Recientes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Actividades Recientes</h2>
            <Link
              href="/dashboard/super-admin/actividades"
              className="text-[#003366] hover:text-[#004080] text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {actividadesRecientes && actividadesRecientes.length > 0 ? (
              actividadesRecientes.map((actividad) => (
                <div key={actividad.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{actividad.nombre}</h3>
                      {actividad.responsable && (
                        <p className="text-sm text-gray-500 mt-1">
                          Responsable: {actividad.responsable.nombre}{' '}
                          {actividad.responsable.apellido_paterno}
                        </p>
                      )}
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {actividad.puntaje} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">{actividad.clave_actividad}</span>
                    <Link
                      href={`/dashboard/super-admin/actividades/${actividad.id}`}
                      className="text-[#003366] hover:text-[#004080] text-sm font-medium"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay actividades creadas</p>
                <Link
                  href="/dashboard/super-admin/actividades/crear"
                  className="text-[#003366] hover:text-[#004080] font-medium"
                >
                  Crear primera actividad →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

