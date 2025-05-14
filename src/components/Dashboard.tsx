import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { 
  Loader2,
  AlertCircle, 
  Server,
  ChevronRight,
  Search,
  FileText,
  Clock,
  BarChart3,
  Layers,
  Database,
  Shield,
  Info,
  File,
  Plus,
  Upload,
  Filter,
  PieChart,
  LayoutDashboard,
  CalendarDays,
  Settings,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { apiService } from '../services/api';
import type { SourceSystemConfig } from '../services/api';

// Interface to match the API response format
interface SourceSystemResponse {
  Items: SourceSystemConfig[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useOktaAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  
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

  const handleAdvancedSearch = () => {
    navigate('/advanced-search');
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

  // Generate current date string
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard data...</p>
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

  // Mock data for recent activity
  const recentActivity = [
    { id: 1, action: 'Document uploaded', type: 'PDF', name: 'Q1 Financial Report.pdf', time: '2 hours ago', icon: <Upload size={14} /> },
    { id: 2, action: 'Document viewed', type: 'Excel', name: 'Budget Analysis.xlsx', time: '3 hours ago', icon: <FileText size={14} /> },
    { id: 3, action: 'Search performed', terms: 'quarterly report', results: '6 results', time: '5 hours ago', icon: <Search size={14} /> },
    { id: 4, action: 'Document shared', type: 'Word', name: 'Project Proposal.docx', time: 'Yesterday', icon: <File size={14} /> },
    { id: 5, action: 'Filter applied', filter: 'Date: Last 30 days', time: 'Yesterday', icon: <Filter size={14} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Top section with greeting and date */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{getTimeBasedGreeting()}, {firstName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{getCurrentDate()}</p>
          <p className="text-base text-slate-700 dark:text-slate-300">Welcome to DocFlow</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => navigate('/search-redesign')}
            className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Search size={16} className="mr-2" />
            New Search
          </button>
          <button 
            className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Upload size={16} className="mr-2" />
            Upload
          </button>
        </div>
      </div>
      
      {/* Dashboard tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            } transition-colors flex items-center`}
          >
            <LayoutDashboard size={16} className="mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === 'activity'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            } transition-colors flex items-center`}
          >
            <Clock size={16} className="mr-2" />
            Recent Activity
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8">
          {/* SOURCE SYSTEMS - Primary Focus with refined color design */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border-l-4 border-brand-500 dark:border-brand-400 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                <Database className="w-5 h-5 text-brand-500 dark:text-brand-400 mr-2" />
                Source Systems
              </h2>
              <button onClick={() => handleAdvancedSearch()} className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center">
                View All Systems
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            {/* Source System Explanation */}
            <div className="mb-6 bg-slate-50 dark:bg-slate-700/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-brand-500 dark:text-brand-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Source systems are the platforms where your documents are originally stored and managed. 
                  Each source system may contain different document types and formats. 
                  Select a source system to browse or search through its specific documents.
                </p>
              </div>
            </div>
            
            {hasSourceSystems ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sourceSystemItems.map((system, index) => (
                  <button
                    key={system.id || index}
                    onClick={() => handleCardClick(system)}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 flex flex-col hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/50 transition-all border border-slate-200 dark:border-slate-700 text-left group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="rounded-full p-2.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                        <Database className="w-5 h-5" />
                      </div>
                      <div className="text-slate-400 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100">
                        <ExternalLink size={16} />
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">{system.sourceSystem}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">Browse documents</span>
                      <ChevronRight size={14} className="text-brand-500" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/80 dark:bg-slate-800/60 rounded-lg">
                <Server className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
                <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">No source systems available</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Connect to a source system to start browsing documents</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Activity Tab Content
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/40 shadow-sm p-5">
          <h2 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start">
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full mr-3">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activity.type && `${activity.type} • `}
                    {activity.name || activity.terms || activity.filter}
                    {activity.results && ` • ${activity.results}`}
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
              </div>
            ))}
            
            <div className="pt-2 text-center">
              <button className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                View All Activity
                <ChevronDown size={16} className="inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 