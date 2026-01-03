import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChat } from "../../../../hooks/useChat";

export const Chat = () => {
  const { messages, loading, loadingOlder, hasMore, sendMessage, loadOlderMessages, connected } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLoadOlder = () => {
    const container = messagesContainerRef.current;
    if (!container) {
      loadOlderMessages();
      return;
    }

    const scrollHeightBefore = container.scrollHeight;
    loadOlderMessages().then(() => {
      setTimeout(() => {
        if (container) {
          const scrollHeightAfter = container.scrollHeight;
          const heightDifference = scrollHeightAfter - scrollHeightBefore;
          container.scrollTop = container.scrollTop + heightDifference;
        }
      }, 0);
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-400">
            Чат
          </h1>
          {connected && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Подключено</span>
            </div>
          )}
        </div>
        <div className="flex-1 bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl sm:rounded-3xl 
                        shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-2"
          >
            {loading && (
              <div className="text-center py-8">
                <p className="text-white text-xl">Загрузка...</p>
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-300 text-lg">Нет сообщений</p>
                <p className="text-gray-400 text-sm mt-2">Начните общение первым!</p>
              </div>
            )}
            {!loading && hasMore && messages.length > 0 && (
              <div className="text-center py-2">
                <button
                  onClick={handleLoadOlder}
                  disabled={loadingOlder}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                           text-sm font-medium"
                >
                  {loadingOlder ? "Загрузка..." : "Загрузить еще"}
                </button>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 sm:p-6 border-t border-gray-700 bg-gray-800 bg-opacity-80">
            <ChatInput onSend={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};
