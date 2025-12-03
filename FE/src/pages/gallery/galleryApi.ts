import api from "../../../lib/axios";

export interface User {
  id: string;
  firstname?: string;
  lastname?: string;
  email: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  user: User;
}

export interface AddOneGallery {
  title: string;
  description?: string;
}

export const getAllGalley = async () => {
  const response = await api.get(`/galleries`);
  return response.data;
};

export const deleteOneGallery = async (id: string) => {
  const response = await api.delete(`/galleries/${id}`);
  return response;
};

export const addOneGallery = async (data: AddOneGallery) => {
  const response = await api.post("/galleries", data);
  return response.data;
};

export const getOneGallery = async (id: string) => {
  const response = await api.get(`/galleries/${id}`);
  return response.data;
};

export const editOneGallery = async (id: string, data: AddOneGallery) => {
  const response = await api.patch(`/galleries/${id}`, data);
  return response.data;
};
