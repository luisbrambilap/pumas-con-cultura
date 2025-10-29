import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RegistrarManual from '@/components/RegistrarManual';
import AdminHeader from '@/components/AdminHeader';

interface RegistrarManualPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RegistrarManualActividadPage({ params }: RegistrarManualPageProps) {
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
    .select('*')
    .eq('id', id)
    .single();

  if (actividadError || !actividad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Actividad no encontrada</h1>
          <Link
            href="/dashboard/admin/registrar-manual"
            className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
          >
            Volver
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
          <p className="text-gray-600 mb-6">No tienes permisos para registrar en esta actividad</p>
          <Link
            href="/dashboard/admin/registrar-manual"
            className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
          >
            Volver
          </Link>
        </div>
      </div>
    );
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
        title={`Registro Manual - ${actividad.nombre}`}
        subtitle={`${actividad.codigo_actividad} • ${actividad.puntaje} puntos`}
        userName={`${usuario.nombre} ${usuario.apellido_paterno}`}
        showBackButton={true}
        backHref="/dashboard/admin/registrar-manual"
        backText="← Volver"
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegistrarManual
          actividadId={actividad.id}
          actividadNombre={actividad.nombre}
          actividadPuntaje={actividad.puntaje}
          requiereValidacion={actividad.requiere_validacion}
        />
      </main>
    </div>
  );
}

