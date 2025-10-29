import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-md border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.svg" 
                alt="Pumas con Cultura" 
                className="w-16 h-16 object-cover rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">Pumas con Cultura</h1>
                <p className="text-sm text-gray-300">Sistema de Gestión de Actividades Culturales</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido al Sistema de Actividades Culturales
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plataforma para la gestión, registro y seguimiento de participación en actividades culturales de la escuela Preparatoria Federal por Cooperación "Lázaro Cárdenas" .
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Card Estudiantes */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-[#003366] rounded-lg flex items-center justify-center text-white text-2xl font-bold mr-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Acceso Estudiantes</h3>
                  <p className="text-sm text-gray-500">Alumnos de preparatoria</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Accede para participar en actividades culturales, consultar tu historial y ver tu progreso académico-cultural.
              </p>
              <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full bg-[#003366] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#004080] transition text-center"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="block w-full border-2 border-[#003366] text-[#003366] py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition text-center"
              >
                Registrarse
              </Link>
              </div>
            </div>
          </div>

          {/* Card Personal */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center text-white text-2xl font-bold mr-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Acceso Personal</h3>
                  <p className="text-sm text-gray-500">Docentes y administradores</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Acceso para personal docente y administrativo encargado de gestionar y validar las actividades culturales.
              </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition text-center"
              >
                Iniciar Sesión
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
