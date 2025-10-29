import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardRoot() {
  const supabase = await createClient();

  // ✅ Seguridad: getUser() valida el JWT con el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('📍 Dashboard root - Usuario:', user ? 'Existe' : 'No existe');

  if (!user) {
    console.log('❌ No hay usuario, redirigiendo al login');
    redirect('/auth/login');
  }

  console.log('✅ Usuario encontrado:', user.email);

  // Obtener datos del usuario
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('rol, nombre, activo')
    .eq('email', user.email)
    .single();

  console.log('👤 Usuario en BD:', { usuario, usuarioError });

  // Si no hay usuario en BD o es alumno, ir al dashboard de estudiante
  if (!usuario || usuario.rol === 'alumno' || usuarioError) {
    console.log('➡️ Redirigiendo a dashboard de estudiante');
    redirect('/dashboard/estudiante');
  }

  // Si es admin, ir al dashboard de admin
  if (usuario.rol === 'admin') {
    console.log('➡️ Redirigiendo a dashboard de admin');
    redirect('/dashboard/super-admin');
  }

  // Si es responsable, ir al dashboard de responsable
  if (usuario.rol === 'responsable') {
    console.log('➡️ Redirigiendo a dashboard de responsable');
    redirect('/dashboard/admin');
  }

  // Por defecto, ir al dashboard de estudiante
  console.log('➡️ Redirigiendo a dashboard por defecto');
  redirect('/dashboard/estudiante');
}

