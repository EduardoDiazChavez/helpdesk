"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Shield,
  User,
  MessageSquare,
  Loader2,
  NotebookText,
  Ban,
  PlayCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

const statusBadge = (name: string) => {
  if (name === "Resolved" || name === "Completed")
    return "bg-green-100 text-green-800 border border-green-200";
  if (name === "In Progress")
    return "bg-blue-100 text-blue-800 border border-blue-200";
  if (name === "Cancelled")
    return "bg-gray-100 text-gray-800 border border-gray-200";
  return "bg-yellow-100 text-yellow-800 border border-yellow-200";
};

const translateStatus = (name: string) => {
  if (name === "Resolved" || name === "Completed") return "Completada";
  if (name === "In Progress") return "En progreso";
  if (name === "Pending") return "Pendiente";
  if (name === "Cancelled") return "Cancelada";
  return name;
};

const translateLogText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/Pending/gi, "Pendiente")
    .replace(/In Progress/gi, "En progreso")
    .replace(/Resolved/gi, "Completada")
    .replace(/Completed/gi, "Completada")
    .replace(/Cancelled/gi, "Cancelada");
};

const priorityTone = (name: string) => {
  if (name?.startsWith("Urgente")) return "text-red-600";
  if (name?.startsWith("Alta")) return "text-orange-600";
  if (name?.startsWith("Media")) return "text-yellow-600";
  return "text-green-600";
};

const RequestDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    status: string;
    label: string;
  } | null>(null);
  const [comment, setComment] = useState("");
  const [pictures, setPictures] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; date: string } | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/requests/${params.id}`);
        if (!res.ok) throw new Error("No se pudo cargar la solicitud");
        const data = await res.json();
        setRequest(data);
        const picsRes = await fetch(`/api/requests/${params.id}/pictures`);
        if (picsRes.ok) {
          const pics = await picsRes.json();
          setPictures(pics);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/requests" className="text-blue-600 hover:text-blue-700">
            ← Volver a solicitudes
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-red-600">
            {error || "No se encontró la solicitud."}
          </p>
        </div>
      </div>
    );
  }

  const refresh = async () => {
    try {
      const res = await fetch(`/api/requests/${params.id}`);
      if (!res.ok) throw new Error("No se pudo cargar la solicitud");
      const data = await res.json();
      setRequest(data);
      const picsRes = await fetch(`/api/requests/${params.id}/pictures`);
      if (picsRes.ok) {
        const pics = await picsRes.json();
        setPictures(pics);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const updateStatus = async (statusName: string, note?: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusName, comment: note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo actualizar el estado");
      }
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const canUpload =
    request.status?.name !== "Completed" && request.status?.name !== "Cancelled";

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/requests/${params.id}/pictures`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo subir la imagen");
      }
      await refresh();
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canUpload) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDeletePicture = async (pic: any) => {
    if (!canUpload) return;
    const file = pic.pictureUrl?.split("/").pop();
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch(
        `/api/requests/${params.id}/pictures/${file}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar la imagen");
      }
      await refresh();
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const actions = () => {
    const status = request.status?.name;
    if (status === "Pending") {
      return (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              setConfirmAction({ status: "In Progress", label: "En progreso" })
            }
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Marcar en progreso</span>
          </button>
          <button
            onClick={() =>
              setConfirmAction({ status: "Cancelled", label: "Cancelar" })
            }
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50"
          >
            <Ban className="h-4 w-4" />
            <span>Cancelar solicitud</span>
          </button>
        </div>
      );
    }
    if (status === "In Progress") {
      return (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              setConfirmAction({ status: "Completed", label: "Completada" })
            }
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Marcar completada</span>
          </button>
          <button
            onClick={() =>
              setConfirmAction({ status: "Cancelled", label: "Cancelar" })
            }
            disabled={saving}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50"
          >
            <Ban className="h-4 w-4" />
            <span>Cancelar solicitud</span>
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </button>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(
              request.status?.name
            )}`}
          >
            {translateStatus(request.status?.name)}
          </span>
        </div>
        <span className={`text-sm font-semibold ${priorityTone(request.priority?.name)}`}>
          {request.priority?.name}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">
              #{request.id} • {request.requestType?.name} • {request.process?.name}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">
              {request.subject}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{request.description}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Solicitada el</p>
            <p className="font-semibold text-gray-800">
              {new Date(request.dateRequested).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <span className="p-2 bg-blue-50 border border-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </span>
            <div>
              <p className="text-xs text-gray-500">Solicitante</p>
              <p className="font-semibold text-gray-900">
                {request.requester?.name} {request.requester?.lastName}
              </p>
              <p className="text-xs text-gray-500">{request.requester?.email}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="p-2 bg-purple-50 border border-purple-100 rounded-lg">
              <NotebookText className="h-4 w-4 text-purple-600" />
            </span>
            <div>
              <p className="text-xs text-gray-500">Proceso</p>
              <p className="font-semibold text-gray-900">
                {request.process?.name} ({request.process?.code})
              </p>
              <p className="text-xs text-gray-500">
                {request.process?.description}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="p-2 bg-green-50 border border-green-100 rounded-lg">
              <MapPin className="h-4 w-4 text-green-600" />
            </span>
            <div>
              <p className="text-xs text-gray-500">Ubicación</p>
              <p className="font-semibold text-gray-900">{request.location}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
              <Shield className="h-4 w-4 text-yellow-600" />
            </span>
            <div>
              <p className="text-xs text-gray-500">Tipo de solicitud</p>
              <p className="font-semibold text-gray-900">
                {request.requestType?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <p className="text-sm font-semibold text-gray-900">
            Detalles de la solicitud
          </p>
        </div>
        {actions()}
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {request.description}
        </p>
      </div>


      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Imágenes</h2>
          {!canUpload && (
            <span className="text-xs text-gray-500">
              Solo se permiten cargas en estado pendiente/en progreso
            </span>
          )}
        </div>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`border-2 border-dashed rounded-lg p-4 text-center ${
            canUpload
              ? "border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer"
              : "border-gray-200 bg-gray-50 cursor-not-allowed"
          }`}
          onClick={() => {
            if (!canUpload) return;
            document.getElementById("picture-upload")?.click();
          }}
        >
          <input
            id="picture-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectFile}
            disabled={!canUpload}
          />
          <p className="text-sm text-gray-700">
            {canUpload
              ? "Haz clic o suelta una imagen aquí para subirla"
              : "Carga deshabilitada"}
          </p>
          {uploading && (
            <div className="mt-2 flex items-center justify-center text-blue-600 text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Subiendo imagen...
            </div>
          )}
          {uploadError && (
            <p className="text-xs text-red-500 mt-2">{uploadError}</p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {pictures.map((pic) => (
            <div
              key={pic.id}
              className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative group"
            >
              <img
                src={pic.pictureUrl}
                alt="request"
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() =>
                  setLightbox({
                    url: pic.pictureUrl,
                    date: new Date(pic.dateCreated).toLocaleString(),
                  })
                }
              />
              <p className="text-xs text-gray-500 px-2 py-1">
                {new Date(pic.dateCreated).toLocaleString()}
              </p>
              {canUpload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePicture(pic);
                  }}
                  className="absolute top-2 right-2 bg-white border border-red-200 rounded-full p-1 text-xs text-red-600 shadow hover:bg-red-50"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {pictures.length === 0 && (
            <p className="text-sm text-gray-500">No hay imágenes aún.</p>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden">
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 bg-white/90 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 shadow"
            >
              Cerrar
            </button>
            <img
              src={lightbox.url}
              alt="Vista ampliada"
              className="w-full max-h-[80vh] object-contain bg-black"
            />
            <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-200">
              {lightbox.date}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <NotebookText className="h-5 w-5 text-gray-600" />
          <p className="text-sm font-semibold text-gray-900">Historial</p>
        </div>
        {request.logs?.length === 0 && (
          <p className="text-sm text-gray-500">Sin actividad registrada.</p>
        )}
        <div className="space-y-3">
          {request.logs?.map((log: any) => (
            <div
              key={log.id}
              className="flex items-start justify-between border border-gray-100 rounded-lg p-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {log.user?.name} {log.user?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {translateLogText(log.actionDone)}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(log.logDate).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Confirmar cambio</h2>
            <p className="text-sm text-gray-600">
              ¿Seguro que deseas cambiar el estado a{" "}
              <span className="font-semibold">{confirmAction.label}</span>?
            </p>
            {(confirmAction.status === "Completed" ||
              confirmAction.status === "Cancelled") && (
              <div className="space-y-2">
                <label className="text-xs text-gray-600 font-medium">
                  Comentario *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe la razón o detalles del cambio"
                  required
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const status = confirmAction.status;
                  const note = comment;
                  setConfirmAction(null);
                  setComment("");
                  updateStatus(status, note);
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetailPage;
