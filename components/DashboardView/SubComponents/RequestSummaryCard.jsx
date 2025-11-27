import React from "react";
import { Building, Monitor } from "lucide-react";
import Link from "next/link";

const RequestSummaryCard = ({ request }) => {
  const statusName = request.status?.name || "Pending";
  const priorityName = request.priority?.name || "";

  const statusConfig = {
    Pending: { color: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
    "In Progress": { color: "bg-blue-100 text-blue-800", label: "En progreso" },
    Completed: { color: "bg-green-100 text-green-800", label: "Completada" },
    Cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelada" },
  };

  const priorityTone = () => {
    if (priorityName.startsWith("Urgente")) return "text-red-600";
    if (priorityName.startsWith("Alta")) return "text-orange-600";
    if (priorityName.startsWith("Media")) return "text-yellow-600";
    return "text-green-600";
  };

  const icon =
    request.requestType?.name === "Mantenimiento" ? (
      <Building className="h-5 w-5 text-blue-600" />
    ) : (
      <Monitor className="h-5 w-5 text-green-600" />
    );

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusConfig[statusName]?.color ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {statusConfig[statusName]?.label || statusName}
            </span>
            <span className={`text-xs font-medium ${priorityTone()}`}>
              {priorityName}
            </span>
          </div>
          <Link href={`/requests/${request.id}`}>
            <h4 className="font-medium text-gray-900 mb-1 hover:text-blue-700">
              {request.subject}
            </h4>
          </Link>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {request.description}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>
              Por: {request.requester?.name} {request.requester?.lastName}
            </span>
            <span>{request.company?.name}</span>
            <span>{new Date(request.dateRequested).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">{icon}</div>
      </div>
    </div>
  );
};

export default RequestSummaryCard;
