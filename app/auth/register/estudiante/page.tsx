'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { Grupo, Turno } from '@/lib/types';

// ⚠️ CRÍTICO: Crear el cliente UNA SOLA VEZ fuera del componente
const supabase = createClient();

export default function RegisterEstudiante() {
  const [formData, setFormData] = useState({
    matricula_interna: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    curp: '',
    email: '',
    password: '',
    confirmPassword: '',
    grupo: '' as Grupo | '',
    turno: '' as Turno | '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (!formData.grupo || !formData.turno) {
        throw new Error('Selecciona grupo y turno');
      }

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('Resultado de signUp:', { authData, authError });

      if (authError) {
        console.error('Error en signUp:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // Generar folio único (ejemplo: DM25-CURP-NOMBRE-APELLIDO)
      const folio_unico = `DM25-${formData.matricula_interna}-${formData.nombre.substring(0, 4).toUpperCase()}-${formData.apellido_paterno.substring(0, 4).toUpperCase()}`;

      console.log('Usuario creado en Auth, insertando en BD...');

      // Crear registro en la tabla usuarios
      const { error: insertError } = await supabase.from('usuarios').insert({
        id: authData.user.id,
        matricula_externa: formData.matricula_interna, // Usamos la misma para ambas por ahora
        matricula_interna: formData.matricula_interna,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno || null,
        email: formData.email,
        grupo: formData.grupo,
        ciclo_escolar: '2025',
        turno: formData.turno,
        rol: 'alumno',
        folio_unico,
        activo: true,
        curp: formData.curp,
      });

      console.log('Resultado de insert:', { insertError });

      if (insertError) {
        console.error('Error al insertar en usuarios:', insertError);
        throw insertError;
      }

      console.log('Registro completado, redirigiendo al login...');

      // Redirigir al login para que inicie sesión manualmente
      alert('¡Cuenta creada exitosamente! Ahora inicia sesión con tus credenciales.');
      router.push('/auth/login/estudiante');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#003366] rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pumas con Cultura</h1>
          <p className="text-gray-600 mt-2 text-sm">Registro de Nuevo Estudiante</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="matricula_interna" className="block text-sm font-medium text-gray-700 mb-2">
                Matrícula (CURP) *
              </label>
              <input
                id="matricula_interna"
                name="matricula_interna"
                type="text"
                required
                value={formData.matricula_interna}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="B202500000000010"
              />
            </div>

            <div>
              <label htmlFor="curp" className="block text-sm font-medium text-gray-700 mb-2">
                CURP *
              </label>
              <input
                id="curp"
                name="curp"
                type="text"
                required
                value={formData.curp}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="CURP18070090MDFXXX00"
                maxLength={18}
              />
            </div>

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Juan"
              />
            </div>

            <div>
              <label htmlFor="apellido_paterno" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido Paterno *
              </label>
              <input
                id="apellido_paterno"
                name="apellido_paterno"
                type="text"
                required
                value={formData.apellido_paterno}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Pérez"
              />
            </div>

            <div>
              <label htmlFor="apellido_materno" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido Materno
              </label>
              <input
                id="apellido_materno"
                name="apellido_materno"
                type="text"
                value={formData.apellido_materno}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="García"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="juan@email.com"
              />
            </div>

            <div>
              <label htmlFor="grupo" className="block text-sm font-medium text-gray-700 mb-2">
                Grupo *
              </label>
              <select
                id="grupo"
                name="grupo"
                required
                value={formData.grupo}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="">Selecciona un grupo</option>
                <option value="1A">1A</option>
                <option value="2A">2A</option>
                <option value="3 Humanidades">3 Humanidades</option>
                <option value="FM">FM</option>
              </select>
            </div>

            <div>
              <label htmlFor="turno" className="block text-sm font-medium text-gray-700 mb-2">
                Turno *
              </label>
              <select
                id="turno"
                name="turno"
                required
                value={formData.turno}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="">Selecciona un turno</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003366] text-white py-3 rounded-lg font-medium hover:bg-[#004080] transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Registrando...' : 'Registrar Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login/estudiante"
            className="text-[#003366] hover:underline text-sm font-medium"
          >
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

