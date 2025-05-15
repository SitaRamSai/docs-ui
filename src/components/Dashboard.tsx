import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { 
  Loader2, 
  AlertCircle, 
  Server, 
  ChevronRight, 
  Clock, 
  Layers
} from 'lucide-react';
import { apiService } from '../services/api';
import type { SourceSystemConfig } from '../services/api';

// Interface to match the API response format
interface SourceSystemResponse {
  Items: SourceSystemConfig[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { authState } = useOktaAuth();
  
  // Get user name from auth state
  const userName = authState?.idToken?.claims?.name || 'User';
  const firstName = userName.split(' ')[0];
  
  // Correctly type the API response
  const { data: response, isLoading, error } = useQuery<SourceSystemResponse>({
    queryKey: ['sourceSystemConfigs'],
    queryFn: async () => {
      const data = await apiService.getSourceSystemConfigs();
      // If the API returns an array directly, wrap it in the expected format
      if (Array.isArray(data)) {
        return { Items: data };
      }
      return data as SourceSystemResponse;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // Modern replacement for cacheTime
  });

  const handleCardClick = (config: SourceSystemConfig) => {
    navigate(`/policy/${config.sourceSystem}`);
  };

  // Extract the items from the response for easier access
  const sourceSystemItems = response?.Items || [];

  // Get the time of day for an appropriate greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const hasSourceSystems = sourceSystemItems.length > 0;

  return (
    <div className="space-y-6">
      {/* Header styled to match other boxes */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{getTimeBasedGreeting()}, {firstName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome to your personal Docsville hub. Here you can access all your documents, systems, and recent activities.
          </p>
        </div>
        
        <div className="border-t border-gray-100 pt-4 mt-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'recent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'favorites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Source Systems */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Source Systems</h2>
              <p className="text-sm text-gray-500">
                These are your connected data sources. Click on any system to browse its documents, policies, and records. 
                Each system contains documents from its originating platform, allowing you to access everything from a single interface.
              </p>
            </div>

            {!hasSourceSystems ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center text-gray-500">
                  <Server className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Source Systems Available</h3>
                  <p className="text-sm text-gray-500">No source systems have been configured yet.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sourceSystemItems.map((config: SourceSystemConfig, index: number) => (
                  <button
                    key={config.id || index}
                    onClick={() => handleCardClick(config)}
                    className="group bg-white relative p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-start">
                      <div className={`rounded-full p-3 bg-${index % 6 === 0 ? 'blue' : index % 6 === 1 ? 'green' : index % 6 === 2 ? 'purple' : index % 6 === 3 ? 'amber' : index % 6 === 4 ? 'emerald' : 'cyan'}-100 mr-4`}>
                        <Layers className={`w-5 h-5 text-${index % 6 === 0 ? 'blue' : index % 6 === 1 ? 'green' : index % 6 === 2 ? 'purple' : index % 6 === 3 ? 'amber' : index % 6 === 4 ? 'emerald' : 'cyan'}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                          {config.sourceSystem}
                        </h3>
                        {config.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {config.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Updated: {new Date(config.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'recent' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="rounded-full bg-gray-100 p-2 mr-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {i % 3 === 0 ? 'File updated' : i % 3 === 1 ? 'New document added' : 'System synced'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {i % 3 === 0 ? 'policy_document_123.pdf' : i % 3 === 1 ? 'contract_2023.docx' : 'Source System AIMS'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {i} {i === 1 ? 'hour' : 'hours'} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 