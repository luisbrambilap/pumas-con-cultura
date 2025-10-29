'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setScanning(true);
      setError('');

      const codeReader = new BrowserMultiFormatReader();
      readerRef.current = codeReader;

      // Obtener dispositivos de video
      const videoInputDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = videoInputDevices.filter(device => device.kind === 'videoinput');
      
      if (cameras.length === 0) {
        throw new Error('No se encontró ninguna cámara');
      }

      // Intentar usar la cámara trasera en dispositivos móviles
      const selectedDevice = cameras.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('trasera') ||
        device.label.toLowerCase().includes('environment')
      ) || cameras[0];

      if (videoRef.current) {
        const controls = await codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const text = result.getText();
              console.log('QR detectado:', text);
              onScan(text);
              stopScanner();
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error('Error en escáner:', error);
            }
          }
        );
        controlsRef.current = controls;
      }
    } catch (err: any) {
      console.error('Error al iniciar escáner:', err);
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Permiso denegado para acceder a la cámara. Por favor, permite el acceso.'
        : 'No se pudo acceder a la cámara. Verifica los permisos.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#003366] text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Escanear Código QR</h2>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="text-white hover:text-gray-200 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          
          {/* Overlay con marco de escaneo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64">
              {/* Esquinas del marco */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FFB81C]"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FFB81C]"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FFB81C]"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FFB81C]"></div>
              
              {/* Línea de escaneo animada */}
              {scanning && (
                <div className="absolute inset-x-0 top-1/2 h-1 bg-[#FFB81C] shadow-lg shadow-[#FFB81C]/50 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="p-6 bg-gray-50">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              <p className="font-semibold mb-1">❌ Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => {
                  stopScanner();
                  onClose();
                }}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                <p className="font-semibold mb-2">📱 Instrucciones:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Coloca el código QR dentro del marco amarillo</li>
                  <li>• Mantén el dispositivo estable</li>
                  <li>• Asegúrate de tener buena iluminación</li>
                  <li>• El escaneo es automático</li>
                </ul>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#003366]"></div>
                <span className="text-sm">Escaneando...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}