import { getAllGalleryUser, deleteOneGallery } from "@/api/galleryApi";
import type { GalleryItem, GalleryResponse } from "@/api/galleryApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GalleryButton } from "@/components/ui/auth/GalleryButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Pagination } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";

const Gallery = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data: AllGallery, isLoading } = useQuery<GalleryResponse>({
    queryKey: ["AllGallery", page],
    queryFn: () => getAllGalleryUser(page, limit),
    placeholderData: (previousData) => previousData,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(
    null
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOneGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllGallery"] });
      const currentItems = AllGallery?.items?.length ?? 0;
      if (currentItems === 1 && page > 1) {
        setPage(page - 1);
      }

      setShowModal(false);
      setSelectedGallery(null);
    },
    onError: (error) => {
      console.error("Ошибка при удалении:", error);
    },
  });

  const handleDeleteClick = (gallery: GalleryItem) => {
    setSelectedGallery(gallery);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGallery) {
      deleteMutation.mutate(selectedGallery.id);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedGallery(null);
  };

  if (isLoading && !AllGallery) {
    return (
      <div className="grow bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <p className="text-white text-xl">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="grow bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex">
      <div className="w-full p-10">
        <div className="pb-10 grid justify-items-end">
          <Button
            variant="filled"
            color="green"
            onClick={() => navigate("/gallery/add")}
          >
            Добавить
          </Button>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 
                      bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 
                      border border-gray-700 text-center"
        >
          {!AllGallery?.items || AllGallery?.items.length === 0 ? (
            <p className="text-gray-300">Ничего не нашли</p>
          ) : (
            AllGallery.items.map((item: GalleryItem) => (
              <div
                key={item.id}
                className="p-5 bg-gray-700 rounded-xl border border-gray-600"
                onClick={() => navigate(`/gallery/details/${item.id}`)}
              >
                <div className="flex justify-end">
                  <div className="relative group mb-2">
                    <IconDotsVertical
                      size={20}
                      className="text-white hover:text-gray-600 cursor-pointer transition-colors"
                    />

                    <div className="absolute right-0 top-8 min-w-[160px] z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="translate-y-[-100px] group-hover:translate-y-0 transition-transform duration-300 rounded-lg shadow-xl  overflow-hidden">
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            navigate(`/gallery/edit/${item.id}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 mb-1"
                          style={{
                            transitionDelay: "100ms",
                            transitionProperty: "opacity, transform",
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-600"
                          style={{
                            transitionDelay: "250ms",
                            transitionProperty: "opacity, transform",
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-white line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-gray-300 line-clamp-2 whitespace-pre-wrap">
                  {item.description}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
        {(AllGallery?.total ?? 0) > limit && (
          <div className="flex justify-center mt-10">
            <Pagination
              total={Math.ceil((AllGallery?.total ?? 0) / limit)}
              value={page}
              onChange={setPage}
              color="violet"
              size="lg"
            />
          </div>
        )}
      </div>

      {showModal && selectedGallery && (
        <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-1000">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Подтвердите удаление
            </h2>
            <p className="text-gray-300 mb-6">
              Вы уверены, что хотите удалить галерею{" "}
              <strong>{selectedGallery.title}</strong>?
            </p>
            <div className="flex justify-between gap-4">
              <GalleryButton color="gray" onClick={cancelDelete}>
                Отмена
              </GalleryButton>
              <GalleryButton color="red" onClick={confirmDelete}>
                Удалить
              </GalleryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
