'use client';

interface QRCodeActionsProps {
  qrCodeUrl: string;
  actividadClave: string;
}

export default function QRCodeActions({ qrCodeUrl, actividadClave }: QRCodeActionsProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR-${actividadClave}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR - ${actividadClave}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: Arial, sans-serif; }
              .container { text-align: center; padding: 40px; }
              h1 { color: #003366; margin-bottom: 10px; }
              .code { color: #666; font-size: 18px; margin-bottom: 30px; }
              img { max-width: 500px; border: 2px solid #003366; border-radius: 10px; padding: 20px; }
              .instructions { margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Código QR de Actividad</h1>
              <div class="code">${actividadClave}</div>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="instructions">Escanea este código para registrar tu participación</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  return (
    <div className="text-center">
      <img
        src={qrCodeUrl}
        alt={`QR ${actividadClave}`}
        className="mx-auto mb-4 rounded-lg shadow-sm"
        style={{ width: '300px', height: '300px' }}
      />
      <p className="text-gray-600 text-sm mb-4">
        Código: <span className="font-mono font-bold">{actividadClave}</span>
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleDownload}
          className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-[#004080] transition text-sm font-medium"
        >
          Descargar
        </button>
        <button
          onClick={handlePrint}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
}

