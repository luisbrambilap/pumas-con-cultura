import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
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

    // Obtener datos del usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', user.email)
      .single();

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Crear objeto con datos del estudiante para el QR
    const studentData = {
      id: usuario.id,
      folio: usuario.folio_unico,
      matricula: usuario.matricula_externa || usuario.matricula_interna,
      nombre: `${usuario.nombre} ${usuario.apellido_paterno}`,
      grupo: usuario.grupo,
    };

    // Generar QR con los datos del estudiante (como JSON string)
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(studentData), {
      width: 500,
      margin: 2,
      color: {
        dark: '#003366',
        light: '#FFFFFF',
      },
    });

    // Actualizar el usuario con la URL del QR
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ qr_code_url: qrDataUrl })
      .eq('id', usuario.id);

    if (updateError) {
      console.error('Error al actualizar QR del usuario:', updateError);
    }

    return NextResponse.json({
      success: true,
      qr_code_url: qrDataUrl,
    });
  } catch (error: any) {
    console.error('Error generando QR de estudiante:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar QR' },
      { status: 500 }
    );
  }
}

