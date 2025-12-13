import { GalleryButton } from "../auth/GalleryButton"
import type { FC } from "react";

interface CorfirmDeleteProps { 
    cancelDelete: () =>  void
    confirmDelete: () => void
}

export const CorfirmDelete: FC<CorfirmDeleteProps> =({cancelDelete , confirmDelete}) => { 
return ( 
    <div>
<div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-1000">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 text-center">
            <h2 className="text-xl font-bold text-white mb-4">
              Подтвердите удаление
            </h2>
            <p className="text-gray-300 mb-6">
              Вы уверены, что хотите удалить картинку?
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
    </div>
)
}