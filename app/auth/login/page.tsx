'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ⚠️ CRÍTICO: Crear el cliente UNA SOLA VEZ fuera del componente
const supabase = createClient();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Intentando login...', email);

      // Login con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 Resultado auth:', { data, authError });

      if (authError) {
        console.error('❌ Error de autenticación:', authError);
        throw authError;
      }

      // Verificar que hay sesión y usuario
      if (!data.session || !data.user) {
        throw new Error('No se pudo crear la sesión');
      }

      console.log('✅ Sesión creada correctamente para:', data.user.email);

      // Verificar datos del usuario en la base de datos (opcional)
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol, activo, nombre')
        .eq('email', email)
        .single();

      console.log('👤 Datos del usuario:', { userData, userError });

      // Si encuentra el usuario, verificar que esté activo
      if (userData && !userData.activo) {
        await supabase.auth.signOut();
        throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
      }

      console.log('🔄 Redirigiendo al dashboard...');

      // Usar router.push + refresh (mejor práctica para Next.js App Router)
      router.push('/dashboard');
      router.refresh();
      
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Credenciales incorrectas. Verifica tu email y contraseña.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#003366] rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pumas con Cultura</h1>
          <p className="text-gray-600 mt-2 text-sm">Inicio de Sesión</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003366] text-white py-3 rounded-lg font-medium hover:bg-[#004080] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/register"
            className="text-[#003366] hover:underline block text-sm font-medium"
          >
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

