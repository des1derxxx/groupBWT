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

const DetailsGallery = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
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

  const { data: gallery } = useQuery<GalleryItem>({
    queryKey: ["gallery", id],
    queryFn: () => getOneGallery(id!),
    enabled: !!id,
  });

  const { data: AllGallery } = useQuery<GalleryResponse>({
    queryKey: ["AllGallery", page],
    queryFn: () => getAllGalleryUser(page, limit),
    placeholderData: (previousData) => previousData,
  });

  const { data: images, isLoading, isError } = useQuery({
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
      setShowUploadModal(false);
      setSelectedFiles([]);
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
      // Инвалидируем кэш для целевой галереи (куда скопировали)
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
    <div className="grow bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6 relative">
      <BackButton />
      <div className="w-full max-w-3xl">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8">
            <div className="flex justify-between">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {gallery.title}
                </h1>
                <p className="text-gray-200 leading-relaxed">
                  Описание: {gallery.description}
                </p>
                <p className="text-gray-200 font-medium">
                  {new Date(gallery.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <div
                  className="flex rounded-2xl text-white hover:text-gray-800 cursor-pointer transition-colors mb-4"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/gallery/edit/${gallery.id}`);
                  }}
                >
                  <IconEdit />
                </div>
                <div
                  className="flex rounded-2xl text-white hover:text-gray-800 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUploadModal(true);
                  }}
                >
                  <IconUpload />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-cyan-100"></div>
          </div>
          <div className="w-full flex flex-col items-center p-6">
            <div className="w-full flex flex-wrap justify-center gap-4 mb-6 ">
              {galleryData?.images?.map((img: ImageItem) => (
                <div
                  key={img.id}
                  className="relative w-48 h-48 cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
                  onClick={() => setSelectedImage(getFileUrl(img.path))}
                >
                  <img
                    src={getFileUrl(img.path)}
                    alt=""
                    className="w-full h-full  object-cover"
                  />
                  <IconCopy
                    onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                      e.stopPropagation();
                      openTransferModal(img.id.toString(), "copy");
                    }}
                    className="absolute top-2 right-18 text-white hover:text-blue-800 transition-colors cursor-pointer"
                  />
                  <IconReplace
                    onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                      e.stopPropagation();
                      openTransferModal(img.id.toString(), "move");
                    }}
                    className="absolute top-2 right-10 text-white hover:text-blue-800 transition-colors cursor-pointer"
                  />
                  <IconTrash
                    onClick={(e: React.MouseEvent<SVGSVGElement>) => {
                      e.stopPropagation();
                      handleDeleteImage(img.id.toString());
                    }}
                    className="absolute top-2 right-2 text-white hover:text-red-500 transition-colors cursor-pointer"
                  />
                </div>
              ))}
            </div>
            <div className="w-full flex justify-center py-4">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                size="sm"
                radius="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 backdrop-blur-xs bg-opacity-90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-256 max-h-256 object-contain rounded-lg"
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
