"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Tags } from "lucide-react";

type RequestType = {
  id: number;
  name: string;
  code: string;
  _count?: { requests: number };
};

const adminHeaders = {
  "Content-Type": "application/json",
  "x-user-role": "Systems Administrator",
};

const RequestTypesPage = () => {
  const [types, setTypes] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/request-types", { headers: adminHeaders });
      if (!res.ok) throw new Error("No se pudieron cargar los tipos de solicitud");
      const data = (await res.json()) as RequestType[];
      setTypes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/request-types", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({ name, code }),
      });
      if (!res.ok) throw new Error("No se pudo crear el tipo");
      setName("");
      setCode("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (type: RequestType) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditCode(type.code);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim() || !editCode.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/request-types/${id}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({ name: editName, code: editCode }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el tipo");
      setEditingId(null);
      setEditName("");
      setEditCode("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: RequestType) => {
    if (!confirm("¿Eliminar este tipo de solicitud?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/request-types/${type.id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar el tipo");
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
        <div>
          <p className="text-sm font-semibold text-blue-600">Tipos de solicitud</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Catálogo de Request Types
          </h1>
          <p className="text-sm text-gray-600">
            Define los tipos de solicitud disponibles para los usuarios.
          </p>
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
                  Nuevo tipo
                </p>
                <p className="text-xs text-gray-600">
                  Agrega un tipo de solicitud para clasificar tickets.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Mantenimiento"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="MT"
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
                <span>{saving ? "Guardando..." : "Crear tipo"}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Tipos registrados
                </p>
                <p className="text-xs text-gray-600">
                  Edita o elimina tipos que no tengan solicitudes asociadas.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {types.map((type) => (
                  <div
                    key={type.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex-1">
                      {editingId === type.id ? (
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                            <Tags className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {type.name}
                            </p>
                            <p className="text-sm text-gray-600">Código: {type.code}</p>
                            <p className="text-xs text-blue-600">
                              {type._count?.requests ?? 0} solicitudes
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingId === type.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(type.id)}
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
                            onClick={() => startEdit(type)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 inline-flex items-center space-x-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(type)}
                            disabled={saving || (type._count?.requests ?? 0) > 0}
                            className={`px-3 py-2 text-sm border rounded-lg inline-flex items-center space-x-1 ${
                              (type._count?.requests ?? 0) > 0
                                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {types.length === 0 && (
                  <div className="p-6 text-sm text-gray-600">
                    No hay tipos registrados.
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

export default RequestTypesPage;
