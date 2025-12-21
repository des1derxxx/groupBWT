import type { FC } from "react";

interface CustomFileInputProps {
  multiple?: boolean;
  accept?: string;
  onChange: (files: FileList) => void;
  label: string;
}

export const CustomFileInput: FC<CustomFileInputProps> = ({
  multiple,
  accept,
  onChange,
  label,
}) => {
  return (
    <label className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
      {label}
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files && onChange(e.target.files)}
      />
    </label>
  );
};
