import api from "./axios";

const fileHost = (() => {
  const baseURL = api.defaults.baseURL;

  if (!baseURL) return window.location.origin;

  return baseURL.replace(/\/api\/?$/, "").replace(/\/$/, "");
})();

export const getFileUrl = (path?: string) => {
  if (!path) return "";

  const cleanPath = path.startsWith("/")
    ? path.replace(/^\/api\//, "/")
    : `/${path.replace(/^\/api\//, "")}`;

  return `${fileHost}${cleanPath}`;
};
