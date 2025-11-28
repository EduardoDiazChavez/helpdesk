"use client";
import React, { useEffect, useState } from "react";
import { XCircle, Building, Monitor } from "lucide-react";
const NewRequestForm = ({
  onSubmit,
  onCancel,
  initialType = "maintenance",
}) => {
  const [formData, setFormData] = useState({
    type: initialType,
    title: "",
    description: "",
    priority: "Media - Afecta parcialmente",
    requestedBy: "",
    proceso: "",
    location: "",
    urgencyReason: "",
  });

  const [errors, setErrors] = useState({});
  const [processes, setProcesses] = useState([]);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [company, setCompany] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchProcesses = async (companyId) => {
      setLoadingProcesses(true);
      setLoadError("");
      try {
        const res = await fetch(`/api/companies/${companyId}/processes`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("No se pudieron cargar los procesos");
        const data = await res.json();
        const enabled = (data.processes || []).filter((p) => p.isEnabled);
        setProcesses(enabled);
        if (enabled.length > 0) {
          setFormData((prev) => ({ ...prev, proceso: String(enabled[0].processId) }));
        }
      } catch (err) {
        setLoadError((err).message);
      } finally {
        setLoadingProcesses(false);
      }
    };

    const fetchUserCompany = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("No se pudo obtener la empresa del usuario");
        const data = await res.json();
        const userCompany = data.companies?.[0];
        if (userCompany) {
          setCompany(userCompany);
          fetchProcesses(userCompany.id);
        } else {
          setLoadError("No tienes empresas asociadas.");
          setLoadingProcesses(false);
        }
      } catch (err) {
        setLoadError((err).message);
        setLoadingProcesses(false);
      }
    };

    fetchUserCompany();
  }, []);

  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "El asunto es requerido";
    if (!formData.description.trim())
      newErrors.description = "La descripción es requerida";
    if (!formData.proceso.trim()) newErrors.proceso = "El proceso es requerido";
    if (!formData.location.trim())
      newErrors.location = "La ubicación es requerida";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ ...formData, companySlug: company?.slug });
    setFormData({
      type: "maintenance",
      title: "",
      description: "",
      priority: "Media - Afecta parcialmente",
      requestedBy: "",
      proceso: "",
      location: "",
      urgencyReason: "",
    });
    setErrors({});
    onCancel();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Nueva Solicitud
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Tipo de solicitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Solicitud
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChange("type", "maintenance")}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.type === "maintenance"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Building className="h-6 w-6 mb-2" />
                <div className="font-medium">Mantenimiento</div>
                <div className="text-sm text-gray-600">
                  Infraestructura y instalaciones
                </div>
              </button>
              <button
                onClick={() => handleChange("type", "tech_support")}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.type === "tech_support"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Monitor className="h-6 w-6 mb-2" />
                <div className="font-medium">Soporte Técnico</div>
                <div className="text-sm text-gray-600">
                  Equipos y tecnología
                </div>
              </button>
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proceso *
              </label>
              <div className="space-y-2">
                <select
                  value={formData.proceso}
                  onChange={(e) => handleChange("proceso", e.target.value)}
                  disabled={loadingProcesses || processes.length === 0}
                  className={`h-10 w-full px-3 py-2 border rounded-lg focus:ring-0 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.proceso ? "border-red-300" : "border-gray-300"
                  } ${loadingProcesses ? "bg-gray-50 text-gray-500" : ""}`}
                >
                  <option value="">
                    {loadingProcesses
                      ? "Cargando procesos..."
                      : processes.length === 0
                      ? "Sin procesos disponibles"
                      : "Seleccionar proceso"}
                  </option>
                  {processes.map((proceso) => (
                    <option key={proceso.processId} value={proceso.processId}>
                      {proceso.process.code} - {proceso.process.name}
                    </option>
                  ))}
                </select>
                {loadError && (
                  <p className="text-xs text-red-500">{loadError}</p>
                )}
              </div>
              {errors.proceso && (
                <p className="text-red-500 text-xs mt-1">{errors.proceso}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Solicitud *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Resumen breve del problema"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500 ${
                errors.location ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Piso, sala, consultorio, etc."
            />
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción Detallada *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe el problema detalladamente..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Baja - No afecta operaciones">Baja - No afecta operaciones</option>
              <option value="Media - Afecta parcialmente">Media - Afecta parcialmente</option>
              <option value="Alta - Afecta operaciones importantes">
                Alta - Afecta operaciones importantes
              </option>
              <option value="Urgente - Afecta atención al paciente">
                Urgente - Afecta atención al paciente
              </option>
            </select>
          </div>

          {formData.priority === "urgent" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón de Urgencia
              </label>
              <textarea
                value={formData.urgencyReason}
                onChange={(e) => handleChange("urgencyReason", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explica por qué es urgente..."
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Enviar Solicitud
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRequestForm;
