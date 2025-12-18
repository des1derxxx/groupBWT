import { useNavigate, useParams } from "react-router-dom";
import {
  deleteOneImage,
  getAllGalleryUser,
  getOneGallery,
  getImages,
  moveImage as moveImageApi,
  copyImage as copyImageApi,
} from "@/api/galleryApi";
import {
  uploadImages,
  type FilePreview,
  type UploadImagesData,
} from "@/api/imagesApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  IconEdit,
  IconTrash,
  IconReplace,
  IconCopy,
  IconUpload,
} from "@tabler/icons-react";
import { Pagination } from "@mantine/core";
import type { AxiosResponse } from "axios";
import { getFileUrl } from "@/lib/getFileUrl";
import type {
  ImageItem,
  GalleryImagesData,
  GalleryItem,
  GalleryResponse,
} from "@/api/galleryApi";
import { BackButton } from "@/components/ui/button/backButton";
import { CorfirmDelete } from "@/components/ui/modal/corfirmDelete";
import { ImageTransferModal } from "@/components/ui/modal/ImageTransferModal";
import { UploadImagesModal } from "@/components/ui/modal/UploadImagesModal";
import { FormNotification } from "@/components/ui/auth/FormNotification";

const DetailsGallery = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 9;
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [deleteImage, setDeleteImage] = useState<string | null>(null);
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    imageId: string | null;
    mode: "move" | "copy";
  }>({
    isOpen: false,
    imageId: null,
    mode: "move",
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);

  const [notification, setNotification] = useState({
    message: "",
    color: "green" as "red" | "green",
    visible: false,
  });

  const { data: gallery } = useQuery<GalleryItem>({
    queryKey: ["gallery", id],
    queryFn: () => getOneGallery(id!),
    enabled: !!id,
  });

  const { data: AllGallery } = useQuery<GalleryResponse>({
    queryKey: ["AllGallery", page],
    queryFn: () => getAllGalleryUser({ page, limit }),
    placeholderData: (previousData) => previousData,
  });

  const {
    data: images,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["gallery-images", gallery?.id, page, limit],
    queryFn: () => getImages(gallery?.id!, page, limit),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
    enabled: !!gallery?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOneImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-images", gallery?.id, page, limit],
      });

      if ((galleryData?.images?.length ?? 0) === 1 && page > 1) {
        setPage(page - 1);
      }

      setShowModalDelete(false);
      setDeleteImage(null);
    },
    onError: (error) => {
      console.error("Ошибка при удалении:", error);
    },
  });
  const uploadMutation = useMutation({
    mutationFn: ({ files, galleryId }: UploadImagesData) =>
      uploadImages({ files, galleryId }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-images", variables.galleryId, page, limit],
      });
      setNotification({
        message: "Картинки успешно загружены!",
        color: "green",
        visible: true,
      });
      setShowUploadModal(false);
      setSelectedFiles([]);
    },
    onError: (error: any) => {
      setNotification({
        message: error.response?.data?.message || error.message,
        color: "red",
        visible: true,
      });
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, galleryId }: { id: string; galleryId: string }) =>
      moveImageApi(id, galleryId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-images", gallery?.id, page, limit],
      });
      queryClient.invalidateQueries({
        queryKey: ["gallery-images", variables.galleryId],
      });

      const galleryData = (images as AxiosResponse<GalleryImagesData>)?.data;
      if ((galleryData?.images?.length ?? 0) === 1 && page > 1) {
        setPage(page - 1);
      }

      handleTransferSuccess();
      setSelectedGalleryId("");
    },
    onError: (error) => {
      console.error("Ошибка при перемещении:", error);
    },
  });

  const copyMutation = useMutation({
    mutationFn: ({ id, galleryId }: { id: string; galleryId: string }) =>
      copyImageApi(id, galleryId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-images", variables.galleryId],
      });
      handleTransferSuccess();
    },
    onError: (error) => {
      console.error("Ошибка при копировании:", error);
    },
  });

  const handleTransferSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["gallery-images", gallery?.id, page, limit],
    });

    const galleryData = (images as AxiosResponse<GalleryImagesData>)?.data;
    if ((galleryData?.images?.length ?? 0) === 1 && page > 1) {
      setPage(page - 1);
    }

    closeTransferModal();
  };

  const handleDeleteImage = (id: string) => {
    setDeleteImage(id);
    setShowModalDelete(true);
  };

  const cancelDelete = () => {
    setShowModalDelete(false);
    setDeleteImage(null);
  };

  const confirmDelete = () => {
    if (deleteImage) {
      deleteMutation.mutate(deleteImage);
    }
  };
  const openTransferModal = (imageId: string, mode: "move" | "copy") => {
    setTransferModal({
      isOpen: true,
      imageId,
      mode,
    });
  };

  const closeTransferModal = () => {
    setTransferModal({
      isOpen: false,
      imageId: null,
      mode: "move",
    });
    setSelectedGalleryId("");
  };

  const confirmTransfer = () => {
    if (transferModal.imageId && selectedGalleryId) {
      const params = {
        id: transferModal.imageId,
        galleryId: selectedGalleryId,
      };

      if (transferModal.mode === "move") {
        moveMutation.mutate(params);
      } else {
        copyMutation.mutate(params);
      }
    }
  };

  if (!gallery) {
    return <div>Ошибка</div>;
  }

  if (isLoading) {
    return <p className="text-white">Загрузка...</p>;
  }

  if (isError) {
    return <p className="text-red-400">Ошибка загрузки</p>;
  }

  const galleryData = (images as AxiosResponse<GalleryImagesData>)?.data;
  const totalPages = galleryData?.totalPages ?? 1;
  const isPending = moveMutation.isPending || copyMutation.isPending;

  return (
    <div className="grow bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-3 sm:p-4 lg:p-6 pt-16 sm:pt-20 relative">
      <BackButton />


      <FormNotification
        visible={notification.visible}
        message={notification.message}
        color={notification.color}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
      />
      <div className="w-full max-w-3xl">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between gap-3">
              <div className="flex flex-col flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 break-words">
                  {gallery.title}
                </h1>
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed break-words">
                  Описание: {gallery.description}
                </p>
                <p className="text-xs sm:text-sm text-gray-200 font-medium mt-1">
                  {new Date(gallery.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <div
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-white hover:text-gray-800 hover:bg-white/20 cursor-pointer transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/gallery/edit/${gallery.id}`);
                  }}
                >
                  <IconEdit size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-white hover:text-gray-800 hover:bg-white/20 cursor-pointer transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUploadModal(true);
                  }}
                >
                  <IconUpload size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-cyan-100"></div>
          </div>
          <div className="w-full flex flex-col items-center p-3 sm:p-4 lg:p-6">
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
              {galleryData?.images?.map((img: ImageItem) => (
                <div
                  key={img.id}
                  className="relative aspect-square cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                  onClick={() => setSelectedImage(getFileUrl(img.path))}
                >
                  <img
                    src={getFileUrl(img.path)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 sm:gap-2 bg-black/40 rounded-lg p-1">
                    <IconCopy
                      onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                        e.stopPropagation();
                        openTransferModal(img.id.toString(), "copy");
                      }}
                      size={18}
                      className="sm:w-5 sm:h-5 text-white hover:text-blue-300 transition-colors cursor-pointer"
                    />
                    <IconReplace
                      onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                        e.stopPropagation();
                        openTransferModal(img.id.toString(), "move");
                      }}
                      size={18}
                      className="sm:w-5 sm:h-5 text-white hover:text-blue-300 transition-colors cursor-pointer"
                    />
                    <IconTrash
                      onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id.toString());
                      }}
                      size={18}
                      className="sm:w-5 sm:h-5 text-white hover:text-red-400 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full flex justify-center py-2 sm:py-4">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                size="sm"
                radius="sm"
                className="[&_.mantine-Pagination-control]:text-xs sm:[&_.mantine-Pagination-control]:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {deleteImage && showModalDelete && (
        <div>
          {
            <CorfirmDelete
              cancelDelete={cancelDelete}
              confirmDelete={confirmDelete}
            />
          }
        </div>
      )}

      <UploadImagesModal
        isOpen={showUploadModal}
        selectedFiles={selectedFiles}
        isPending={uploadMutation.isPending}
        onClose={() => {
          selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
          setSelectedFiles([]);
          setShowUploadModal(false);
        }}
        onFilesAdd={(files) => setSelectedFiles((prev) => [...prev, ...files])}
        onFileRemove={(index) => {
          URL.revokeObjectURL(selectedFiles[index].preview);
          setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        }}
        onUpload={() => {
          if (!gallery?.id) return;

          uploadMutation.mutate({
            files: selectedFiles.map((f) => f.file),
            galleryId: gallery.id,
          });
        }}
      />

      <ImageTransferModal
        isOpen={transferModal.isOpen}
        onClose={closeTransferModal}
        onConfirm={confirmTransfer}
        AllGallery={AllGallery?.items ?? []}
        currentGalleryId={gallery.id}
        selectedGalleryId={selectedGalleryId}
        onGallerySelect={setSelectedGalleryId}
        isPending={isPending}
        mode={transferModal.mode}
      />
    </div>
  );
};

export default DetailsGallery;
