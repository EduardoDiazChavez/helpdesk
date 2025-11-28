"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Workflow, ListChecks } from "lucide-react";

type Process = {
  id: number;
  code: string;
  name: string;
  description: string;
  _count?: { requests: number };
};

const adminHeaders = {
  "Content-Type": "application/json",
  "x-user-role": "Systems Administrator",
};

const ProcessesPage = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    description: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/processes", { headers: adminHeaders });
      if (!res.ok) throw new Error("No se pudieron cargar los procesos");
      const data = (await res.json()) as Process[];
      setProcesses(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ code: "", name: "", description: "" });
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/processes", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("No se pudo crear el proceso");
      await load();
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (process: Process) => {
    setEditingId(process.id);
    setEditForm({
      code: process.code,
      name: process.name,
      description: process.description,
    });
  };

  const handleUpdate = async (processId: number) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/processes/${processId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el proceso");
      setEditingId(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (processId: number) => {
    if (!confirm("¿Eliminar este proceso? Esta acción es permanente.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/processes/${processId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
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

  const totalRequests = useMemo(
    () => processes.reduce((acc, p) => acc + (p._count?.requests ?? 0), 0),
    [processes]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Procesos</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Catálogo de procesos
          </h1>
          <p className="text-sm text-gray-600">
            Crea, edita o elimina procesos que se usan al registrar solicitudes.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
            <Workflow className="h-5 w-5" />
            <span>{processes.length} procesos</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100">
            <ListChecks className="h-5 w-5" />
            <span>{totalRequests} solicitudes asociadas</span>
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
                  Nuevo proceso
                </p>
                <p className="text-xs text-gray-600">
                  Define el código y la descripción que verán los usuarios.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                    value={form.code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, code: e.target.value }))
                    }
                    required
                    placeholder="DI"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    placeholder="Dirección"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                  required
                  placeholder="Detalle qué incluye este proceso"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{saving ? "Guardando..." : "Crear proceso"}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Procesos registrados
                </p>
                <p className="text-xs text-gray-600">
                  Consulta, edita o elimina procesos activos.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {processes.map((process) => (
                  <div
                    key={process.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      {editingId === process.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-3 items-end">
                            <input
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                              value={editForm.code}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  code: e.target.value,
                                }))
                              }
                            />
                            <input
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 col-span-2"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            rows={3}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3">
                            <span className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                              {process.code}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {process.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {process.description}
                              </p>
                              <p className="text-xs text-blue-600">
                                {process._count?.requests ?? 0} solicitudes
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingId === process.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(process.id)}
                            disabled={saving}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(process)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 inline-flex items-center space-x-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(process.id)}
                            className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 inline-flex items-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {processes.length === 0 && (
                  <div className="p-6 text-sm text-gray-600">
                    No hay procesos registrados todavía.
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

export default ProcessesPage;
