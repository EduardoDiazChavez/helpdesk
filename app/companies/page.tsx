"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2, Plus, Trash2, Users } from "lucide-react";

type CompanyUser = {
  id: number;
  email: string;
  name: string;
  lastName: string;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  address: string;
  userCompanies: {
    isAdmin: boolean;
    user: CompanyUser;
  }[];
};

const adminHeaders = {
  "Content-Type": "application/json",
  "x-user-role": "Systems Administrator",
};

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    includeUser: true,
    userEmail: "",
    userName: "",
    userLastName: "",
    userPassword: "",
    isAdmin: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "" });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/companies", {
        headers: adminHeaders,
      });
      if (!res.ok) throw new Error("No se pudieron cargar las empresas");
      const data = (await res.json()) as Company[];
      setCompanies(data);
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
    setForm({
      name: "",
      address: "",
      includeUser: true,
      userEmail: "",
      userName: "",
      userLastName: "",
      userPassword: "",
      isAdmin: true,
    });
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: any = {
        name: form.name,
        address: form.address,
      };

      if (form.includeUser) {
        body.user = {
          email: form.userEmail,
          name: form.userName,
          lastName: form.userLastName,
          password: form.userPassword,
          isAdmin: form.isAdmin,
        };
      }

      const res = await fetch("/api/companies", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("No se pudo crear la empresa");
      await load();
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setEditForm({ name: company.name, address: company.address });
  };

  const handleUpdate = async (companyId: number) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("No se pudo actualizar la empresa");
      setEditingId(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (companyId: number) => {
    if (!confirm("¿Eliminar esta empresa? Esta acción es permanente.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (!res.ok) throw new Error("No se pudo eliminar la empresa");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const userCount = useMemo(
    () =>
      companies.reduce(
        (acc, company) => acc + (company.userCompanies?.length || 0),
        0
      ),
    [companies]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Empresas</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Administración de compañías
          </h1>
          <p className="text-sm text-gray-600">
            Solo los administradores del sistema pueden crear, editar o eliminar
            empresas y asignar usuarios iniciales.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
            <Building2 className="h-5 w-5" />
            <span>{companies.length} empresas</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100">
            <Users className="h-5 w-5" />
            <span>{userCount} usuarios</span>
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
                  Nueva empresa
                </p>
                <p className="text-xs text-gray-600">
                  Crea la compañía y su usuario inicial.
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
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Ej. Clínica Norte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  required
                  placeholder="Av. Salud 123"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="includeUser"
                  type="checkbox"
                  checked={form.includeUser}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, includeUser: e.target.checked }))
                  }
                />
                <label htmlFor="includeUser" className="text-sm text-gray-700">
                  Crear usuario administrador para esta empresa
                </label>
              </div>

              {form.includeUser && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={form.userName}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, userName: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={form.userLastName}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, userLastName: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.userEmail}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, userEmail: e.target.value }))
                      }
                      required
                      placeholder="admin@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña temporal
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={form.userPassword}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, userPassword: e.target.value }))
                      }
                      required
                      placeholder="Genera una clave inicial"
                    />
                  </div>
                </div>
              )}

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
                <span>{saving ? "Guardando..." : "Crear empresa"}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Empresas registradas
                </p>
                <p className="text-xs text-gray-600">
                  Consulta y administra las compañías activas.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      {editingId === company.id ? (
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.address}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            rows={2}
                          />
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              window.open(
                                `/users?company=${company.slug}`,
                                "_self"
                              )
                            }
                            className="text-left flex items-center space-x-3 hover:opacity-90"
                          >
                            <span className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                              {company.name.slice(0, 1).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {company.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {company.address}
                              </p>
                              <p className="text-xs text-blue-600">
                                Ver usuarios de la empresa →
                              </p>
                            </div>
                          </button>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {company.userCompanies.length === 0 ? (
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                Sin usuarios
                              </span>
                            ) : (
                              company.userCompanies.map(({ user, isAdmin }) => (
                                <span
                                  key={user.id}
                                  className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {user.email} {isAdmin ? "(Admin)" : ""}
                                </span>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingId === company.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(company.id)}
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
                            onClick={() => startEdit(company)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
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

                {companies.length === 0 && (
                  <div className="p-6 text-sm text-gray-500">
                    Aún no hay empresas registradas.
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

export default CompaniesPage;
