'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ⚠️ CRÍTICO: Crear el cliente UNA SOLA VEZ fuera del componente
// Esto evita el warning "Multiple GoTrueClient instances detected"
const supabase = createClient();

export default function LoginEstudiante() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      if (userData.rol !== 'alumno') {
        await supabase.auth.signOut();
        throw new Error('Esta área es solo para estudiantes. Usa el login de personal.');
      }

      console.log('🔄 Redirigiendo al dashboard...');

      // Usar window.location para forzar recarga completa
      // El middleware ahora sincronizará las cookies correctamente
      window.location.href = '/dashboard/estudiante';
      
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
          <div className="w-16 h-16 bg-[#003366] rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pumas con Cultura</h1>
          <p className="text-gray-600 mt-2 text-sm">Inicio de Sesión - Estudiantes</p>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="••••••••"
              disabled={loading}
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

        <div className="mt-6 text-center space-y-3">
          <Link
            href="/auth/register/estudiante"
            className="text-[#003366] hover:underline block text-sm font-medium"
          >
            ¿No tienes cuenta? Regístrate aquí
          </Link>
          <Link
            href="/auth/login/personal"
            className="text-gray-500 hover:text-gray-700 block text-xs"
          >
            Acceso para personal docente y administrativo
          </Link>
        </div>
      </div>
    </div>
  );
}

