import React, { useState, useEffect } from "react";
import { Building, Monitor, Loader2 } from "lucide-react";
import QuickActionCard from "./SubComponents/QuickActionCard";
import RequestSummaryCard from "./SubComponents/RequestSummaryCard";
import { VistaEstadisticas } from "./SubComponents/VistaEstadisticas";
import Link from "next/link";

const DashboardOverview = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 1000);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/requests");
        if (!res.ok) throw new Error("No se pudieron cargar solicitudes");
        const data = await res.json();
        setRequests(data);
      } catch (e) {
        console.error(e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status?.name === "Pending").length,
    inProgress: requests.filter((r) => r.status?.name === "In Progress").length,
    completed: requests.filter(
      (r) => r.status?.name === "Resolved" || r.status?.name === "Completed"
    ).length,
  };

  const recentRequests = [...requests].sort(
    (a, b) =>
      new Date(b.dateRequested).getTime() -
      new Date(a.dateRequested).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <VistaEstadisticas stats={stats} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Solicitud de Mantenimiento"
            description="Reportar problemas de infraestructura"
            icon={<Building className="h-8 w-8 text-blue-600" />}
            href="/NewRequest?type=maintenance"
          />
          <QuickActionCard
            title="Soporte Técnico"
            description="Solicitar ayuda con equipos tecnológicos"
            icon={<Monitor className="h-8 w-8 text-green-600" />}
            href="/NewRequest?type=tech_support"
          />
          <QuickActionCard
            title="Ver solicitudes"
            description="Consulta el estado de tus solicitudes"
            icon={<Monitor className="h-8 w-8 text-purple-600" />}
            href="/requests"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Solicitudes Recientes
          </h2>
          <Link
            href="/requests"
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
