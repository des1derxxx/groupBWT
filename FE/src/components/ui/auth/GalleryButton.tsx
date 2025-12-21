import React from "react";

interface GalleryButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  color?: "red" | "green" | "blue" | "purple" | "gray";
}

export const GalleryButton: React.FC<GalleryButtonProps> = ({
  isLoading = false,
  loadingText = "Загрузка...",
  children,
  disabled = false,
  onClick,
  color = "red",
}) => {
  const gradientClass = {
    red: "from-red-500 to-red-300 hover:from-red-500 hover:to-red-400 hover:shadow-red-500/50",
    green:
      "from-green-500 to-green-300 hover:from-green-500 hover:to-green-400 hover:shadow-green-500/50",
    blue: "from-blue-500 to-blue-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/50",
    purple:
      "from-purple-500 to-purple-300 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-500/50",
    gray: "from-gray-500 to-gray-300 hover:from-gray-500 hover:to-gray-400 hover:shadow-gray-500/50",
  }[color];

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`w-full py-4 rounded-xl font-bold text-lg text-white
                  bg-gradient-to-r ${gradientClass}
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-300 shadow-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};
