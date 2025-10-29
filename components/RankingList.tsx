'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RankingItem {
  alumno_id: string;
  alumno: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    grupo: string;
    matricula_externa: string;
    matricula_interna: string;
  };
  total_puntos: number;
  numero_actividades: number;
  posicion: number;
}

function RankingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Skeleton para el podio */}
      <div className="mb-12">
        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-6"></div>
        <div className="flex justify-center items-end gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`bg-gray-100 rounded-t-3xl p-6 ${i === 2 ? 'w-72 scale-110' : 'w-64'}`}>
              <div className="bg-gray-200 w-24 h-24 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-20 mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton para la tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-lg w-48"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(8)].map((_, i) => (
                <tr key={i} className={i < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                      {i < 3 && <div className="ml-2 w-4 h-4 bg-gray-200 rounded"></div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function RankingList() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener participaciones validadas
      const { data: participaciones, error: participacionesError } = await supabase
        .from('participaciones')
        .select(`
          alumno_id,
          puntos_otorgados,
          alumno:usuarios!participaciones_alumno_id_fkey(
            nombre,
            apellido_paterno,
            apellido_materno,
            grupo,
            matricula_externa,
            matricula_interna
          )
        `)
        .eq('estado', 'validada');

      if (participacionesError) throw participacionesError;

      // Agrupar por alumno y sumar puntos
      const rankingMap = new Map();

      participaciones?.forEach((p: any) => {
        if (!p.alumno) return;

        const alumnoId = p.alumno_id;
        if (rankingMap.has(alumnoId)) {
          const existing = rankingMap.get(alumnoId);
          existing.total_puntos += p.puntos_otorgados || 0;
          existing.numero_actividades += 1;
        } else {
          rankingMap.set(alumnoId, {
            alumno_id: alumnoId,
            alumno: p.alumno,
            total_puntos: p.puntos_otorgados || 0,
            numero_actividades: 1,
          });
        }
      });

      // Convertir a array y ordenar
      const rankingArray = Array.from(rankingMap.values()).sort((a: any, b: any) => {
        if (b.total_puntos !== a.total_puntos) {
          return b.total_puntos - a.total_puntos;
        }
        return b.numero_actividades - a.numero_actividades;
      });

      // Asignar posiciones
      rankingArray.forEach((r: any, index: number) => {
        r.posicion = index + 1;
      });

      setRanking(rankingArray);
    } catch (err: any) {
      console.error('Error loading ranking:', err);
      setError(err.message || 'Error al cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <RankingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold mb-2">Error al cargar el ranking</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={loadRanking}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Podio Top 3 */}
      {ranking && ranking.length >= 3 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🏆 Podio de Ganadores
          </h2>
          <div className="flex justify-center items-end gap-4">
            {/* Segundo Lugar */}
            <div className="bg-gray-100 rounded-t-3xl p-6 w-64 text-center">
              <div className="bg-gray-300 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🥈</span>
              </div>
              <p className="text-6xl font-bold text-gray-400 mb-2">2</p>
              <p className="font-bold text-gray-900 text-lg">
                {ranking[1].alumno?.nombre} {ranking[1].alumno?.apellido_paterno}
              </p>
              <p className="text-gray-600 text-sm mb-2">{ranking[1].alumno?.grupo}</p>
              <p className="text-3xl font-bold text-gray-700">{ranking[1].total_puntos}</p>
              <p className="text-sm text-gray-500">puntos</p>
            </div>

            {/* Primer Lugar */}
            <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-t-3xl p-6 w-72 text-center transform scale-110">
              <div className="bg-yellow-400 w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">👑</span>
              </div>
              <p className="text-7xl font-bold text-yellow-600 mb-2">1</p>
              <p className="font-bold text-gray-900 text-xl">
                {ranking[0].alumno?.nombre} {ranking[0].alumno?.apellido_paterno}
              </p>
              <p className="text-gray-700 text-sm mb-2">{ranking[0].alumno?.grupo}</p>
              <p className="text-4xl font-bold text-yellow-600">{ranking[0].total_puntos}</p>
              <p className="text-sm text-gray-600">puntos</p>
            </div>

            {/* Tercer Lugar */}
            <div className="bg-orange-100 rounded-t-3xl p-6 w-64 text-center">
              <div className="bg-orange-300 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🥉</span>
              </div>
              <p className="text-6xl font-bold text-orange-400 mb-2">3</p>
              <p className="font-bold text-gray-900 text-lg">
                {ranking[2].alumno?.nombre} {ranking[2].alumno?.apellido_paterno}
              </p>
              <p className="text-gray-600 text-sm mb-2">{ranking[2].alumno?.grupo}</p>
              <p className="text-3xl font-bold text-orange-600">{ranking[2].total_puntos}</p>
              <p className="text-sm text-gray-500">puntos</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla Completa */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-gray-50 border-b">
          <h2 className="text-xl font-bold text-gray-900">Ranking Completo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking && ranking.length > 0 ? (
                ranking.map((rank) => (
                  <tr
                    key={rank.alumno_id}
                    className={`hover:bg-gray-50 ${
                      rank.posicion <= 3 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-700 w-12">
                          {rank.posicion}
                        </span>
                        {rank.posicion === 1 && <span className="ml-2">🏆</span>}
                        {rank.posicion === 2 && <span className="ml-2">🥈</span>}
                        {rank.posicion === 3 && <span className="ml-2">🥉</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rank.alumno?.nombre} {rank.alumno?.apellido_paterno}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rank.alumno?.grupo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rank.numero_actividades}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-blue-600">
                        {rank.total_puntos}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hay datos de ranking disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

