import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Security, LoginCallback as OktaLoginCallback } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { OKTA_CONFIG } from './auth/AuthConfig';
import SecureRoute from './auth/SecureRoute';
import FileList from './components/FileList';
import Toolbar from './components/Toolbar';
import Breadcrumbs from './components/Breadcrumbs';
import Header from './components/Header';
import Footer from './components/Footer';
import AdvancedSearchPage from './components/AdvancedSearchPage';
import Login from './components/Login';
import ClientList from './components/ClientList';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify'

const oktaAuth = new OktaAuth({
  issuer: OKTA_CONFIG.issuer,
  clientId: OKTA_CONFIG.clientId,
  redirectUri: OKTA_CONFIG.redirectUri,
  scopes: OKTA_CONFIG.scopes,
  pkce: true,
  tokenManager: {
    autoRenew: true,
    autoRemove: true,
  },
});

function FileBrowserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-3 py-4 sm:px-4 md:px-6 border-b border-gray-200">
              <h1 className="text-lg font-medium leading-6 text-gray-900">
                File Browser
              </h1>
            </div>
            <Breadcrumbs />

            <div className="overflow-x-auto">
              <Toolbar />
              <FileList />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ClientListLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-3 py-4 sm:px-4 md:px-6 border-b border-gray-200">
              <h1 className="text-lg font-medium leading-6 text-gray-900">
                Client List
              </h1>
            </div>
            <ClientList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    window.location.href = toRelativeUrl(originalUri, window.location.origin);
  };

  return (
    <Router>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <Routes>
          <Route path="/" element={<SecureRoute><DashboardLayout /></SecureRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/callback" element={<OktaLoginCallback />} />
          <Route path="/:sourceSystem" element={<ClientListLayout />} />
          <Route path="/:sourceSystem/:clientId" element={<FileBrowserLayout />} />
          <Route path="/:documentType/:sourceSystem/:clientId" element={<FileBrowserLayout />} />
          <Route path="/advanced-search" element={<AdvancedSearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Security>
      <ToastContainer autoClose={2000} hideProgressBar={true} />
    </Router>
  );
}

export default App;