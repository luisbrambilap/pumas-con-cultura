'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ⚠️ CRÍTICO: Crear el cliente UNA SOLA VEZ fuera del componente
const supabase = createClient();

export default function CrearActividad() {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    puntaje: 10,
    fecha_inicio: '',
    fecha_fin: '',
    responsable_id: '',
  });
  const [responsables, setResponsables] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    cargarResponsables();
  }, []);

  const cargarResponsables = async () => {
    // Cargar responsables (admin y responsable)
    const { data: responsablesData } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido_paterno, apellido_materno, rol')
      .in('rol', ['admin', 'responsable'])
      .eq('activo', true);
    
    if (responsablesData) setResponsables(responsablesData);
  };

  const generarClave = () => {
    const nombreCorto = formData.nombre
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s/g, '');
    const numero = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ACT-${nombreCorto}-${numero}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.nombre || !formData.descripcion || !formData.fecha_inicio || !formData.fecha_fin || !formData.responsable_id) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      const claveActividad = generarClave();

      const actividadData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        puntaje: parseInt(formData.puntaje.toString()),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        responsable_id: formData.responsable_id,
        clave_actividad: claveActividad,
        estado: 'activa',
      };

      const { error: insertError } = await supabase
        .from('actividades')
        .insert(actividadData);

      if (insertError) {
        throw insertError;
      }

      router.push('/dashboard/super-admin');
      router.refresh();
    } catch (err: any) {
      console.error('Error al crear actividad:', err);
      setError(err.message || 'Error al crear la actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/super-admin"
            className="text-[#003366] hover:text-[#004080] font-medium text-sm mb-4 inline-block"
          >
            ← Volver al dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Actividad</h1>
          <p className="text-gray-600 mt-2">Completa los datos básicos de la actividad</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Actividad *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent text-black"
                placeholder="Ej: Taller de Lectura"
                disabled={loading}
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                required
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent text-black"
                placeholder="Describe la actividad..."
                disabled={loading}
              />
            </div>

            {/* Puntos */}
            <div>
              <label htmlFor="puntaje" className="block text-sm font-medium text-gray-700 mb-2">
                Puntos *
              </label>
              <input
                id="puntaje"
                name="puntaje"
                type="number"
                required
                min="1"
                max="100"
                value={formData.puntaje}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent text-black"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Puntos que recibirá el estudiante al participar (1-100)
              </p>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  id="fecha_inicio"
                  name="fecha_inicio"
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent text-black"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  id="fecha_fin"
                  name="fecha_fin"
                  type="date"
                  required
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent text-black"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Responsable */}
            <div>
              <label htmlFor="responsable_id" className="block text-sm font-medium text-gray-700 mb-2">
                Asignar Responsable *
              </label>
              <select
                id="responsable_id"
                name="responsable_id"
                required
                value={formData.responsable_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-transparent text-black"
                disabled={loading}
              >
                <option value="">Selecciona un responsable</option>
                {responsables.map((resp) => (
                  <option key={resp.id} value={resp.id}>
                    {resp.nombre} {resp.apellido_paterno} {resp.apellido_materno} ({resp.rol})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Persona encargada de gestionar y validar esta actividad
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#003366] text-white py-3 rounded-lg font-semibold hover:bg-[#004080] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Actividad'}
              </button>
              <Link
                href="/dashboard/super-admin"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• La actividad se creará con estado "Activa" automáticamente</li>
            <li>• Se generará un código único para la actividad</li>
            <li>• Los estudiantes podrán participar escaneando el QR de la actividad</li>
            <li>• El responsable podrá validar participaciones desde su panel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
