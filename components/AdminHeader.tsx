import Link from 'next/link';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  showRanking?: boolean;
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  showAdminPanel?: boolean;
  onLogout: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  userName,
  showRanking = false,
  showBackButton = false,
  backHref = '/dashboard/admin',
  backText = 'Volver',
  showAdminPanel = false,
  onLogout
}: AdminHeaderProps) {
  return (
    <header className="bg-[#003366] text-white shadow-md border-b-4 border-[#FFB81C]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-gray-300 text-sm">{subtitle}</p>
          )}
          <p className="text-gray-300 text-sm">
            {userName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {showRanking && (
            <Link
              href="/dashboard/ranking"
              className="bg-[#FFB81C] text-[#003366] hover:bg-yellow-400 px-4 py-2 rounded-lg transition text-sm font-bold"
            >
              🏆 Ranking
            </Link>
          )}
          {showBackButton && (
            <Link
              href={backHref}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              {backText}
            </Link>
          )}
          {showAdminPanel && (
            <Link
              href="/dashboard/super-admin"
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              Panel Admin
            </Link>
          )}
          <button
            onClick={onLogout}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}
