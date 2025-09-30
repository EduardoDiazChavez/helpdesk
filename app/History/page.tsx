"use client";
import RequestHistory from "@/components/RequestHistory/RequestHistory";
import { useEffect, useState } from "react";
import { sampleRequests } from "@/Data/Datatest";

const History = () => {
  const [requests, setRequests] = useState([]);

  // Datos de ejemplo para el historial
  useEffect(() => {
    setRequests(sampleRequests);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RequestHistory requests={requests} />
    </div>
  )
}
export default History;