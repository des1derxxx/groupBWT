import type { FC } from "react";
import { IconX } from "@tabler/icons-react";
import { CustomInput } from "../input/CustomInput";

interface SearcProps {
  search: string;
  onSearchChange: (value: string) => void;
  cleanSearch: () => void;
}

const Search: FC<SearcProps> = ({ search, onSearchChange, cleanSearch }) => {
  return (
    <div className="w-full rounded-xl  bg-opacity-50 relative">
      <CustomInput
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Поиск"
        className="pr-10"
      />
      <IconX
        onClick={cleanSearch}
        className={`${search ? "visible" : "invisible"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer transition-colors`}
      />
    </div>
  );
};

export default Search;
