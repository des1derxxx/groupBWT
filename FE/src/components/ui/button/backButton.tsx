import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-3 left-3 sm:top-6 sm:left-6 z-50 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 hover:text-green-400 hover:-translate-x-1 !bg-purple-600 text-white transition-all duration-300 font-medium group rounded-lg shadow-lg"
    >
      <IconArrowLeft
        className="group-hover:-translate-x-1 transition-transform duration-300"
        size={20}
      />
    </button>
  );
};
