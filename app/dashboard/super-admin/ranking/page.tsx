import { redirect } from 'next/navigation';

// Redirigir a la nueva ruta compartida del ranking
export default async function RankingPageRedirect() {
  redirect('/dashboard/ranking');
}

