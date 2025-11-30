import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { changeUserData, getUserData } from "./profileApi";
import { profileSchema } from "../../components/schemas/authSchemas";
import type { ProfileFormData } from "../../components/schemas/authSchemas";
import { FormInput } from "../../components/ui/auth/FormInput";
import { SubmitButton } from "../../components/ui/auth/SubmitButton";
import { FormNotification } from "../../components/ui/auth/FormNotification";

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [initialEmail, setInitialEmail] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    color: "green" as "red" | "green",
    visible: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userData"],
    queryFn: getUserData,
    retry: false,
  });

  useEffect(() => {
    if (userData) {
      reset({
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        password: "",
        confirmPassword: "",
      });
      setInitialEmail(userData.email);
      setUserId(userData.id);
    }
  }, [userData, reset]);

  const mutation = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) =>
      changeUserData(userId, data),
    onSuccess: (_data, variables) => {
      const emailChanged = variables.email !== initialEmail;
      const passwordChanged = !!variables.password;

      if (emailChanged || passwordChanged) {
        localStorage.removeItem("access_token");
        setNotification({
          message: "Данные обновлены. Войдите заново с новыми данными.",
          color: "green",
          visible: true,
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setNotification({
          message: "Данные успешно обновлены!",
          color: "green",
          visible: true,
        });
        reset({
          ...variables,
          password: "",
          confirmPassword: "",
        });
      }
    },
    onError: (error: any) => {
      setNotification({
        message: error.response?.data?.message || error.message,
        color: "red",
        visible: true,
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    const dataToUpdate: Partial<ProfileFormData> = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
    };

    if (data.password && data.password.length > 0) {
      dataToUpdate.password = data.password;
    }

    mutation.mutate(dataToUpdate);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const fields = [
    {
      name: "firstname" as const,
      label: "Имя",
      type: "text",
      placeholder: "Иван",
    },
    {
      name: "lastname" as const,
      label: "Фамилия",
      type: "text",
      placeholder: "Иванов",
    },
    {
      name: "email" as const,
      label: "Электронная почта",
      type: "text",
      placeholder: "ivan@example.com",
    },
    {
      name: "password" as const,
      label: "Новый пароль (оставьте пустым, если не хотите менять)",
      type: "password",
      placeholder: "Оставьте пустым, чтобы не менять",
    },
    {
      name: "confirmPassword" as const,
      label: "Подтвердите новый пароль",
      type: "password",
      placeholder: "Повторите пароль",
    },
  ];

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <>
      <FormNotification
        visible={notification.visible}
        message={notification.message}
        color={notification.color}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
      />

      <div className="grow bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="w-full max-w-2xl p-10">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-700">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Профиль
                </h1>
                <p className="text-gray-400 text-lg">
                  Обновите свои личные данные
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-300"
              >
                Выйти
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {fields.map((field) => (
                <FormInput
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  register={register}
                  error={errors[field.name]}
                  touched={touchedFields[field.name]}
                />
              ))}

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-xl p-4 mt-6">
                <p className="text-yellow-300 text-sm">
                  <strong>Важно:</strong> При изменении email или пароля вам
                  потребуется войти заново с новыми данными.
                </p>
              </div>

              <SubmitButton
                isLoading={mutation.isPending}
                loadingText="Сохранение..."
              >
                Сохранить изменения
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
