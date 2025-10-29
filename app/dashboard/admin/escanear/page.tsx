import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

export default async function ScannerPage() {
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

  // Verificar que sea admin o responsable
  if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'super-admin')) {
    redirect('/dashboard');
  }

  // Obtener actividades donde es responsable
  const { data: misActividades } = await supabase
    .from('actividades')
    .select('*')
    .eq('responsable_id', usuario.id)
    .order('created_at', { ascending: false });

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
        title="Escáner QR"
        userName={`${usuario.nombre} ${usuario.apellido_paterno}`}
        showBackButton={true}
        backHref="/dashboard/admin"
        backText="Volver al Dashboard"
        onLogout={handleLogout}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Instrucciones */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cómo usar el Escáner QR</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Selecciona una actividad</h3>
                  <p className="text-sm text-gray-600">Elige la actividad para la cual quieres escanear códigos QR de estudiantes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Abre la cámara</h3>
                  <p className="text-sm text-gray-600">Permite el acceso a la cámara cuando se solicite</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Escanea el QR del estudiante</h3>
                  <p className="text-sm text-gray-600">Apunta la cámara al código QR del estudiante</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Confirma la participación</h3>
                  <p className="text-sm text-gray-600">Verifica los datos del estudiante y confirma su participación</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">5</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Registra automáticamente</h3>
                  <p className="text-sm text-gray-600">El sistema registra la participación y otorga los puntos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de Actividad */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Seleccionar Actividad</h2>
          
          {misActividades && misActividades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {misActividades.map((actividad) => (
                <Link
                  key={actividad.id}
                  href={`/dashboard/admin/escanear/${actividad.id}`}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{actividad.nombre}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {actividad.clave_actividad}
                        </span>
                        <span>{actividad.puntaje} pts</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      actividad.estado === 'activa' ? 'bg-green-100 text-green-800' :
                      actividad.estado === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {actividad.estado}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {actividad.requiere_validacion ? 'Requiere validación' : 'Validación automática'}
                    </div>
                    <div className="flex items-center text-[#003366] font-medium">
                      Escanear QR
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes actividades asignadas</h3>
              <p className="text-gray-600 mb-6">
                Contacta al administrador para que te asigne actividades como responsable
              </p>
              <Link
                href="/dashboard/admin"
                className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
              >
                Volver al Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Información importante</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los estudiantes deben tener su código QR personal generado</li>
                <li>• El escáner funciona mejor con buena iluminación</li>
                <li>• Mantén la cámara estable al escanear</li>
                <li>• Las participaciones se registran automáticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
