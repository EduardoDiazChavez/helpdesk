import React from 'react';
import { Building, Monitor } from 'lucide-react';

const RequestSummaryCard = ({ request }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
    in_progress: { color: 'bg-blue-100 text-blue-800', label: 'En Progreso' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completado' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
  };

  const priorityConfig = {
    low: { color: 'text-green-600', label: 'Baja' },
    medium: { color: 'text-yellow-600', label: 'Media' },
    high: { color: 'text-orange-600', label: 'Alta' },
    urgent: { color: 'text-red-600', label: 'Urgente' }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[request.status].color}`}>
              {statusConfig[request.status].label}
            </span>
            <span className={`text-xs font-medium ${priorityConfig[request.priority].color}`}>
              {priorityConfig[request.priority].label}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">{request.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{request.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Por: {request.requestedBy}</span>
            <span>{request.department}</span>
            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          {request.type === 'maintenance' ? (
            <Building className="h-5 w-5 text-blue-600" />
          ) : (
            <Monitor className="h-5 w-5 text-green-600" />
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestSummaryCard;