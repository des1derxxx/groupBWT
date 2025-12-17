import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 hover:text-green-400 hover:-translate-x-1 !bg-purple-600 text-white transition-all duration-300 font-medium group"
    >
      <IconArrowLeft
        className="group-hover:-translate-x-5 transition-transform duration-300"
        size={20}
      />
    </button>
  );
};
