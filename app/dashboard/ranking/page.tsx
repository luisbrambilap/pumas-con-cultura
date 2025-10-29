import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RankingList from '@/components/RankingList';
import AdminHeader from '@/components/AdminHeader';

export default async function RankingPage() {
  const supabase = await createClient();

  // ✅ Seguridad: getUser() valida el JWT con el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', user.email)
    .single();

  // Determinar a qué dashboard volver según el rol
  let backLink = '/dashboard/estudiante';
  if (usuario) {
    if (usuario.rol === 'admin') {
      backLink = '/dashboard/super-admin';
    } else if (usuario.rol === 'responsable') {
      backLink = '/dashboard/admin';
    }
  }

  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Ranking General"
        subtitle="Clasificación de estudiantes"
        userName={`${usuario?.nombre || 'Usuario'} ${usuario?.apellido_paterno || ''}`}
        showBackButton={true}
        backHref={backLink}
        backText="← Volver"
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <RankingList />
      </div>
    </div>
  );
}

