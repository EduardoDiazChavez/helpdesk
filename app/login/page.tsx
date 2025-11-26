"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

const LoginContent = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const redirect = searchParams.get("redirect") || "/";

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo iniciar sesión");
        }
        router.replace(redirect);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => setIsSubmitting(false));
  };

  const updateField = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center px-4 py-12">
      <div className="max-w-5xl w-full mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Acceso seguro</span>
            </span>
            <h1 className="text-3xl font-semibold text-gray-900 mt-4">
              Bienvenido de nuevo
            </h1>
            <p className="text-gray-600 mt-2">
              Ingresa para gestionar solicitudes, revisar estados y apoyar a los
              equipos de la clínica con rapidez.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Consolida tus tickets
                  </p>
                  <p className="text-sm text-gray-600">
                    Reúne todos los reportes en un solo panel y prioriza lo más
                    urgente.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 font-semibold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Monitorea el progreso
                  </p>
                  <p className="text-sm text-gray-600">
                    Visualiza el avance de cada solicitud y comunica resultados
                    al instante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-2 mb-6">
            <p className="text-sm font-semibold text-blue-600">
              Inicio de sesión
            </p>
            <h2 className="text-2xl font-semibold text-gray-900">
              Accede a tu cuenta
            </h2>
            <p className="text-sm text-gray-600">
              Usa tu correo institucional o continúa con Google.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@clinica.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  href="/login/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Validando..." : "Ingresar"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400">
                O continuar con
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-semibold text-gray-800">
              G
            </span>
            <span className="text-sm font-medium text-gray-700">
              Continuar con Google
            </span>
          </button>

          <p className="text-xs text-gray-500 mt-6">
            Al continuar aceptas las políticas de uso de la plataforma de
            soporte de la clínica. La autenticación con Google se configurará
            con las llaves proporcionadas.
          </p>
        </div>
      </div>
    </div>
  );
};

const Login = () => (
  <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
    <LoginContent />
  </Suspense>
);

export default Login;
