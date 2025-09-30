"use client";
import React, { useEffect } from "react";
import DashboardOverview from "../components/DashboardView/DashboardOverview";
import { useState } from "react";
import { sampleRequests } from "@/Data/Datatest";

const Home = () => {
    const [requests, setRequests] = useState([]);
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        setRequests(sampleRequests);
    }, []);
    
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardOverview requests={requests} setActiveView={setActiveView} />
        </div>
    )
}

export default Home;