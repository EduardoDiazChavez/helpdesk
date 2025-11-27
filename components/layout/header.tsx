"use client";
import { useEffect, useState } from "react";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/me");
        setIsAuthenticated(res.ok);
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setShowConfirm(false);
    router.replace("/login");
  };

  return (
    <div className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Helpdesk Clínica
              </h1>
              <p className="text-sm text-gray-500">
                Sistema de Gestión de Solicitudes
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <>
              <nav className="flex space-x-1">
                <Link href="/">
                  <p className="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Resumen
                  </p>
                </Link>
                <Link href="/NewRequest">
                  <p className="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Nueva Solicitud
                  </p>
                </Link>
                <Link href="/users">
                  <p className="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Usuarios
                  </p>
                </Link>
                <Link href="/admin">
                  <p className="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Admin
                  </p>
                </Link>
              </nav>
              <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </>
          )}
        </div>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Cerrar sesión</h2>
            <p className="text-sm text-gray-600">
              ¿Seguro que deseas salir de la plataforma?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
