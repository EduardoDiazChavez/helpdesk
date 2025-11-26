"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, Loader2, Plus, Trash2, Pencil } from "lucide-react";

type Role = {
  id: number;
  name: string;
};

type CompanyOption = {
  id: number;
  name: string;
  slug: string;
};

type UserRow = {
  id: number;
  email: string;
  name: string;
  lastName: string;
  role: Role;
  userCompanies: {
    company: CompanyOption;
    isAdmin: boolean;
  }[];
};

const adminHeaders = {
  "Content-Type": "application/json",
  "x-user-role": "Systems Administrator",
};

const PAGE_SIZE = 10;

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    name: "",
    lastName: "",
    password: "",
    roleName: "Regular User",
    companySlug: "",
    isCompanyAdmin: false,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    name: "",
    lastName: "",
    password: "",
    roleName: "",
    companySlug: "",
    isCompanyAdmin: false,
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (companyFilter) params.set("company", companyFilter);

      const res = await fetch(`/api/users?${params.toString()}`, {
        headers: adminHeaders,
      });
      if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
      const data = await res.json();
      setUsers(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    const [rolesRes, companiesRes] = await Promise.all([
      fetch("/api/roles", { headers: adminHeaders }).catch(() => null),
      fetch("/api/companies", { headers: adminHeaders }).catch(() => null),
    ]);

    if (rolesRes?.ok) {
      const data = await rolesRes.json();
      setRoles(data);
    }
    if (companiesRes?.ok) {
      const data = await companiesRes.json();
      setCompanies(
        data.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
      );
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, companyFilter]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    loadUsers();
  };

  const resetForm = () => {
    setForm({
      email: "",
      name: "",
      lastName: "",
      password: "",
      roleName: "Regular User",
      companySlug: "",
      isCompanyAdmin: false,
    });
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("No se pudo crear el usuario");
      resetForm();
      setPage(1);
      await loadUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user: UserRow) => {
    const companySlug = user.userCompanies[0]?.company?.slug || "";
    const isAdmin = user.userCompanies[0]?.isAdmin || false;
    setEditingId(user.id);
    setEditForm({
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      password: "",
      roleName: user.role?.name || "Regular User",
      companySlug,
      isCompanyAdmin: isAdmin,
    });
  };

  const handleUpdate = async (userId: number) => {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...editForm };
      if (!payload.password) {
        delete (payload as any).password;
      }
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el usuario");
      setEditingId(null);
      await loadUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (!res.ok) throw new Error("No se pudo eliminar el usuario");
      await loadUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const pagination = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Usuarios</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestión de usuarios
          </h1>
          <p className="text-sm text-gray-600">
            Filtra por empresa o rol, crea nuevos accesos y administra cuentas.
          </p>
        </div>
        <Link
          href="/companies"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Volver a empresas
        </Link>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Nuevo usuario
              </p>
              <p className="text-xs text-gray-600">
                Crea un acceso y asigna rol y empresa.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apellido"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
              />
            </div>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@empresa.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Rol
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.roleName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, roleName: e.target.value }))
                  }
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Empresa (opcional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.companySlug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      companySlug: e.target.value,
                    }))
                  }
                >
                  <option value="">Sin empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {form.companySlug && (
              <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isCompanyAdmin}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isCompanyAdmin: e.target.checked,
                    }))
                  }
                />
                <span>Marcar como admin de la empresa</span>
              </label>
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
              <span>{saving ? "Guardando..." : "Crear usuario"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <form
                onSubmit={handleSearch}
                className="flex-1 flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar por nombre, apellido o correo"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Buscar
                </button>
              </form>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <select
                  value={companyFilter}
                  onChange={(e) => {
                    setCompanyFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex-1">
                      {editingId === user.id ? (
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
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.lastName}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="password"
                            placeholder="Nueva contraseña (opcional)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.password}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                password: e.target.value,
                              }))
                            }
                          />
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.roleName}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                roleName: e.target.value,
                              }))
                            }
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editForm.companySlug}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                companySlug: e.target.value,
                              }))
                            }
                          >
                            <option value="">Sin empresa</option>
                            {companies.map((c) => (
                              <option key={c.id} value={c.slug}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {editForm.companySlug && (
                            <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={editForm.isCompanyAdmin}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    isCompanyAdmin: e.target.checked,
                                  }))
                                }
                              />
                              <span>Admin de empresa</span>
                            </label>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">
                            {user.name} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              {user.role?.name}
                            </span>
                            {user.userCompanies.length === 0 ? (
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                Sin empresa
                              </span>
                            ) : (
                              user.userCompanies.map((uc) => (
                                <span
                                  key={uc.company.id}
                                  className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100"
                                >
                                  {uc.company.name}{" "}
                                  {uc.isAdmin ? "(Admin)" : ""}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(user.id)}
                            disabled={saving}
                            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center space-x-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Guardar</span>
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
                            onClick={() => startEdit(user)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 inline-flex items-center space-x-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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

                {users.length === 0 && (
                  <div className="p-6 text-sm text-gray-500">
                    No hay usuarios para mostrar.
                  </div>
                )}
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
              {pagination.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    page === p
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
