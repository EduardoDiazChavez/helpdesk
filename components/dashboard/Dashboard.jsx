"use client";

import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import DashboardOverview from '../DashboardView/DashboardOverview';
import NewRequestForm from '../NewRequestForm/NewRequestForm';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [requests, setRequests] = useState([]);

  // Datos de ejemplo para el historial
  useEffect(() => {
    const sampleRequests = [
      {
        id: 1,
        type: 'maintenance',
        title: 'Reparación de aire acondicionado - Sala 202',
        description: 'El aire acondicionado no enfría adecuadamente',
        priority: 'high',
        status: 'pending',
        requestedBy: 'Dr. María González',
        department: 'Cardiología',
        createdAt: '2024-08-10T09:30:00',
        updatedAt: '2024-08-10T09:30:00'
      },
      {
        id: 2,
        type: 'tech_support',
        title: 'Computadora no enciende - Recepción',
        description: 'La computadora principal de recepción no responde',
        priority: 'urgent',
        status: 'in_progress',
        requestedBy: 'Ana López',
        department: 'Administración',
        createdAt: '2024-08-09T14:15:00',
        updatedAt: '2024-08-10T08:00:00'
      },
      {
        id: 3,
        type: 'maintenance',
        title: 'Filtración en baño - Piso 3',
        description: 'Hay una pequeña filtración en el baño del tercer piso',
        priority: 'medium',
        status: 'completed',
        requestedBy: 'Carlos Ramírez',
        department: 'Mantenimiento',
        createdAt: '2024-08-08T11:00:00',
        updatedAt: '2024-08-09T16:30:00'
      }
    ];
    setRequests(sampleRequests);
  }, []);

  const addRequest = (newRequest) => {
    const request = {
      ...newRequest,
      id: requests.length + 1,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRequests([request, ...requests]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && <DashboardOverview requests={requests} setActiveView={setActiveView} />}
        {activeView === 'new-request' && <NewRequestForm onSubmit={addRequest} onCancel={() => setActiveView('dashboard')} />}
      </div>
    </div>
  );
};

export default Dashboard;
