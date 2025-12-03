import React from "react";
import type { UseFormRegister, FieldError } from "react-hook-form";

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  touched?: boolean;
  register: UseFormRegister<any>;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  multiline?: boolean;
  rows?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  error,
  touched,
  register,
  onKeyPress,
  multiline = false,
  rows = 4,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...register(name)}
          rows={rows}
          className={`w-full px-5 py-3 bg-gray-900 bg-opacity-50 border whitespace-pre-wrap ${
            error && touched ? "border-red-500" : "border-gray-600"
          } rounded-xl focus:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-30 outline-none transition-all duration-300 text-white placeholder-gray-500`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          onKeyPress={onKeyPress}
          className={`w-full px-5 py-3 bg-gray-900 bg-opacity-50 border ${
            error && touched ? "border-red-500" : "border-gray-600"
          } rounded-xl focus:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-30 outline-none transition-all duration-300 text-white placeholder-gray-500`}
          placeholder={placeholder}
        />
      )}
      {error && touched && (
        <p className="text-red-400 text-xs mt-1">{error.message}</p>
      )}
    </div>
  );
};
