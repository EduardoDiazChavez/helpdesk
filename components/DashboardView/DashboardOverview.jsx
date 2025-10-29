import React, { useState, useEffect } from "react";
import { Building, Monitor } from "lucide-react";
import QuickActionCard from "./SubComponents/QuickActionCard";
import RequestSummaryCard from "./SubComponents/RequestSummaryCard";
import { VistaEstadisticas } from "./SubComponents/VistaEstadisticas";
import Link from "next/link";

const DashboardOverview = ({ requests, setActiveView }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1000);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      <VistaEstadisticas stats={stats} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            title="Solicitud de Mantenimiento"
            description="Reportar problemas de infraestructura"
            icon={<Building className="h-8 w-8 text-blue-600" />}
            onClick={() => setActiveView("new-request")}
            href="/NewRequest?type=maintenance"
          />
          <QuickActionCard
            title="Soporte Técnico"
            description="Solicitar ayuda con equipos tecnológicos"
            icon={<Monitor className="h-8 w-8 text-green-600" />}
            onClick={() => setActiveView("new-request")}
            href="/NewRequest?type=tech_support"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Solicitudes Recientes
          </h2>
          <Link
            href="/History"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <p className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todas
            </p>
          </Link>
        </div>
        <div className={`space-y-3 overflow-y-auto ${isLargeScreen ? 'h-[500px]' : 'h-[300px]'}`}>
          {recentRequests.map((request) => (
            <RequestSummaryCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
