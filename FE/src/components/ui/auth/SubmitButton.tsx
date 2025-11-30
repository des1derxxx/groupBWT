import React from "react";

interface SubmitButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading = false,
  loadingText = "Загрузка...",
  children,
  disabled = false,
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-purple-500/50 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? loadingText : children}
    </button>
  );
};
