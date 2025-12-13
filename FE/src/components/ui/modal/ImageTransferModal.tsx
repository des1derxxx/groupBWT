import type { GalleryItem } from "@/api/galleryApi";
import { GalleryButton } from "@/components/ui/auth/GalleryButton";

interface ImageTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  AllGallery: GalleryItem[];
  currentGalleryId: string;
  selectedGalleryId: string;
  onGallerySelect: (galleryId: string) => void;
  isPending: boolean;
  mode: "move" | "copy";
}

export const ImageTransferModal = ({
  isOpen,
  onClose,
  onConfirm,
  AllGallery,
  currentGalleryId,
  selectedGalleryId,
  onGallerySelect,
  isPending,
  mode,
}: ImageTransferModalProps) => {
  if (!isOpen) return null;

  const title =
    mode === "move"
      ? "Выберите в какую галерею хотите переместить картинку"
      : "Выберите в какую галерею хотите скопировать картинку";

  const confirmText = mode === "move" ? "Переместить" : "Скопировать";
  const pendingText = mode === "move" ? "Перемещение..." : "Копирование...";

  return (
    <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-1000">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <select
          value={selectedGalleryId}
          onChange={(e) => onGallerySelect(e.target.value)}
          className="w-full mb-6 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
        >
          <option value="">Выберите галерею</option>
          {AllGallery?.filter((item) => item.id !== currentGalleryId).map(
            (item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            )
          )}
        </select>
        <div className="flex justify-center items-center gap-3 px-48">
          <GalleryButton
            color="green"
            onClick={onConfirm}
            disabled={!selectedGalleryId || isPending}
          >
            {isPending ? pendingText : confirmText}
          </GalleryButton>
          <GalleryButton color="red" onClick={onClose}>
            Отмена
          </GalleryButton>
        </div>
      </div>
    </div>
  );
};
