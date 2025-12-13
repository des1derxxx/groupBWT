import api from "@/lib/axios";

export interface updateData {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}

export const changeUserData = async (userId: string, data: updateData) => {
  const response = await api.patch(`/users/${userId}`, data);
  return response.data;
};

export const getUserData = async () => {
  const response = await api.get(`/users/profile`);
  return response.data;
};
