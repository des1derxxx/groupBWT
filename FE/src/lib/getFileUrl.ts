import apiBase from "./axiosBase";

const fileHost = (
  apiBase.defaults.baseURL ??
  window.location.origin
).replace(/\/$/, "");

export const getFileUrl = (path?: string) => {
  if (!path) return "";
  const cleanPath = path.startsWith("/")
    ? path.replace(/^\/api\//, "/")
    : `/${path.replace(/^\/api\//, "")}`;
  return `${fileHost}${cleanPath}`;
};

