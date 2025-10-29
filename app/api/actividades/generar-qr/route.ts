import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { actividad_id } = await request.json();

    if (!actividad_id) {
      return NextResponse.json(
        { error: 'ID de actividad requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener la actividad
    const { data: actividad, error: actividadError } = await supabase
      .from('actividades')
      .select('*')
      .eq('id', actividad_id)
      .single();

    if (actividadError || !actividad) {
      console.error('Error al obtener actividad:', actividadError);
      return NextResponse.json(
        { error: 'Actividad no encontrada', details: actividadError?.message },
        { status: 404 }
      );
    }

    // Generar URL de participación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const participacionUrl = `${baseUrl}/a/${actividad.clave_actividad}`;

    // Generar QR como Data URL
    const qrDataUrl = await QRCode.toDataURL(participacionUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#003366',
        light: '#FFFFFF',
      },
    });

    // Actualizar la actividad con la URL del QR
    const { error: updateError } = await supabase
      .from('actividades')
      .update({ qr_code_url: qrDataUrl })
      .eq('id', actividad_id);

    if (updateError) {
      console.error('Error al actualizar QR:', updateError);
    }

    return NextResponse.json({
      success: true,
      qr_code_url: qrDataUrl,
      participacion_url: participacionUrl,
    });
  } catch (error: any) {
    console.error('Error generando QR:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar QR' },
      { status: 500 }
    );
  }
}

