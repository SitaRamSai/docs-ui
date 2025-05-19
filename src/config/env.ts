export const ENV = {
  development: {
    api_url: "https://dmsv2-api.alliedworld.dev",
    cdn_url: "https://api.alliedworld.dev/api"
  },
  test: {
    api_url: "https://dmsv2-api.alliedworld-staging.cloud",
    cdn_url: "https://api.alliedworld-staging.cloud/api"
  },
  staging: {
    api_url: "https://dmsv2-api.alliedworld.cloud",
    cdn_url: "https://api.alliedworld.cloud/api"
  },
};

export const getEnvConfig = () => {
  const env = import.meta.env.VITE_APP_ENV || "development";
  return ENV[env as keyof typeof ENV];
};
