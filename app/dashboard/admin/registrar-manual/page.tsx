import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';

export default async function RegistrarManualPage() {
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

  // Obtener actividades donde es responsable y que estén activas
  const { data: misActividades } = await supabase
    .from('actividades')
    .select('*')
    .eq('responsable_id', usuario.id)
    .eq('estado', 'activa')
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
        title="🔑 Registro Manual"
        userName={`${usuario.nombre} ${usuario.apellido_paterno}`}
        showBackButton={true}
        backHref="/dashboard/admin"
        backText="← Volver"
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-2">📋 ¿Cómo funciona?</h2>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Selecciona una actividad activa de la lista</li>
              <li>• Ingresa la matrícula del estudiante</li>
              <li>• El sistema buscará al estudiante y registrará su participación</li>
              <li>• Ideal para cuando no se puede usar el escáner QR</li>
            </ul>
          </div>

          {/* Lista de Actividades */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona una Actividad</h2>
            
            {misActividades && misActividades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {misActividades.map((actividad) => (
                  <Link
                    key={actividad.id}
                    href={`/dashboard/admin/registrar-manual/${actividad.id}`}
                    className="border border-gray-200 rounded-lg p-5 hover:border-[#003366] hover:shadow-lg transition group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#003366] transition mb-1">
                          {actividad.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">{actividad.codigo_actividad}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          Activa
                        </span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#003366]">{actividad.puntaje}</div>
                          <div className="text-xs text-gray-500">puntos</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        {actividad.requiere_validacion ? (
                          <span className="text-yellow-600">⏳ Requiere validación</span>
                        ) : (
                          <span className="text-green-600">✓ Validación automática</span>
                        )}
                      </div>
                      <div className="text-[#003366] font-medium text-sm group-hover:translate-x-1 transition">
                        Registrar →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes actividades activas
                </h3>
                <p className="text-gray-600 mb-6">
                  Para usar el registro manual, primero debes tener actividades activas asignadas.
                </p>
                <Link
                  href="/dashboard/admin"
                  className="inline-block bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
                >
                  Volver al Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

