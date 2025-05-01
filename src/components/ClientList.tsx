import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, Users, ChevronRight, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api';
import type { Client } from '../services/api';
import { useEffect, useState } from 'react';

const ClientList: React.FC = () => {
    const navigate = useNavigate();
    const { sourceSystem } = useParams<{ sourceSystem: string }>();

    const { data: clients, isLoading, error } = useQuery({
        queryKey: ['clients', sourceSystem],
        queryFn: () => sourceSystem ? apiService.getClientList(sourceSystem) : Promise.reject('No source system specified'),
        enabled: !!sourceSystem,
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const handleClientClick = (client: Client) => {
        navigate(`/policy/${sourceSystem}/${client.clientId}`);
    };

    const handleBack = () => {
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading clients...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Error Loading Clients</h3>
                    <p className="text-sm text-red-500">
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Source Systems
                    </button>
                </div>
            </div>
        );
    }

    if (!clients.items?.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Clients Found</h3>
                    <p className="text-sm">No clients are available for this source system.</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Source Systems
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Source Systems
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.items.map((client) => (
                    <button
                        key={client.id}
                        onClick={() => handleClientClick(client)}
                        className="group relative p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                    {/* {client.clientId} */}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Client ID: {client.clientId}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {/* Type: {client.type} */}
                                </p>
                                <div className="mt-4 flex items-center text-xs text-gray-500">
                                    {/* <span>Last updated: {new Date(client.lastUpdated).toLocaleDateString()}</span> */}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ClientList;