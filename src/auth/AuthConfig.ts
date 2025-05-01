export const OKTA_CONFIG = {
  clientId: import.meta.env.VITE_APP_OKTA_CLIENT_ID,
  issuer: import.meta.env.VITE_APP_OKTA_ISSUER,
  redirectUri: window.location.origin + "/login/callback",
  isEnabled: import.meta.env.VITE_APP_ENABLE_OKTA === "true",
};
