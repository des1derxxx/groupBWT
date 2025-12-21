import type { FC } from "react";

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
    <div className="flex items-end gap-2 mb-2">
      <div>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortByOption)}
          className="rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2 text-sm"
        >
          <option value="createdAt">Дата создания</option>
          <option value="title">Название</option>
          <option value="imagesCount">Кол-во изображений</option>
        </select>
      </div>

      <button
        onClick={toggleOrder}
        className="h-[38px] w-[38px] flex items-center justify-center rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition text-white"
        title={order === "asc" ? "По возрастанию" : "По убыванию"}
      >
        {order === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
};
