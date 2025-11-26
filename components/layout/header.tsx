import { Settings } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
    return (
        <div className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Helpdesk Clínica</h1>
                            <p className="text-sm text-gray-500">Sistema de Gestión de Solicitudes</p>
                        </div>
                    </div>
                    <nav className="flex space-x-1">
                        <Link href="/">
                            <p
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors `}
                            >
                                Resumen
                            </p>
                        </Link>
                        <Link href="/NewRequest">
                            <p
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors `}
                            >
                                Nueva Solicitud
                            </p>
                        </Link>
                        <Link href="/History">
                        <p
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors `}
                        >
                            Historial
                        </p>
                        </Link>
                        <Link href="/companies">
                            <p
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors `}
                            >
                                Empresas
                            </p>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}
