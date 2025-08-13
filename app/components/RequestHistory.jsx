import React, { useState } from 'react';
import { Search, Eye, FileText, User, Calendar, Building, Monitor } from 'lucide-react';
import RequestDetailModal from './RequestDetailModal';

const RequestHistory = ({ requests }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Solicitudes</h2>
        
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar solicitudes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="tech_support">Soporte Técnico</option>
          </select>
        </div>

        {/* Lista de solicitudes */}
        <div className="space-y-3">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[request.status].color}`}>
                      {statusConfig[request.status].label}
                    </span>
                    <span className={`text-xs font-medium ${priorityConfig[request.priority].color}`}>
                      {priorityConfig[request.priority].label}
                    </span>
                    <span className="text-xs text-gray-500">
                      #{request.id}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{request.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{request.requestedBy}</span>
                    </span>
                    <span>{request.department}</span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="flex-shrink-0">
                    {request.type === 'maintenance' ? (
                      <Building className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Monitor className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron solicitudes que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          statusConfig={statusConfig}
          priorityConfig={priorityConfig}
        />
      )}
    </div>
  );
};

export default RequestHistory;