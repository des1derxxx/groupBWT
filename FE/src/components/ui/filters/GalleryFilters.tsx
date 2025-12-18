import { useState } from "react";
import { IconX } from "@tabler/icons-react";

export type SortByOption = "createdAt" | "title" | "imagesCount";
export type OrderOption = "asc" | "desc";

export interface GalleryFiltersProps {
  search: string;
  sortBy: SortByOption;
  order: OrderOption;
  fromDate: string | undefined;
  toDate: string | undefined;
  minImages: number | undefined;
  maxImages: number | undefined;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortByOption) => void;
  onOrderChange: (value: OrderOption) => void;
  onFromDateChange: (value: string | undefined) => void;
  onToDateChange: (value: string | undefined) => void;
  onMinImagesChange: (value: number | undefined) => void;
  onMaxImagesChange: (value: number | undefined) => void;
  onReset: () => void;
  cleanSearch: () => void;
}

const ChevronUp = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const ChevronDown = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export const GalleryFilters = ({
  search,
  sortBy,
  order,
  fromDate,
  toDate,
  minImages,
  maxImages,
  onSearchChange,
  onSortByChange,
  onOrderChange,
  onFromDateChange,
  onToDateChange,
  onMinImagesChange,
  onMaxImagesChange,
  onReset,
  cleanSearch,
}: GalleryFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const isDateRangeValid = () => {
    if (!fromDate || !toDate) return true;
    return new Date(fromDate) <= new Date(toDate);
  };

  const isImagesRangeValid = () => {
    if (minImages === undefined || maxImages === undefined) return true;
    return minImages <= maxImages;
  };

  const dateRangeValid = isDateRangeValid();
  const imagesRangeValid = isImagesRangeValid();

  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-xl bg-gray-700 bg-opacity-50 backdrop-blur-xl p-4 shadow-2xl border border-gray-600">
        <input
          type="text"
          placeholder="Поиск"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2.5 text-sm 
                   transition-all duration-200 placeholder-gray-400
                   focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                   hover:border-gray-500"
        />
        <IconX
          onClick={cleanSearch}
          className={`absolute right-7 top-1/2 ${search ? "visible" : "invisible"} -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer transition-colors`}
        />
      </div>

      <div className="rounded-xl bg-gray-700 bg-opacity-50 backdrop-blur-xl shadow-2xl border border-gray-600 overflow-hidden">
        <button
          onClick={() => setShowSort(!showSort)}
          className=" flex items-center justify-between px-6 py-4 hover:bg-gray-600 hover:bg-opacity-30 transition-colors"
        >
          <h3 className="text-sm font-semibold text-white">Сортировка</h3>
          <span className="text-gray-400">
            {showSort ? <ChevronUp /> : <ChevronDown />}
          </span>
        </button>

        {showSort && (
          <div className="px-6 pb-4 border-t border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 pl-1">
                  Сортировать по:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    onSortByChange(e.target.value as SortByOption)
                  }
                  className=" rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2.5 text-sm 
                           cursor-pointer transition-all duration-200
                           focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                           hover:border-gray-500"
                >
                  <option value="createdAt">Дата создания</option>
                  <option value="title">Название</option>
                  <option value="imagesCount">Кол-во изображений</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 pl-1">
                  Порядок:
                </label>
                <select
                  value={order}
                  onChange={(e) => onOrderChange(e.target.value as OrderOption)}
                  className=" rounded-lg border border-gray-600 bg-gray-800 text-white px-4 py-2.5 text-sm 
                           cursor-pointer transition-all duration-200
                           focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                           hover:border-gray-500"
                >
                  <option value="asc">По возрастанию</option>
                  <option value="desc">По убыванию</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-gray-700 bg-opacity-50 backdrop-blur-xl shadow-2xl border border-gray-600 overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className=" flex items-center justify-between px-6 py-4 hover:bg-gray-600 hover:bg-opacity-30 transition-colors"
        >
          <h3 className="text-sm font-semibold text-white">Фильтры</h3>
          <span className="text-gray-400">
            {showFilters ? <ChevronUp /> : <ChevronDown />}
          </span>
        </button>

        {showFilters && (
          <div className="px-6 pb-4 border-t border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 pl-1">
                  Дата от:
                </label>
                <input
                  type="date"
                  value={fromDate ?? ""}
                  onChange={(e) =>
                    onFromDateChange(e.target.value || undefined)
                  }
                  className={` rounded-lg border bg-gray-800 text-white px-4 py-2.5 text-sm 
                           transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-opacity-50
                           hover:border-gray-500
                           ${
                             !dateRangeValid
                               ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                               : "border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                           }`}
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 pl-1">
                  Дата до:
                </label>
                <input
                  type="date"
                  value={toDate ?? ""}
                  onChange={(e) => onToDateChange(e.target.value || undefined)}
                  className={` rounded-lg border bg-gray-800 text-white px-4 py-2.5 text-sm 
                           transition-all duration-200
                           focus:outline-none focus:ring-2 focus:ring-opacity-50
                           hover:border-gray-500
                           ${
                             !dateRangeValid
                               ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                               : "border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                           }`}
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 pl-1">
                  Мин. картинок:
                </label>
                <input
                  type="number"
                  placeholder="Мин. картинок"
                  value={minImages ?? ""}
                  onChange={(e) =>
                    onMinImagesChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  min="0"
                  className={` rounded-lg border bg-gray-800 text-white px-4 py-2.5 text-sm 
                           transition-all duration-200 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-opacity-50
                           hover:border-gray-500
                           ${
                             !imagesRangeValid
                               ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                               : "border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                           }`}
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1.5 pl-1">
                  Макс. картинок:
                </label>
                <input
                  type="number"
                  placeholder="Макс. картинок"
                  value={maxImages ?? ""}
                  onChange={(e) =>
                    onMaxImagesChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  min="0"
                  className={` rounded-lg border bg-gray-800 text-white px-4 py-2.5 text-sm 
                           transition-all duration-200 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-opacity-50
                           hover:border-gray-500
                           ${
                             !imagesRangeValid
                               ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                               : "border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                           }`}
                />
              </div>
            </div>
            {(!dateRangeValid || !imagesRangeValid) && (
              <div className="mt-4 space-y-2">
                {!dateRangeValid && (
                  <div className="flex items-center gap-2 text-red-300 text-xs bg-red-900 bg-opacity-30 px-3 py-2 rounded-lg border border-red-800">
                    <span>Дата начала не может быть позже даты окончания</span>
                  </div>
                )}
                {!imagesRangeValid && (
                  <div className="flex items-center gap-2 text-red-300 text-xs bg-red-900 bg-opacity-30 px-3 py-2 rounded-lg border border-red-800">
                    <span>
                      Минимальное количество не может быть больше максимального
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="!bg-red-600 hover:!bg-red-700 text-white font-medium py-2 px-6 rounded-lg shadow-lg transition-transform duration-200 hover:scale-105"
        >
          Сбросить
        </button>
      </div>
    </div>
  );
};

export default GalleryFilters;
