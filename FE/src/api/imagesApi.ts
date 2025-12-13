import api from "@/lib/axios";

export interface UploadImagesData {
  files: File[];
  galleryId: string;
}

export interface FilePreview {
  file: File;
  preview: string;
}

export const uploadImages = async ({ files, galleryId }: UploadImagesData) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("galleryId", galleryId);
  const response = await api.post("/images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
