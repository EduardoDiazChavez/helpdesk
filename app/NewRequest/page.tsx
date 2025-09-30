"use client";
import NewRequestForm from "@/components/NewRequestForm/NewRequestForm";
import { useRouter } from 'next/navigation';

const Dashboard = () => {
    const router = useRouter();

    const handleSubmit = (formData) => {
        console.log('Datos del formulario:', formData);
    };

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <NewRequestForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
    )
}
export default Dashboard;