import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import QRCodeActions from '@/components/QRCodeActions';
import AdminHeader from '@/components/AdminHeader';

interface ActivityDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminActivityDetailsPage({ params }: ActivityDetailsPageProps) {
  const supabase = await createClient();
  const { id } = await params;

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

  // Verificar que sea admin o responsable
  if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'super-admin')) {
    redirect('/dashboard');
  }

  // Obtener la actividad
  const { data: actividad, error: actividadError } = await supabase
    .from('actividades')
    .select(`
      *,
      responsable:usuarios!actividades_responsable_id_fkey(nombre, apellido_paterno)
    `)
    .eq('id', id)
    .single();

  // Obtener evento si existe
  let evento = null;
  if (actividad && actividad.evento_id) {
    const { data: eventoData } = await supabase
      .from('eventos')
      .select('nombre, codigo_evento')
      .eq('id', actividad.evento_id)
      .single();
    evento = eventoData;
  }

  if (actividadError || !actividad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Actividad no encontrada</h1>
          <Link
            href="/dashboard/admin"
            className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Verificar que el usuario sea responsable de esta actividad o super-admin
  if (usuario.rol !== 'super-admin' && actividad.responsable_id !== usuario.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No autorizado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para ver esta actividad</p>
          <Link
            href="/dashboard/admin"
            className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Obtener estadísticas de la actividad
  const { count: totalParticipaciones } = await supabase
    .from('participaciones')
    .select('*', { count: 'exact', head: true })
    .eq('actividad_id', id);

  const { count: participacionesValidadas } = await supabase
    .from('participaciones')
    .select('*', { count: 'exact', head: true })
    .eq('actividad_id', id)
    .eq('estado', 'validada');

  const { count: participacionesPendientes } = await supabase
    .from('participaciones')
    .select('*', { count: 'exact', head: true })
    .eq('actividad_id', id)
    .eq('estado', 'pendiente');

  // Obtener participaciones recientes
  const { data: participacionesRecientes } = await supabase
    .from('participaciones')
    .select(`
      *,
      alumno:usuarios!participaciones_alumno_id_fkey(nombre, apellido_paterno, grupo, folio_unico)
    `)
    .eq('actividad_id', id)
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
        title="Detalles de Actividad"
        userName={`${usuario.nombre} ${usuario.apellido_paterno}`}
        showBackButton={true}
        backHref="/dashboard/admin"
        backText="Volver al Dashboard"
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Información de la Actividad */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{actividad.nombre}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {actividad.clave_actividad}
                </span>
                {evento && <span>{evento.nombre}</span>}
                {actividad.responsable && (
                  <span>
                    Responsable: {actividad.responsable.nombre} {actividad.responsable.apellido_paterno}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#003366]">{actividad.puntaje}</div>
              <div className="text-sm text-gray-500">puntos</div>
            </div>
          </div>

          {actividad.descripcion && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700">{actividad.descripcion}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Estado</div>
              <div className={`font-semibold ${
                actividad.estado === 'activa' ? 'text-green-600' :
                actividad.estado === 'pausada' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {actividad.estado}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Límite de Participantes</div>
              <div className="font-semibold text-gray-900">
                {actividad.limite_participantes || 'Sin límite'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Requiere Validación</div>
              <div className={`font-semibold ${
                actividad.requiere_validacion ? 'text-orange-600' : 'text-green-600'
              }`}>
                {actividad.requiere_validacion ? 'Sí' : 'No'}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section - Solo visible para responsables y admins */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Código QR de la Actividad</h3>
          <div className="flex justify-center">
            {actividad.qr_code_url ? (
              <QRCodeActions 
                qrCodeUrl={actividad.qr_code_url}
                actividadClave={actividad.clave_actividad}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">No se ha generado el código QR</p>
                <p className="text-sm text-gray-500">
                  Contacta al super-administrador para generar el QR de esta actividad
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Total Participaciones</p>
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
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Validadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{participacionesValidadas || 0}</p>
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
                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{participacionesPendientes || 0}</p>
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
          <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="flex gap-4">
            <Link
              href={`/dashboard/admin/escanear/${actividad.id}`}
              className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition font-medium"
            >
              Escanear QR de Estudiantes
            </Link>
          </div>
        </div>

        {/* Participaciones Recientes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Participaciones Recientes</h3>
          <div className="space-y-3">
            {participacionesRecientes && participacionesRecientes.length > 0 ? (
              participacionesRecientes.map((participacion) => (
                <div key={participacion.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {participacion.alumno?.nombre} {participacion.alumno?.apellido_paterno}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {participacion.alumno?.grupo} - {participacion.alumno?.folio_unico}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      participacion.estado === 'validada' ? 'bg-green-100 text-green-800' :
                      participacion.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {participacion.estado}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(participacion.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {participacion.evidencia_url && (
                      <Link
                        href={participacion.evidencia_url}
                        target="_blank"
                        className="text-[#003366] hover:text-[#004080] text-sm font-medium"
                      >
                        Ver evidencia →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay participaciones registradas</p>
                <p className="text-sm text-gray-400">
                  Las participaciones aparecerán aquí cuando los estudiantes escaneen el QR
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
