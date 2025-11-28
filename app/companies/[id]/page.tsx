"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Plus,
  Power,
  Trash2,
  Workflow,
} from "lucide-react";

type CompanyLink = {
  id: number;
  processId: number;
  companyId: number;
  isEnabled: boolean;
  requestCount: number;
  process: {
    id: number;
    code: string;
    name: string;
    description: string;
  };
};

type CompanyInfo = {
  id: number;
  name: string;
  slug: string;
  address: string;
};

type ProcessOption = {
  id: number;
  code: string;
  name: string;
};

const adminHeaders = {
  "Content-Type": "application/json",
  "x-user-role": "Systems Administrator",
};

const CompanyProcessesPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const companyId = Number(params?.id);

  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [links, setLinks] = useState<CompanyLink[]>([]);
  const [allProcesses, setAllProcesses] = useState<ProcessOption[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (Number.isNaN(companyId)) {
      setError("ID de empresa inválido");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detailRes, processesRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/processes`, { headers: adminHeaders }),
        fetch("/api/processes", { headers: adminHeaders }),
      ]);
      if (!detailRes.ok) throw new Error("No se pudo cargar la empresa");
      if (!processesRes.ok) throw new Error("No se pudo cargar los procesos");

      const detail = (await detailRes.json()) as {
        company: CompanyInfo;
        processes: CompanyLink[];
      };
      const processes = (await processesRes.json()) as ProcessOption[];

      setCompany(detail.company);
      setLinks(detail.processes);
      setAllProcesses(processes);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const availableProcesses = useMemo(
    () =>
      allProcesses.filter(
        (p) => !links.find((link) => link.processId === p.id)
      ),
    [allProcesses, links]
  );

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProcessId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/processes`, {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ processId: Number(selectedProcessId) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo agregar el proceso");
      }
      setSelectedProcessId("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (link: CompanyLink, nextState: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/companies/${companyId}/processes/${link.processId}`,
        {
          method: "PATCH",
          headers: adminHeaders,
          body: JSON.stringify({ isEnabled: nextState }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo actualizar el proceso");
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (link: CompanyLink) => {
    if (!confirm("¿Eliminar este proceso de la empresa?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/companies/${companyId}/processes/${link.processId}`,
        {
          method: "DELETE",
          headers: adminHeaders,
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar el proceso");
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/companies")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </button>
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600">Empresa</p>
            <h1 className="text-2xl font-semibold text-gray-900">
              {company?.name || "Empresa"}
            </h1>
            <p className="text-sm text-gray-600">{company?.address}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Agregar proceso
                </p>
                <p className="text-xs text-gray-600">
                  Vincula procesos existentes a esta empresa.
                </p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecciona un proceso
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedProcessId}
                  onChange={(e) => setSelectedProcessId(e.target.value)}
                  required
                >
                  <option value="">Selecciona...</option>
                  {availableProcesses.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={saving || !selectedProcessId}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{saving ? "Guardando..." : "Agregar proceso"}</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <Workflow className="h-4 w-4 text-purple-600" />
              <span>
                {links.length} procesos vinculados •{" "}
                {links.reduce((acc, l) => acc + l.requestCount, 0)} solicitudes
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Solo administradores del sistema pueden editar este catálogo.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Procesos de la empresa
                </p>
                <p className="text-xs text-gray-600">
                  Habilita, deshabilita o elimina procesos. No puedes deshabilitar ni
                  eliminar si tienen solicitudes asociadas.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                          {link.process.code}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {link.process.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {link.process.description}
                          </p>
                          <p className="text-xs text-blue-600">
                            {link.requestCount} solicitudes •{" "}
                            {link.isEnabled ? "Habilitado" : "Deshabilitado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleEnabled(link, !link.isEnabled)}
                        disabled={saving || (!link.isEnabled && link.requestCount > 0)}
                        className={`px-3 py-2 text-sm rounded-lg border inline-flex items-center space-x-1 ${
                          link.isEnabled
                            ? "border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                            : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
                        } ${saving ? "opacity-70" : ""}`}
                      >
                        <Power className="h-4 w-4" />
                        <span>{link.isEnabled ? "Deshabilitar" : "Habilitar"}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(link)}
                        disabled={saving || link.requestCount > 0}
                        className={`px-3 py-2 text-sm border rounded-lg inline-flex items-center space-x-1 ${
                          link.requestCount > 0
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-red-200 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="p-6 text-sm text-gray-600">
                    Esta empresa no tiene procesos asignados.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProcessesPage;
