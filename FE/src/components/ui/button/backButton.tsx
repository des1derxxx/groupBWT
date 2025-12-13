import { IconArrowLeft } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom";



export const BackButton = () => { 
    const navigate = useNavigate();
return ( 
    <button
    onClick={() => navigate(-1)}
    className="absolute top-6 left-6 hover:text-gray-400 transition-colors cursor-pointer"
  >
    <IconArrowLeft />
  </button>
)
}