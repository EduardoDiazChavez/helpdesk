"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Loader2, RefreshCw, Search } from "lucide-react";

type RequestItem = {
  id: number;
  subject: string;
  description: string;
  location: string;
  dateRequested: string;
  requestType: { id: number; name: string };
  process: { id: string; name: string };
  priority: { id: number; name: string; number: number };
  status: { id: number; name: string };
  requester: { id: number; name: string; lastName: string; email: string };
  company: { id: number; name: string; slug: string };
};

type Me = {
  id: number;
  role: string;
  companies: { id: number; name: string; slug: string; isAdmin: boolean }[];
};

const RequestsPage = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([]);
  const [companies, setCompanies] = useState<
    { id: number; name: string; slug: string }[]
  >([]);
  const [users, setUsers] = useState<{ id: number; email: string }[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSysAdmin = me?.role === "Systems Administrator";
  const isCompanyAdmin = me?.role === "Company Administrator";

  const loadMe = async () => {
    const res = await fetch("/api/me");
    if (res.ok) {
      const data = await res.json();
      setMe(data);
      if (data.role !== "Systems Administrator") {
        setCompanyFilter(data.companies?.[0]?.slug || "");
      }
    }
  };

  const loadStatuses = async () => {
    const res = await fetch("/api/request-status");
    if (res.ok) {
      setStatuses(await res.json());
    }
  };

  const loadCompanies = async () => {
    if (!isSysAdmin) return;
    const res = await fetch("/api/companies");
    if (res.ok) {
      const data = await res.json();
      setCompanies(data.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })));
    }
  };

  const loadUsers = async () => {
    if (!isSysAdmin) return;
    const res = await fetch("/api/users?page=1&pageSize=200");
    if (res.ok) {
      const data = await res.json();
      setUsers(
        (data.data || []).map((u: any) => ({ id: u.id, email: u.email }))
      );
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (isSysAdmin && companyFilter) params.set("company", companyFilter);
      if (isSysAdmin && userFilter) params.set("userId", userFilter);
      const res = await fetch(`/api/requests?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudieron cargar las solicitudes");
      const data = await res.json();
      let filtered = data as RequestItem[];
      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.subject.toLowerCase().includes(term) ||
            r.description.toLowerCase().includes(term)
        );
      }
      setRequests(filtered);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    loadStatuses();
  }, []);

  useEffect(() => {
    loadCompanies();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.role]);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, companyFilter, userFilter]);

  const priorityTone = (name: string) => {
    if (name.startsWith("Urgente")) return "text-red-600";
    if (name.startsWith("Alta")) return "text-orange-600";
    if (name.startsWith("Media")) return "text-yellow-600";
    return "text-green-600";
  };

  const statusBadge = (name: string) => {
    if (name === "Resolved" || name === "Completed")
      return "bg-green-100 text-green-800 border border-green-200";
    if (name === "In Progress")
      return "bg-blue-100 text-blue-800 border border-blue-200";
    if (name === "Cancelled")
      return "bg-gray-100 text-gray-800 border border-gray-200";
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  };

  const visibleCompanyName = useMemo(() => {
    if (isSysAdmin && companyFilter) {
      return companies.find((c) => c.slug === companyFilter)?.name || "Todas";
    }
    if (isCompanyAdmin) {
      return me?.companies?.[0]?.name || "Mi empresa";
    }
    return "Mis solicitudes";
  }, [companyFilter, companies, isCompanyAdmin, isSysAdmin, me]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Solicitudes</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Seguimiento de solicitudes
          </h1>
          <p className="text-sm text-gray-600">
            {visibleCompanyName}
          </p>
        </div>
        <Link
          href="/NewRequest"
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nueva solicitud
        </Link>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadRequests();
              }}
              className="flex-1 flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar por asunto o descripción"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                Buscar
              </button>
            </form>
            <button
              onClick={loadRequests}
              className="inline-flex items-center space-x-2 text-sm text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {isSysAdmin && (
              <>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las empresas</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los usuarios</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              </>
            )}
            {isCompanyAdmin && !isSysAdmin && me?.companies?.length ? (
              <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                {me.companies[0].name}
              </span>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => (
              <Link
                href={`/requests/${req.id}`}
                key={req.id}
                className="block hover:bg-gray-50"
              >
                <div className="px-6 py-4 grid gap-3 md:grid-cols-[2fr,1fr]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(
                          req.status.name
                        )}`}
                      >
                        {req.status.name}
                      </span>
                      <span
                        className={`text-xs font-medium ${priorityTone(
                          req.priority.name
                        )}`}
                      >
                        {req.priority.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(req.dateRequested).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-gray-900 font-semibold">{req.subject}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {req.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="px-2 py-1 rounded-full bg-gray-100">
                        {req.requestType.name}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">
                        {req.process.name}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100">
                        {req.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Solicitante</span>
                      <span className="font-medium">
                        {req.requester.name} {req.requester.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Empresa</span>
                      <span className="font-medium">{req.company.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {requests.length === 0 && (
              <div className="p-6 text-sm text-gray-500">
                No hay solicitudes para mostrar.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
