import { useNavigate, useParams } from "react-router-dom";
import { getOneGallery, type GalleryItem } from "@/api/galleryApi";
import { useQuery } from "@tanstack/react-query";
import { GalleryButton } from "@/components/ui/auth/GalleryButton";
import imageUrl from "@/assets/123123.jpg";
import { useState } from "react";

const DetailsGallery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: gallery } = useQuery<GalleryItem>({
    queryKey: ["gallery", id],
    queryFn: () => getOneGallery(id!),
    enabled: !!id,
  });

  if (!gallery) {
    return <div>Ошибка</div>;
  }

  return (
    <div className="grow bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {gallery.title}
            </h1>
            <div className="flex items-center gap-2 text-cyan-100"></div>
          </div>
          <div className="w-full flex justify-center items-center p-15">
            <div
              className="relative w-16 h-16 group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => setSelectedImage(imageUrl)}
            >
              <img
                src={imageUrl}
                alt="Gallery image"
                className="max-w-full h-auto rounded-lg shadow-md object-cover"
              />
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 border border-gray-600 hover:border-cyan-500 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="bg-cyan-600 bg-opacity-20 rounded-lg p-2">
                  <svg
                    className="w-5 h-5 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                    Описание
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    {gallery.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 border border-gray-600 hover:border-purple-500 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 bg-opacity-20 rounded-lg p-2">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-400 mb-1">
                    Дата создания
                  </h3>
                  <p className="text-gray-200 font-medium">
                    {new Date(gallery.createdAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={() => navigate(`/gallery/edit/${gallery.id}`)}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
              >
                Редактировать
              </button>
              <GalleryButton
                color="gray"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/gallery`);
                }}
              >
                Отмена
              </GalleryButton>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0  bg-opacity-90 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          ></button>

          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default DetailsGallery;
