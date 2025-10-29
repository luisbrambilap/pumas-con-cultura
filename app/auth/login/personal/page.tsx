'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ⚠️ CRÍTICO: Crear el cliente UNA SOLA VEZ fuera del componente
// Esto evita el warning "Multiple GoTrueClient instances detected"
const supabase = createClient();

export default function LoginPersonal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Intentando login personal...', email);

      // Login con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!data.session || !data.user) {
        throw new Error('No se pudo crear la sesión');
      }

      console.log('✅ Sesión creada para:', data.user.email);

      // Verificar el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol, activo')
        .eq('email', email)
        .single();

      if (userError) {
        console.error('Error al obtener usuario:', userError);
        throw new Error('No se encontró el perfil del usuario');
      }

      if (!userData.activo) {
        await supabase.auth.signOut();
        throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
      }

      if (userData.rol === 'alumno') {
        await supabase.auth.signOut();
        throw new Error('Esta área es solo para personal. Usa el login de estudiantes.');
      }

      console.log('🔄 Redirigiendo al dashboard...', userData.rol);

      // Redirigir según el rol
      if (userData.rol === 'admin') {
        window.location.href = '/dashboard/super-admin';
      } else if (userData.rol === 'responsable') {
        window.location.href = '/dashboard/admin';
      } else {
        throw new Error('Rol no reconocido');
      }
      
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Credenciales incorrectas');
      setLoading(false);
    }
    // No ponemos finally con setLoading(false) porque la página se recargará
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pumas con Cultura</h1>
          <p className="text-gray-600 mt-2 text-sm">Acceso Personal Docente y Administrativo</p>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-transparent"
              placeholder="tu@email.com"
              disabled={loading}
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login/estudiante"
            className="text-gray-500 hover:text-gray-700 block text-xs"
          >
            Acceso para estudiantes
          </Link>
        </div>
      </div>
    </div>
  );
}

