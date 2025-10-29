import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

export default async function ActivitiesListPage() {
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

  // Verificar que sea admin o super-admin
  if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'super-admin')) {
    redirect('/dashboard');
  }

  // Obtener todas las actividades
  const { data: actividades, error: actividadesError } = await supabase
    .from('actividades')
    .select(`
      *,
      responsable:usuarios!actividades_responsable_id_fkey(nombre, apellido_paterno)
    `)
    .order('created_at', { ascending: false });

  // Obtener eventos para las actividades que los tienen
  if (actividades && actividades.length > 0) {
    const eventoIds = actividades
      .filter(a => a.evento_id)
      .map(a => a.evento_id);
    
    if (eventoIds.length > 0) {
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id, nombre, codigo_evento')
        .in('id', eventoIds);
      
      // Agregar evento a cada actividad
      if (eventos) {
        actividades.forEach(actividad => {
          if (actividad.evento_id) {
            actividad.evento = eventos.find(e => e.id === actividad.evento_id);
          }
        });
      }
    }
  }

  // Obtener estadísticas generales
  const { count: totalActividades } = await supabase
    .from('actividades')
    .select('*', { count: 'exact', head: true });

  const { count: actividadesActivas } = await supabase
    .from('actividades')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'activa');

  const { count: actividadesPausadas } = await supabase
    .from('actividades')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pausada');

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
        title="Gestión de Actividades"
        userName={`${usuario.nombre} ${usuario.apellido_paterno}`}
        showBackButton={true}
        backHref="/dashboard/super-admin"
        backText="Volver al Dashboard"
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Total Actividades</p>
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
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Activas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{actividadesActivas || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Pausadas</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{actividadesPausadas || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Acciones Rápidas</h2>
            <Link
              href="/dashboard/super-admin/actividades/crear"
              className="bg-[#003366] text-white px-6 py-2 rounded-lg hover:bg-[#004080] transition font-medium"
            >
              + Crear Nueva Actividad
            </Link>
          </div>
        </div>

        {/* Lista de Actividades */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Todas las Actividades</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {actividades && actividades.length > 0 ? (
              actividades.map((actividad) => (
                <div key={actividad.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{actividad.nombre}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          actividad.estado === 'activa' ? 'bg-green-100 text-green-800' :
                          actividad.estado === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {actividad.estado}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {actividad.clave_actividad}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Evento:</span> {actividad.evento?.nombre || 'Sin evento'}
                        </div>
                        <div>
                          <span className="font-medium">Responsable:</span> {
                            actividad.responsable ? 
                            `${actividad.responsable.nombre} ${actividad.responsable.apellido_paterno}` : 
                            'Sin asignar'
                          }
                        </div>
                        <div>
                          <span className="font-medium">Puntos:</span> {actividad.puntaje}
                        </div>
                      </div>

                      {actividad.descripcion && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{actividad.descripcion}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Creada: {new Date(actividad.created_at).toLocaleDateString('es-MX')}
                        </span>
                        {actividad.requiere_validacion && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Requiere validación
                          </span>
                        )}
                        {actividad.limite_participantes && (
                          <span>
                            Límite: {actividad.limite_participantes} participantes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <Link
                        href={`/dashboard/super-admin/actividades/${actividad.id}`}
                        className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#004080] transition text-sm font-medium"
                      >
                        Ver Detalles
                      </Link>
                      {actividad.responsable_id === usuario.id && (
                        <Link
                          href={`/dashboard/admin/escanear/${actividad.id}`}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                          Escanear QR
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay actividades creadas</h3>
                <p className="text-gray-600 mb-6">
                  Comienza creando tu primera actividad para el sistema
                </p>
                <Link
                  href="/dashboard/super-admin/actividades/crear"
                  className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition font-medium"
                >
                  Crear Primera Actividad
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
