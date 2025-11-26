"use client";
import { Suspense } from "react";
import NewRequestForm from "@/components/NewRequestForm/NewRequestForm";
import { useRouter, useSearchParams } from "next/navigation";

const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestType = searchParams.get("type") || "maintenance";

  const handleSubmit = async (formData: any) => {
    const typeName =
      formData.type === "tech_support" ? "Soporte Tecnico" : "Mantenimiento";

    const body = {
      subject: formData.title,
      description: formData.description,
      location: formData.location,
      processId: formData.proceso,
      priorityName: formData.priority,
      requestTypeName: typeName,
    };

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/requests");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "No se pudo enviar la solicitud");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NewRequestForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialType={requestType}
      />
    </div>
  );
};

const Dashboard = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <DashboardContent />
  </Suspense>
);

export default Dashboard;
