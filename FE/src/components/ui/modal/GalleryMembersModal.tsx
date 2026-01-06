import { useState } from "react";
import { IconTrash, IconEdit, IconX } from "@tabler/icons-react";
import { GalleryButton } from "@/components/ui/auth/GalleryButton";
import {
  type GalleryMember,
  GalleryRole,
  addGalleryMember,
  updateGalleryMemberRole,
  removeGalleryMember,
  getGalleryMembers,
} from "@/api/galleryApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormNotification } from "@/components/ui/auth/FormNotification";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addGalleryMemberSchema,
  type AddGalleryMemberSchema,
} from "../../schemas/addGalleryMemberSchema";

interface GalleryMembersModalProps {
  isOpen: boolean;
  galleryId: string;
  isOwner: boolean;
  onClose: () => void;
}

export const GalleryMembersModal = ({
  isOpen,
  galleryId,
  isOwner,
  onClose,
}: GalleryMembersModalProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  // const [email, setEmail] = useState("");
  // const [role, setRole] = useState<GalleryRole>(GalleryRole.VIEW_ONLY);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<GalleryRole>(
    GalleryRole.VIEW_ONLY
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddGalleryMemberSchema>({
    resolver: zodResolver(addGalleryMemberSchema),
    defaultValues: {
      role: GalleryRole.VIEW_ONLY,
    },
  });

  const [notification, setNotification] = useState({
    message: "",
    color: "green" as "red" | "green",
    visible: false,
  });

  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery<GalleryMember[]>({
    queryKey: ["gallery-members", galleryId],
    queryFn: () => getGalleryMembers(galleryId),
    enabled: isOpen && !!galleryId,
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: GalleryRole }) =>
      addGalleryMember(galleryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-members", galleryId],
      });
      reset();
      setShowAddForm(false);
      setNotification({
        message: "Участник успешно добавлен",
        color: "green",
        visible: true,
      });
    },
    onError: (error: any) => {
      setNotification({
        message:
          error.response?.data?.message || "Ошибка при добавлении участника",
        color: "red",
        visible: true,
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: GalleryRole }) =>
      updateGalleryMemberRole(galleryId, memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-members", galleryId],
      });
      setEditingMemberId(null);
      setNotification({
        message: "Роль успешно изменена",
        color: "green",
        visible: true,
      });
    },
    onError: (error: any) => {
      setNotification({
        message: error.response?.data?.message || "Ошибка при изменении роли",
        color: "red",
        visible: true,
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeGalleryMember(galleryId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["gallery-members", galleryId],
      });
      setNotification({
        message: "Участник успешно удален",
        color: "green",
        visible: true,
      });
    },
    onError: (error: any) => {
      setNotification({
        message:
          error.response?.data?.message || "Ошибка при удалении участника",
        color: "red",
        visible: true,
      });
    },
  });

  const handleAddMember = (data: AddGalleryMemberSchema) => {
    addMemberMutation.mutate(data);
  };

  const handleStartEdit = (member: GalleryMember) => {
    setEditingMemberId(member.id);
    setEditingRole(member.role);
  };

  const handleSaveEdit = (memberId: string) => {
    updateRoleMutation.mutate({ memberId, role: editingRole });
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
  };

  const getRoleLabel = (role: GalleryRole) => {
    return role === GalleryRole.FULL_ACCESS
      ? "Полный доступ"
      : "Только просмотр";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xl bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Участники галереи</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IconX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <FormNotification
            visible={notification.visible}
            message={notification.message}
            color={notification.color}
            onClose={() =>
              setNotification((prev) => ({ ...prev, visible: false }))
            }
          />

          {isOwner && (
            <div className="mb-6">
              {!showAddForm ? (
                <GalleryButton
                  color="blue"
                  onClick={() => setShowAddForm(true)}
                >
                  Добавить участника
                </GalleryButton>
              ) : (
                <form
                  onSubmit={handleSubmit(handleAddMember)}
                  className="bg-gray-700 p-4 rounded-lg space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Email пользователя
                    </label>

                    <input
                      type="email"
                      placeholder="user@example.com"
                      {...register("email")}
                      className="w-full px-4 py-2 bg-gray-900 border rounded-lg
        focus:border-purple-500 focus:ring-2 focus:ring-purple-500
        focus:ring-opacity-30 outline-none text-white placeholder-gray-500
        ${errors.email ? 'border-red-500' : 'border-gray-600'}"
                    />

                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Роль
                    </label>

                    <select
                      {...register("role")}
                      className="w-full px-4 py-2 pr-10 bg-gray-900 border border-gray-600 rounded-lg text-white appearance-none"
                    >
                      <option value={GalleryRole.VIEW_ONLY}>
                        Только просмотр
                      </option>
                      <option value={GalleryRole.FULL_ACCESS}>
                        Полный доступ
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 top-7 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <GalleryButton
                      color="green"
                      disabled={addMemberMutation.isPending}
                    >
                      {addMemberMutation.isPending
                        ? "Добавление..."
                        : "Добавить"}
                    </GalleryButton>

                    <GalleryButton
                      color="gray"
                      onClick={() => {
                        reset();
                        setShowAddForm(false);
                      }}
                    >
                      Отмена
                    </GalleryButton>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="space-y-3">
            {isLoading ? (
              <p className="text-gray-400 text-center py-4">Загрузка...</p>
            ) : members.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Нет участников в этой галереи
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold">
                        {member.user?.email || "Неизвестный пользователь"}
                      </p>
                      {editingMemberId === member.id ? (
                        <select
                          value={editingRole}
                          onChange={(e) =>
                            setEditingRole(e.target.value as GalleryRole)
                          }
                          className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                        >
                          <option value={GalleryRole.VIEW_ONLY}>
                            Только просмотр
                          </option>
                          <option value={GalleryRole.FULL_ACCESS}>
                            Полный доступ
                          </option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                          {getRoleLabel(member.role)}
                        </span>
                      )}
                    </div>
                    {(member.user?.firstname || member.user?.lastname) && (
                      <p className="text-gray-400 text-sm">
                        {member.user?.firstname} {member.user?.lastname}
                      </p>
                    )}
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      {editingMemberId === member.id ? (
                        <>
                          <GalleryButton
                            onClick={() => handleSaveEdit(member.id)}
                            disabled={updateRoleMutation.isPending}
                            color="green"
                          >
                            Сохранить
                          </GalleryButton>
                          <GalleryButton onClick={handleCancelEdit} color="red">
                            Отмена
                          </GalleryButton>
                        </>
                      ) : (
                        <>
                          <GalleryButton
                            onClick={() => handleStartEdit(member)}
                            color="blue"
                          >
                            <IconEdit size={20} />
                          </GalleryButton>
                          <GalleryButton
                            onClick={() =>
                              removeMemberMutation.mutate(member.id)
                            }
                            disabled={removeMemberMutation.isPending}
                            color="red"
                          >
                            <IconTrash size={20} />
                          </GalleryButton>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-700">
          <GalleryButton color="gray" onClick={onClose}>
            Закрыть
          </GalleryButton>
        </div>
      </div>
    </div>
  );
};
