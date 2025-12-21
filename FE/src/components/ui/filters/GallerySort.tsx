import type { FC } from "react";
import { GalleryButton } from "../auth/GalleryButton";

export type SortByOption = "createdAt" | "title" | "imagesCount";
export type OrderOption = "asc" | "desc";

interface GallerySortProps {
  sortBy: SortByOption;
  order: OrderOption;
  onSortByChange: (value: SortByOption) => void;
  onOrderChange: (value: OrderOption) => void;
}

export const GallerySort: FC<GallerySortProps> = ({
  sortBy,
  order,
  onSortByChange,
  onOrderChange,
}) => {
  const toggleOrder = () => onOrderChange(order === "asc" ? "desc" : "asc");
  return (
    <div className="flex items-end gap-2">
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortByOption)}
          className="appearance-none rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2 text-sm"
        >
          <option value="createdAt">Дата создания</option>
          <option value="title">Название</option>
          <option value="imagesCount">Кол-во изображений</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white">
          ↓
        </span>
      </div>

      <GalleryButton onClick={toggleOrder} color="black">
        {order === "asc" ? "↑" : "↓"}
      </GalleryButton>
    </div>
  );
};
