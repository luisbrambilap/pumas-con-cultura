import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

export default async function DashboardAdmin() {
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

  // Obtener actividades donde es responsable
  const { data: misActividades } = await supabase
    .from('actividades')
    .select('*')
    .eq('responsable_id', usuarioDisplay.id)
    .order('created_at', { ascending: false });

  // Obtener participaciones pendientes de validación
  const actividadIds = misActividades?.map((a) => a.id) || [];
  const { data: participacionesPendientes } = await supabase
    .from('participaciones')
    .select(`
      *,
      alumno:usuarios!participaciones_alumno_id_fkey(nombre, apellido_paterno, grupo, folio_unico),
      actividad:actividades(nombre)
    `)
    .in('actividad_id', actividadIds)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(10);

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
        title="Panel de Responsable"
        userName={`${usuarioDisplay.nombre} ${usuarioDisplay.apellido_paterno}`}
        showRanking={true}
        showAdminPanel={usuarioDisplay.rol === 'admin'}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Mis Actividades</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">{misActividades?.length || 0}</p>
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
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">
                  {participacionesPendientes?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Total Validadas</p>
                <p className="text-3xl font-bold text-[#003366] mt-2">
                  {/* Aquí iría el count de validadas */}
                  0
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Participaciones Pendientes */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pendientes de Validación</h2>
            </div>
            <div className="space-y-4">
              {participacionesPendientes && participacionesPendientes.length > 0 ? (
                participacionesPendientes.map((participacion) => (
                  <div key={participacion.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {participacion.alumno?.nombre} {participacion.alumno?.apellido_paterno}
                        </p>
                        <p className="text-sm text-gray-600">{participacion.alumno?.grupo}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        Pendiente
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {participacion.actividad?.nombre}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(participacion.created_at).toLocaleDateString('es-MX')}
                      </span>
                      <Link
                        href={`/dashboard/admin/validar/${participacion.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                      >
                        Validar
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No hay participaciones pendientes</p>
              )}
            </div>
          </div>

          {/* Mis Actividades */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mis Actividades</h2>
            <div className="space-y-4">
              {misActividades && misActividades.length > 0 ? (
                misActividades.map((actividad) => (
                  <div key={actividad.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{actividad.nombre}</h3>
                        <p className="text-sm text-gray-600">{actividad.evento?.nombre}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          actividad.estado === 'activa'
                            ? 'bg-green-100 text-green-800'
                            : actividad.estado === 'pausada'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {actividad.estado}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-medium text-blue-600">
                        {actividad.puntaje} puntos
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/admin/actividad/${actividad.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Ver detalles
                        </Link>
                        <Link
                          href={`/dashboard/admin/escanear/${actividad.id}`}
                          className="bg-[#003366] text-white px-3 py-1 rounded text-sm hover:bg-[#004080] transition font-medium"
                        >
                          Escanear
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tienes actividades asignadas</p>
                  <p className="text-sm text-gray-400">
                    Contacta al administrador para que te asigne actividades
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Escáner QR */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Registro de Participaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#003366] transition">
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Escanear QR del Alumno</h3>
              <p className="text-sm text-gray-600 mb-4">
                Escanea el código QR del alumno para registrar su participación
              </p>
              <Link
                href="/dashboard/admin/escanear"
                className="inline-block bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition font-medium"
              >
                Abrir Escáner
              </Link>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#003366] transition">
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Registro Manual</h3>
              <p className="text-sm text-gray-600 mb-4">
                Registra participaciones ingresando la matrícula del alumno
              </p>
              <Link
                href="/dashboard/admin/registrar-manual"
                className="inline-block bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition font-medium"
              >
                Registrar Manual
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

