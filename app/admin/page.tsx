"use client";

import Link from "next/link";
import { Building2, Settings2, Users, Workflow, Gauge, Link2 } from "lucide-react";

const actions = [
  {
    title: "Usuarios",
    description: "Gestiona cuentas y permisos",
    href: "/users",
    icon: <Users className="h-8 w-8 text-blue-600" />,
  },
  {
    title: "Empresas",
    description: "Administra compañías y accesos",
    href: "/companies",
    icon: <Building2 className="h-8 w-8 text-green-600" />,
  },
  {
    title: "Procesos",
    description: "Catálogo de procesos (próximamente)",
    href: "#",
    icon: <Workflow className="h-8 w-8 text-purple-600" />,
    disabled: true,
  },
  {
    title: "Tipos de solicitud",
    description: "Define Request Types (próximamente)",
    href: "#",
    icon: <Settings2 className="h-8 w-8 text-orange-600" />,
    disabled: true,
  },
  {
    title: "Prioridades",
    description: "Configura prioridades (próximamente)",
    href: "#",
    icon: <Gauge className="h-8 w-8 text-red-600" />,
    disabled: true,
  },
  {
    title: "Vincular procesos a empresas",
    description: "Asignaciones (próximamente)",
    href: "#",
    icon: <Link2 className="h-8 w-8 text-gray-600" />,
    disabled: true,
  },
];

const AdminPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Administración</p>
        <h1 className="text-2xl font-semibold text-gray-900">Panel de control</h1>
        <p className="text-sm text-gray-600">
          Accesos rápidos para gestionar usuarios, empresas y configuraciones clave.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.disabled ? "#" : action.href}
              className={`border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors ${
                action.disabled ? "opacity-60 cursor-not-allowed" : ""
              }`}
              aria-disabled={action.disabled}
            >
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
