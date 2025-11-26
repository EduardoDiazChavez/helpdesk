"use client";
import { Suspense } from "react";
import NewRequestForm from "@/components/NewRequestForm/NewRequestForm";
import { useRouter, useSearchParams } from "next/navigation";

const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestType = searchParams.get("type") || "maintenance";

  const handleSubmit = (formData: unknown) => {
    console.log("Datos del formulario:", formData);
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
