import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton: Solo creamos UNA instancia del cliente
let client: SupabaseClient | null = null;

export const createClient = () => {
  // Si ya existe una instancia, la reutilizamos
  if (client) {
    return client;
  }

  // Si no existe, creamos una nueva
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
};

