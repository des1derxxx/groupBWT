import api from "@/lib/axios";

export interface ChatUser {
  id: string;
  firstname?: string;
  lastname?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: ChatUser;
}

export const ChatApi = {
  getMessages: (cursor?: string) =>
    api.get("/chat/messages", {
      params: { limit: 50, cursor },
    }),

  sendMessage: (content: string) => api.post("/chat/message", { content }),
};
