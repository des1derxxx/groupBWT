import { useState } from "react";
import type { FC } from "react";

interface Props {
  onSend: (message: string) => void;
}

export const ChatInput: FC<Props> = ({ onSend }) => {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Написать сообщение..."
        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 
                   focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50
                   placeholder-gray-400 transition-all"
      />
      <button
        onClick={submit}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white 
                   font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 
                   transition-all duration-200 shadow-lg hover:shadow-purple-500/50
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        Отправить
      </button>
    </div>
  );
};