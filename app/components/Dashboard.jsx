"use client";

import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import NewRequestForm from './NewRequestForm';
import RequestHistory from './RequestHistory';

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Helpdesk Clínica</h1>
                <p className="text-sm text-gray-500">Sistema de Gestión de Solicitudes</p>
              </div>
            </div>
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('new-request')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'new-request' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Nueva Solicitud
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'history' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Historial
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && <DashboardOverview requests={requests} setActiveView={setActiveView} />}
        {activeView === 'new-request' && <NewRequestForm onSubmit={addRequest} onCancel={() => setActiveView('dashboard')} />}
        {activeView === 'history' && <RequestHistory requests={requests} />}
      </main>
    </div>
  );
};

export default Dashboard;