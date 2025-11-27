import { Clock, CheckCircle, AlertCircle, FileText } from "lucide-react";
export const VistaEstadisticas = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen de Solicitudes
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-purple-600 font-medium">Total</p>
            <p className="text-xl font-bold text-purple-700">{stats?.total}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
            <p className="text-xl font-bold text-yellow-700">
              {stats?.pending}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-600 font-medium">En Progreso</p>
            <p className="text-xl font-bold text-blue-700">
              {stats?.inProgress}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-green-600 font-medium">Completadas</p>
            <p className="text-xl font-bold text-green-700">
              {stats?.completed}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
