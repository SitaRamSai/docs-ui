import React, { useState, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Security, LoginCallback as OktaLoginCallback } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { OKTA_CONFIG } from './auth/AuthConfig';
import SecureRoute from './auth/SecureRoute';
import FileList from './components/FileList';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ClientList from './components/ClientList';
import AdvancedSearchPage from './components/AdvancedSearchPage';
import SearchUIRedesign from './components/SearchUIRedesign';
import { 
  Search, LayoutDashboard, FolderSearch, Moon, Sun, Upload, 
  FileText, Settings, Clock, X, ChevronsLeft,
  ChevronRight, Menu
} from 'lucide-react';
import './App.css';

const oktaAuth = new OktaAuth({
  issuer: OKTA_CONFIG.issuer,
  clientId: OKTA_CONFIG.clientId,
  redirectUri: OKTA_CONFIG.redirectUri,
  scopes: ['openid', 'profile', 'email'], // Default scopes needed for auth
  pkce: true,
  tokenManager: {
    autoRenew: true,
    autoRemove: true,
  },
});

// Mock FileUploadModal component temporarily until it's created
const FileUploadModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-glass w-full max-w-lg overflow-hidden">
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-lg">Upload Files</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-brand-500">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="p-6 space-y-6">
          <div className="file-drop-area border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition hover:border-brand-500">
            <Upload className="mx-auto h-10 w-10 text-brand-500" />
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Drag & drop or click to browse</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dark mode toggle component
const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <button 
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
};

// DocFlow Layout component that includes sidebar, header, and content area
interface DocFlowLayoutProps {
  children: React.ReactNode;
  sidebarFilters?: React.ReactNode;
}

const DocFlowLayout: React.FC<DocFlowLayoutProps> = ({ children, sidebarFilters }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const location = useLocation();
  const isAdvancedSearchPage = location.pathname === '/advanced-search';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Premium Enterprise Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 fixed md:relative inset-y-0 left-0 z-30 h-full`}
      >
        {/* Brand/Logo Section */}
        <div className={`h-16 border-b border-slate-200 dark:border-slate-800 flex items-center ${sidebarOpen ? 'justify-between px-5' : 'justify-center'}`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center">
                <img src="/docflow-logo.svg" alt="DocFlow Logo" className="h-8 w-8 mr-2.5" />
                <span className="text-brand-600 dark:text-brand-400 font-semibold text-lg tracking-tight">DocFlow</span>
              </div>
              {/* Toggle Button - Expanded State */}
              <button 
                onClick={toggleSidebar}
                className="group p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronsLeft size={18} />
              </button>
            </>
          ) : (
            <img src="/docflow-logo.svg" alt="DocFlow Logo" className="h-9 w-9" />
          )}
        </div>
        
        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {isAdvancedSearchPage && sidebarFilters ? (
            <div className="space-y-6">
              {sidebarFilters}
            </div>
          ) : (
            <nav className="space-y-0.5">
              <Link
                to="/"
                className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 gap-3 text-sm font-medium rounded-lg ${
                  location.pathname === '/'
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } transition-colors`}
              >
                <LayoutDashboard size={sidebarOpen ? 18 : 20} />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
              <Link
                to="/files"
                className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 gap-3 text-sm font-medium rounded-lg ${
                  location.pathname === '/files'
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } transition-colors`}
              >
                <FileText size={sidebarOpen ? 18 : 20} />
                {sidebarOpen && <span>All Files</span>}
              </Link>
              <Link
                to="/advanced-search"
                className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 gap-3 text-sm font-medium rounded-lg ${
                  location.pathname === '/advanced-search'
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } transition-colors`}
              >
                <FolderSearch size={sidebarOpen ? 18 : 20} />
                {sidebarOpen && <span>Advanced Search</span>}
              </Link>
              <Link
                to="/search-redesign"
                className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 gap-3 text-sm font-medium rounded-lg ${
                  location.pathname === '/search-redesign'
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } transition-colors`}
              >
                <Search size={sidebarOpen ? 18 : 20} />
                {sidebarOpen && <span>New Search UI</span>}
              </Link>
              <div className="pt-3 pb-3">
                <div className={`${sidebarOpen ? 'border-t border-slate-200 dark:border-slate-800' : ''}`}></div>
              </div>
              <Link
                to="/recent"
                className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 gap-3 text-sm font-medium rounded-lg ${
                  location.pathname === '/recent'
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } transition-colors`}
              >
                <Clock size={sidebarOpen ? 18 : 20} />
                {sidebarOpen && <span>Recent Documents</span>}
              </Link>
              <Link
                to="/settings"
                className={`flex items-center ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 gap-3 text-sm font-medium rounded-lg ${
                  location.pathname === '/settings'
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } transition-colors`}
              >
                <Settings size={sidebarOpen ? 18 : 20} />
                {sidebarOpen && <span>Settings</span>}
              </Link>
            </nav>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Toggle for Mobile */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center flex-1 gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Desktop Toggle Button - Only visible when sidebar is collapsed */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex md:items-center md:justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              style={{ display: sidebarOpen ? 'none' : 'flex' }}
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="py-2 pl-10 pr-4 block w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-lg text-sm placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 transition text-sm font-medium"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <DarkModeToggle />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
};

// AdvancedSearchRoute component to handle sidebar filters
const AdvancedSearchRoute = () => {
  const [sidebarFilters, setSidebarFilters] = useState<ReactNode>(null);
  
  return (
    <DocFlowLayout sidebarFilters={sidebarFilters}>
      <AdvancedSearchPage onSetSidebarFilters={setSidebarFilters} />
    </DocFlowLayout>
  );
};

function App() {
  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    window.location.href = toRelativeUrl(originalUri, window.location.origin);
  };

  return (
    <Router>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login/callback" element={<OktaLoginCallback />} />
          <Route path="/" element={
            <SecureRoute>
              <DocFlowLayout>
                <Dashboard />
              </DocFlowLayout>
            </SecureRoute>
          } />
          <Route path="/files" element={
            <DocFlowLayout>
              <FileList />
            </DocFlowLayout>
          } />
          <Route path="/policy/:sourceSystem/:clientId" element={
            <DocFlowLayout>
              <FileList />
            </DocFlowLayout>
          } />
          <Route path="/policy/:sourceSystem" element={
            <DocFlowLayout>
              <ClientList />
            </DocFlowLayout>
          } />
          <Route path="/advanced-search" element={<AdvancedSearchRoute />} />
          <Route path="/search-redesign" element={
            <DocFlowLayout>
              <SearchUIRedesign />
            </DocFlowLayout>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Security>
    </Router>
  );
}

export default App;