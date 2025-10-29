'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// ⚠️ CRÍTICO: Crear el cliente UNA SOLA VEZ fuera del componente
const supabase = createClient();

interface QRDisplayProps {
  actividadId: string;
  claveActividad: string;
  qrCodeUrl?: string | null;
  onQRGenerated?: (qrUrl: string) => void;
}

export default function QRDisplay({
  actividadId,
  claveActividad,
  qrCodeUrl,
  onQRGenerated,
}: QRDisplayProps) {
  const [qrUrl, setQrUrl] = useState(qrCodeUrl);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  const generarQR = async () => {
    setGenerando(true);
    setError('');

    try {
      const response = await fetch('/api/actividades/generar-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actividad_id: actividadId }),
      });

      if (!response.ok) {
        throw new Error('Error al generar QR');
      }

      const data = await response.json();
      setQrUrl(data.qr_code_url);
      
      if (onQRGenerated) {
        onQRGenerated(data.qr_code_url);
      }
    } catch (err: any) {
      setError(err.message || 'Error al generar QR');
    } finally {
      setGenerando(false);
    }
  };

  const descargarQR = () => {
    if (!qrUrl) return;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${claveActividad}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imprimirQR = () => {
    if (!qrUrl) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR - ${claveActividad}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              h1 {
                color: #003366;
                margin-bottom: 10px;
              }
              .code {
                color: #666;
                font-size: 18px;
                margin-bottom: 30px;
              }
              img {
                max-width: 500px;
                border: 2px solid #003366;
                border-radius: 10px;
                padding: 20px;
              }
              .instructions {
                margin-top: 30px;
                color: #666;
                font-size: 14px;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Código QR de Actividad</h1>
              <div class="code">${claveActividad}</div>
              <img src="${qrUrl}" alt="QR Code" />
              <div class="instructions">
                Escanea este código para registrar tu participación
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={generarQR}
          className="mt-2 text-red-700 hover:text-red-900 text-sm font-medium"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!qrUrl) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">No se ha generado el código QR</p>
        <button
          onClick={generarQR}
          disabled={generando}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {generando ? 'Generando...' : 'Generar QR'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center">
        <img
          src={qrUrl}
          alt={`QR ${claveActividad}`}
          className="mx-auto mb-4 rounded-lg shadow-sm"
          style={{ width: '300px', height: '300px' }}
        />
        <p className="text-gray-600 text-sm mb-4">
          Código: <span className="font-mono font-bold">{claveActividad}</span>
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={descargarQR}
            className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#004080] transition text-sm font-medium"
          >
            Descargar
          </button>
          <button
            onClick={imprimirQR}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
          >
            Imprimir
          </button>
          <button
            onClick={generarQR}
            disabled={generando}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium disabled:opacity-50"
          >
            Regenerar
          </button>
        </div>
      </div>
    </div>
  );
}

