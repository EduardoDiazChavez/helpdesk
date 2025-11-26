"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center px-4 py-12">
      <div className="max-w-xl w-full mx-auto space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-blue-600">
              Recuperación de acceso
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-sm text-gray-600">
              Ingresa tu correo institucional y te enviaremos un enlace para
              restablecer tu contraseña. Revisa bandeja de entrada y spam.
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
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@clinica.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center space-x-2"
            >
              <span>Enviar instrucciones</span>
              <Send className="h-4 w-4" />
            </button>
          </form>

          {sent && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
              Hemos enviado un correo a <span className="font-semibold">{email || "tu correo"}</span> con
              el paso a paso para restablecer tu contraseña.
            </div>
          )}

          <p className="text-xs text-gray-500">
            Si no reconoces este proceso, contacta al administrador. Por
            seguridad el enlace expirará en unos minutos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
