import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Building,
  Monitor,
  FileText
} from 'lucide-react';
import QuickActionCard from './SubComponents/QuickActionCard';
import RequestSummaryCard from './SubComponents/RequestSummaryCard';

const DashboardOverview = ({ requests, setActiveView }) => {
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Estadísticas - Vista compacta en grilla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Solicitudes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-xl font-bold text-blue-700">{stats.total}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
              <p className="text-xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">En Progreso</p>
              <p className="text-xl font-bold text-orange-700">{stats.inProgress}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Completadas</p>
              <p className="text-xl font-bold text-green-700">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard
            title="Solicitud de Mantenimiento"
            description="Reportar problemas de infraestructura"
            icon={<Building className="h-8 w-8 text-blue-600" />}
            onClick={() => setActiveView('new-request')}
          />
          <QuickActionCard
            title="Soporte Técnico"
            description="Solicitar ayuda con equipos tecnológicos"
            icon={<Monitor className="h-8 w-8 text-green-600" />}
            onClick={() => setActiveView('new-request')}
          />
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h2>
          <button
            onClick={() => setActiveView('history')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver todas
          </button>
        </div>
        <div className="space-y-3">
          {recentRequests.map(request => (
            <RequestSummaryCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;