import { getAllGalleryUser, deleteOneGallery } from "@/api/galleryApi";
import type { GalleryItem, GalleryResponse } from "@/api/galleryApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Pagination, Drawer } from "@mantine/core";
import { IconDotsVertical, IconFilter, IconPlus } from "@tabler/icons-react";
import { CorfirmDelete } from "@/components/ui/modal/corfirmDelete";
import { GallerySort } from "@/components/ui/filters/GallerySort";
import { GalleryFiltersPanel } from "@/components/ui/filters/GalleryFiltersPanel";
import Search from "@/components/ui/filters/Search";

const Gallery = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 9;
  const [showModal, setShowModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "imagesCount">(
    "createdAt"
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);
  const [minImages, setMinImages] = useState<number | undefined>(undefined);
  const [maxImages, setMaxImages] = useState<number | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filtersOpened, setFiltersOpened] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, order, fromDate, toDate, minImages, maxImages]);

  const { data: AllGallery, isLoading } = useQuery<GalleryResponse>({
    queryKey: [
      "AllGallery",
      page,
      debouncedSearch,
      sortBy,
      order,
      fromDate,
      toDate,
      minImages,
      maxImages,
    ],
    queryFn: () =>
      getAllGalleryUser({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        order,
        from: fromDate,
        to: toDate,
        minImages,
        maxImages,
      }),
    placeholderData: (prev) => prev,
  });

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
  const handleResetFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setMinImages(undefined);
    setMaxImages(undefined);
    setPage(1);
  };

  const handleCleanSearch = () => {
    setSearch("");
    setDebouncedSearch("");
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
      <div className="hidden lg:flex">
        <GalleryFiltersPanel
          fromDate={fromDate}
          toDate={toDate}
          minImages={minImages}
          maxImages={maxImages}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onMinImagesChange={setMinImages}
          onMaxImagesChange={setMaxImages}
          onReset={handleResetFilters}
        />
      </div>

      <Drawer
        opened={filtersOpened}
        onClose={() => setFiltersOpened(false)}
        title="Фильтры"
        padding={0}
        size="100%"
        position="left"
        className="lg:hidden"
        styles={{
          header: { padding: '16px', backgroundColor: '#1f2937', color: 'white' },
          body: { padding: 0, height: 'calc(100% - 60px)' },
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto z-1000">
            <GalleryFiltersPanel
              fromDate={fromDate}
              toDate={toDate}
              minImages={minImages}
              maxImages={maxImages}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onMinImagesChange={setMinImages}
              onMaxImagesChange={setMaxImages}
              onReset={handleResetFilters}
            />
          </div>
          <div className="p-4  bg-gray-800 border-t border-gray-700">
            <Button
              variant="filled"
              color="violet"
              fullWidth
              onClick={() => setFiltersOpened(false)}
            >
              Применить и закрыть
            </Button>
          </div>
        </div>
      </Drawer>

      <div className="w-full p-3 sm:p-6 lg:p-8 flex-1">
        <div className="flex lg:hidden mb-3">
          <Button
            variant="light"
            color="violet"
            leftSection={<IconFilter size={18} />}
            onClick={() => setFiltersOpened(true)}
            fullWidth
          >
            Фильтры
          </Button>
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-end gap-2 mb-3 sm:mb-2">
          <div className="flex-1 sm:flex-initial w-full">
            <Search
              search={search}
              onSearchChange={setSearch}
              cleanSearch={handleCleanSearch}
            />
          </div>
          <div className="flex gap-2">
            <GallerySort
              sortBy={sortBy}
              order={order}
              onSortByChange={setSortBy}
              onOrderChange={setOrder}
            />
            <Button
              variant="filled"
              color="green"
              onClick={() => navigate("/gallery/add")}
              className="flex-1 sm:flex-initial"
            >
              <span className="hidden sm:inline">Добавить</span>
              <IconPlus size={18} className="sm:hidden" />
            </Button>
          </div>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 
                      bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl 
                      p-4 sm:p-6 lg:p-10 border border-gray-700 text-center"
        >
          {!AllGallery?.items || AllGallery?.items.length === 0 ? (
            <p className="text-gray-300">Ничего не нашли</p>
          ) : (
            AllGallery.items.map((item: GalleryItem) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 lg:p-5 bg-gray-700 rounded-xl border border-gray-600 cursor-pointer 
                          hover:bg-gray-650 transition-colors"
                onClick={() => navigate(`/gallery/details/${item.id}`)}
              >
                <div className="flex justify-end">
                  <div className="relative group mb-2">
                    <IconDotsVertical
                      onClick={(e) => e.stopPropagation()}
                      size={20}
                      className="text-white hover:text-gray-600 cursor-pointer transition-colors"
                    />
                    <div className="absolute right-0 top-5 min-w-[160px] h-3 z-10" />

                    <div className="absolute right-0 top-8 min-w-[160px] z-10 opacity-0 invisible  group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="translate-y-[-20px] group-hover:translate-y-0 transition-transform duration-300 rounded-lg shadow-xl overflow-hidden">
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            navigate(`/gallery/edit/${item.id}`);
                          }}
                          className="w-full text-left px-4 py-2.5 mb-0.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
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
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
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
                <p className="text-amber-400 font-semibold">
                  Картинок: {item.imagesCount}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
          <Pagination
            total={Math.ceil((AllGallery?.total ?? 0) / limit)}
            value={page}
            onChange={setPage}
            color="violet"
            size="md"
            className="[&_.mantine-Pagination-control]:text-sm sm:[&_.mantine-Pagination-control]:text-base"
          />
        </div>
      </div>

      {showModal && selectedGallery && (
        <div>
          {
            <CorfirmDelete
              cancelDelete={cancelDelete}
              confirmDelete={confirmDelete}
            />
          }
        </div>
      )}
    </div>
  );
};

export default Gallery;
