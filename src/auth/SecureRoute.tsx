import React from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useNavigate, useLocation } from "react-router-dom";
import { OKTA_CONFIG } from "./AuthConfig";
import { Loader2 } from "lucide-react";
import type { AuthState } from "@okta/okta-auth-js";

interface SecureRouteProps {
  children: React.ReactNode;
}

const SecureRoute: React.FC<SecureRouteProps> = ({ children }) => {
  const { oktaAuth, authState } = useOktaAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // If Okta is disabled, render children without authentication
  if (!OKTA_CONFIG.isEnabled) {
    return <>{children}</>;
  }

  // Show loading state while authentication state is being determined
  if (!authState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Checking authentication...
          </h2>
        </div>
      </div>
    );
  }

  // If not authenticated, save the current location and redirect to login
  if (!authState.isAuthenticated) {
    try {
      const currentLocation = `${pathname}${search}`;
      oktaAuth.setOriginalUri(currentLocation);
    } catch (error) {
      console.error("Error setting original URI:", error);
    }


    navigate('/filebrowser', { replace: true, state: { from: pathname } })
    // If authenticated, render the protected content
  };
}
export default SecureRoute;
