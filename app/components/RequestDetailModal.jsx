import React from 'react';
import { XCircle } from 'lucide-react';

const RequestDetailModal = ({ request, onClose, statusConfig, priorityConfig }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{request.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[request.status].color}`}>
                  {statusConfig[request.status].label}
                </span>
                <span className={`text-sm font-medium ${priorityConfig[request.priority].color}`}>
                  {priorityConfig[request.priority].label}
                </span>
                <span className="text-sm text-gray-500">#{request.id}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
              <p className="text-gray-700">{request.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Información del Solicitante</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre:</span>
                    <span className="text-gray-900">{request.requestedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Departamento:</span>
                    <span className="text-gray-900">{request.department}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Detalles de la Solicitud</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="text-gray-900">
                      {request.type === 'maintenance' ? 'Mantenimiento' : 'Soporte Técnico'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Creado:</span>
                    <span className="text-gray-900">
                      {new Date(request.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Actualizado:</span>
                    <span className="text-gray-900">
                      {new Date(request.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;