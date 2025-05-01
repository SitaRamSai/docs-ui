import React from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Navigate } from 'react-router-dom';
import { OKTA_CONFIG } from '../auth/AuthConfig';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
    const { oktaAuth, authState } = useOktaAuth();

    const handleLogin = async () => {
        oktaAuth.signInWithRedirect();
    };

    if (!OKTA_CONFIG.isEnabled) {
        return <Navigate to="/" replace />;
    }

    if (!authState) {
        return <div>Loading authentication...</div>;
    }

    if (authState.isAuthenticated) {
        return <Navigate to="/filebrowser" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Welcome to Docsville
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please sign in to access your files
                    </p>
                </div>
                <div className="mt-8">
                    <button
                        onClick={handleLogin}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                        </span>
                        Sign in with Okta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;