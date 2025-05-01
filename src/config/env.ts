export const ENV = {
  development: {
    api_url: "https://dmsv2-api.alliedworld.dev/v1",
  },
  test: {
    api_url: "https://dmsv2-api.alliedworld.dev/v1",
  },
  staging: {
    api_url: "https://dmsv2-api.alliedworld.dev/v1",
  },
};

export const getEnvConfig = () => {
  const env = import.meta.env.VITE_APP_ENV || "development";
  return ENV[env as keyof typeof ENV];
};
