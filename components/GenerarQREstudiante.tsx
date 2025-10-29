'use client';

import { useState } from 'react';

export default function GenerarQREstudiante({ onQRGenerated }: { onQRGenerated?: () => void }) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  const generarQR = async () => {
    setGenerando(true);
    setError('');

    try {
      const response = await fetch('/api/usuarios/generar-qr', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al generar QR');
      }

      // Recargar la página para mostrar el nuevo QR
      if (onQRGenerated) {
        onQRGenerated();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Error al generar QR');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="text-center">
      {error && (
        <p className="text-red-600 text-sm mb-2">{error}</p>
      )}
      <button
        onClick={generarQR}
        disabled={generando}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {generando ? 'Generando...' : 'Generar mi QR'}
      </button>
    </div>
  );
}

