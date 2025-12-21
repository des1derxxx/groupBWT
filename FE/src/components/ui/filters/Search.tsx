import type { FC } from "react";
import { IconX } from "@tabler/icons-react";

interface SearcProps {
  search: string;
  onSearchChange: (value: string) => void;
  cleanSearch: () => void;
}

const Search: FC<SearcProps> = ({ search, onSearchChange, cleanSearch }) => {
  return (
    <div className="w-full rounded-xl  bg-opacity-50 relative">
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
        className={`${search ? "visible" : "invisible"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer transition-colors`}
      />
    </div>
  );
};

export default Search;
