import { IconUpload } from "@tabler/icons-react";
import { GalleryButton } from "@/components/ui/auth/GalleryButton";
import type { FilePreview } from "@/api/imagesApi";
import type { FC } from "react";
import { notifications } from "@mantine/notifications";
import { CustomFileInput } from "../input/CustomFileInput";

type UploadImagesModalProps = {
  isOpen: boolean;
  selectedFiles: FilePreview[];
  isPending: boolean;
  onClose: () => void;
  onFilesAdd: (files: FilePreview[]) => void;
  onFileRemove: (index: number) => void;
  onUpload: () => void;
};

export const UploadImagesModal: FC<UploadImagesModalProps> = ({
  isOpen,
  selectedFiles,
  isPending,
  onClose,
  onFilesAdd,
  onFileRemove,
  onUpload,
}) => {
  if (!isOpen) return null;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const FILE_NAME_REGEX = /^[a-zA-Z0-9._-]+$/;

  return (
    <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto">
        <h1 className="text-white font-semibold mb-6 text-center text-2xl">
          Загрузка фото
        </h1>

        <div className="mb-6">
          <label className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
            <IconUpload className="mr-2" />

            <CustomFileInput
              multiple
              accept="image/jpeg,image/png,image/jpg"
              label="Выбрать изображения"
              onChange={(files) => {
                const validFiles: FilePreview[] = [];
                Array.from(files).forEach((file) => {
                  if (file.size > MAX_FILE_SIZE) {
                    notifications.show({
                      color: "red",
                      title: "Файл слишком большой",
                      message: `«${file.name}» превышает 5 МБ`,
                      autoClose: 5000,
                    });
                    return;
                  }

                  if (!FILE_NAME_REGEX.test(file.name)) {
                    notifications.show({
                      color: "red",
                      title: "Недопустимое имя файла",
                      message:
                        "Имя файла должно содержать только английские буквы, цифры, точки, дефисы или подчёркивания",
                    });
                    return;
                  }

                  validFiles.push({
                    file,
                    preview: URL.createObjectURL(file),
                  });
                });

                if (validFiles.length) {
                  onFilesAdd(validFiles);
                }
              }}
            />
          </label>
          <div className="flex justify-center items-center">
            <p className="text-white font-semibold">Макс. размер файла: 5МБ</p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <p className="text-white mb-3">
              Выбрано изображений: {selectedFiles.length}
            </p>

            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
              {selectedFiles.map((item, index) => (
                <div
                  key={item.preview}
                  className="relative group overflow-hidden"
                >
                  <img
                    src={item.preview}
                    alt=""
                    className="w-full h-32 object-cover"
                  />

                  <div className="p-1"></div>
                  <GalleryButton
                    onClick={() => onFileRemove(index)}
                    color="red"
                  >
                    Удалить
                  </GalleryButton>

                  <p className="text-white text-xs p-2 truncate bg-gray-900 bg-opacity-75">
                    {item.file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <GalleryButton color="gray" onClick={onClose}>
            Отмена
          </GalleryButton>

          <GalleryButton
            color="blue"
            disabled={!selectedFiles.length || isPending}
            onClick={onUpload}
          >
            {isPending ? "Загрузка..." : `Загрузить (${selectedFiles.length})`}
          </GalleryButton>
        </div>
      </div>
    </div>
  );
};
