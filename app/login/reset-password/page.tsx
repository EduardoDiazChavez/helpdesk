"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setSuccess(false);
      return;
    }
    setError("");
    setSuccess(true);
  };

  const updateField = (
    field: "code" | "password" | "confirmPassword",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center px-4 py-12">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="flex items-start space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-600">
                Cambio de contraseña
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">
                Crea una nueva clave
              </h1>
              <p className="text-sm text-gray-600">
                Usa el código del correo de recuperación y define una contraseña
                segura para continuar.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de verificación
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(event) => updateField("code", event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: 482913"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-semibold text-gray-900 mb-1">
                  Recomendaciones
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Usa mayúsculas, minúsculas y números.</li>
                  <li>Evita datos personales evidentes.</li>
                  <li>No reutilices contraseñas previas.</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800">
                <p className="font-semibold mb-1">Tiempo limitado</p>
                <p>
                  Este enlace vence pronto. Completa el cambio antes de que
                  expire para mantener tu cuenta segura.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700 inline-flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Contraseña actualizada. Puedes iniciar sesión con tu nueva
                  clave.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Guardar nueva contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
