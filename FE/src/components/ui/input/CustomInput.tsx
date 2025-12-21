import type { FC, InputHTMLAttributes } from "react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  type?: "text" | "number" | "date";
}

export const CustomInput: FC<CustomInputProps> = ({
  error,
  label,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      )}
      <input
        {...props}
        className={`w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    transition-all ${error ? "border-red-500" : ""} ${className ?? ""}`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};
