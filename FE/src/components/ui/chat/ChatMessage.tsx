import type { FC } from "react";
import type { ChatMessage as IMessage } from "../../../api/chatApi";

interface Props {
  message: IMessage;
}

export const ChatMessage: FC<Props> = ({ message }) => {
  const username = 
    message.user.firstname || message.user.lastname
      ? `${message.user.firstname ?? ""} ${message.user.lastname ?? ""}`.trim()
      : "Anonymous";

      return (
        <div className="mb-3 p-4 bg-gray-700 rounded-xl border border-gray-600 hover:bg-gray-650 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <strong className="text-white font-semibold">{username}</strong>
            <small className="text-gray-400 text-xs">
              {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </small>
          </div>
          <div className="text-gray-300 whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      );
    };
