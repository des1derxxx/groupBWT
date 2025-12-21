import type { FC } from "react";
import { GalleryButton } from "../auth/GalleryButton";
import { CustomInput } from "../input/CustomInput";

interface GalleryFiltersPanelProps {
  fromDate?: string;
  toDate?: string;
  minImages?: number;
  maxImages?: number;
  onFromDateChange: (value?: string) => void;
  onToDateChange: (value?: string) => void;
  onMinImagesChange: (value?: number) => void;
  onMaxImagesChange: (value?: number) => void;
  onReset: () => void;
}

const Calendar = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const Image = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const GalleryFiltersPanel: FC<GalleryFiltersPanelProps> = ({
  fromDate,
  toDate,
  minImages,
  maxImages,
  onFromDateChange,
  onToDateChange,
  onMinImagesChange,
  onMaxImagesChange,
  onReset,
}) => {
  const dateValid =
    !fromDate || !toDate || new Date(fromDate) <= new Date(toDate);
  const imagesValid =
    minImages === undefined ||
    maxImages === undefined ||
    minImages <= maxImages;

  return (
    <div className="w-full h-full min-w-72 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 px-6 pt-6 pb-0 lg:pb-6 ">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
        Фильтры
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-3">
            <Calendar />
            <span>Период</span>
          </div>

          <div className="space-y-3">
            <div>
              <CustomInput
                type="date"
                label="От"
                value={fromDate ?? ""}
                max={toDate}
                onChange={(e) => onFromDateChange(e.target.value || undefined)}
                error={
                  !dateValid ? "Дата начала позже даты окончания" : undefined
                }
              />
            </div>

            <div>
              <CustomInput
                type="date"
                label="До"
                value={toDate ?? ""}
                min={fromDate}
                onChange={(e) => onToDateChange(e.target.value || undefined)}
                error={
                  !dateValid ? "Дата начала позже даты окончания" : undefined
                }
              />
            </div>
          </div>

          {!dateValid && (
            <div className="text-xs text-white flex items-center gap-1.5 bg-red-500 bg-opacity-10 rounded-lg px-3 py-2">
              <span>Дата начала позже даты окончания</span>
            </div>
          )}
        </div>
        <div className="border-t border-gray-700"></div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-3">
            <Image />
            <span>Картинок</span>
          </div>

          <div className="space-y-3">
            <div>
              <CustomInput
                type="number"
                label="Минимум"
                min={0}
                value={minImages ?? ""}
                onKeyDown={(e) =>
                  ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()
                }
                onChange={(e) =>
                  onMinImagesChange(
                    e.target.value ? +e.target.value : undefined
                  )
                }
                placeholder="0"
                error={!imagesValid ? "Минимум больше максимума" : undefined}
              />
            </div>

            <div>
              <CustomInput
                type="number"
                label="Максимум"
                min={0}
                value={maxImages ?? ""}
                onKeyDown={(e) =>
                  ["-", "e", "E", "+"].includes(e.key) && e.preventDefault()
                }
                onChange={(e) =>
                  onMaxImagesChange(
                    e.target.value ? +e.target.value : undefined
                  )
                }
                placeholder="∞"
                error={!imagesValid ? "Минимум больше максимума" : undefined}
              />
            </div>
          </div>

          {!imagesValid && (
            <div className="text-xs text-white flex items-center gap-1.5 bg-red-500 bg-opacity-10 rounded-lg px-3 py-2">
              <span>Минимум больше максимума</span>
            </div>
          )}
        </div>
        <GalleryButton onClick={onReset}>Сбросить</GalleryButton>
      </div>
    </div>
  );
};
