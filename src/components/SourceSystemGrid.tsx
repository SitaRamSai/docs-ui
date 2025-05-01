import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Server, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import type { SourceSystemConfig } from '../services/api';

const SourceSystemGrid: React.FC = () => {
    const navigate = useNavigate();
    const { data: configs, isLoading, error } = useQuery({
        queryKey: ['sourceSystemConfigs'],
        queryFn: () => apiService.getSourceSystemConfigs(),
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const handleCardClick = (config: SourceSystemConfig) => {
        navigate(`/policy/${config.sourceSystem}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading source systems...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Error Loading Source Systems</h3>
                    <p className="text-sm text-red-500">
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                </div>
            </div>
        );
    }

    if (!configs.Items?.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-gray-500">
                    <Server className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Source Systems Available</h3>
                    <p className="text-sm">No source systems have been configured yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {configs.Items.map((config) => (
                <button
                    key={config.id}
                    onClick={() => handleCardClick(config)}
                    className={`
            group relative p-6 rounded-lg border transition-all duration-200
           
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}

                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                {config.sourceSystem}
                            </h3>
                            {config.description && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                    {config.region}
                                </p>
                            )}
                            <div className="mt-4 flex items-center text-xs text-gray-500">
                                <span>Last updated: {new Date(config.updatedTime).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>

                </button>
            ))}
        </div>
    );
};

export default SourceSystemGrid;