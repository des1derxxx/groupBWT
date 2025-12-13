import api from "@/lib/axios";
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

export interface GalleryResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AddOneGallery {
  title: string;
  description?: string;
}

export interface ImageItem {
  id: string | number;
  path: string;
}

export interface GalleryImagesData {
  images: ImageItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAllGalleryUser = async (
  page: number = 1,
  limit: number = 9
) => {
  const response = await api.get(
    `/galleries/userGallery?page=${page}&limit=${limit}`
  );
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

export const getImages = async (
  galleryId: string,
  page: number,
  limit: number
) => {
  const response = await api.get(
    `/images/gallery/${galleryId}?page=${page}&limit=${limit}`
  );
  return response;
};

export const deleteOneImage = async (id: string) => {
  const response = await api.delete(`/images/deleteImage/${id}`);
  return response;
};

export const moveImage = async (id: string, galleryId: string) => {
  const response = await api.post(`/images/moveImage/${id}`, { galleryId });
  return response;
};

export const copyImage = async (id: string, galleryId: string) => {
  const response = await api.post(`/images/copyImage/${id}`, { galleryId });
  return response;
};
