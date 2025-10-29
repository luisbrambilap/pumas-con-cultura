'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import EscanearAlumno from '@/components/EscanearAlumno';
import AdminHeaderClient from '@/components/AdminHeaderClient';

interface Actividad {
  id: string;
  nombre: string;
  clave_actividad: string;
  puntaje: number;
  estado: string;
  requiere_validacion: boolean;
  limite_participantes: number | null;
}

export default function ActivityScannerPage() {
  const [actividad, setActividad] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    loadActividad();
  }, []);

  const loadActividad = async () => {
    try {
      const actividadId = params.id as string;
      if (!actividadId) {
        setError('ID de actividad no válido');
        return;
      }

      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('id', actividadId)
        .single();

      if (error || !data) {
        setError('Actividad no encontrada');
        return;
      }

      setActividad(data);
    } catch (err) {
      setError('Error al cargar la actividad');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (error || !actividad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Actividad no encontrada'}</p>
          <Link
            href="/dashboard/admin/escanear"
            className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition"
          >
            Volver al Escáner
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    // This would need to be implemented with proper logout logic
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeaderClient
        title={`Escáner QR - ${actividad.nombre}`}
        subtitle={`${actividad.clave_actividad} • ${actividad.puntaje} puntos`}
        userName="Usuario" // This would need to be passed from props or context
        showBackButton={true}
        backHref="/dashboard/admin/escanear"
        backText="Volver"
        onLogout={handleLogout}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <EscanearAlumno
          actividadId={actividad.id}
          actividadNombre={actividad.nombre}
          actividadPuntaje={actividad.puntaje}
          requiereValidacion={actividad.requiere_validacion}
        />
      </div>
    </div>
  );
}
