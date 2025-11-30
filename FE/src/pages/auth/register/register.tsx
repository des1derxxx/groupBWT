import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./registerApi";
import { registerSchema } from "../../../components/schemas/authSchemas";
import type { RegisterFormData } from "../../../components/schemas/authSchemas";
import { FormInput } from "../../../components/ui/auth/FormInput";
import { SubmitButton } from "../../../components/ui/auth/SubmitButton";
import { FormNotification } from "../../../components/ui/auth/FormNotification";

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const [notification, setNotification] = useState({
    message: "",
    color: "green" as "red" | "green",
    visible: false,
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data: any) => {
      localStorage.setItem("access_token", data.access_token);
      setNotification({
        message: "Регистрация успешна!",
        color: "green",
        visible: true,
      });
      setTimeout(() => navigate("/gallery"), 1500);
    },
    onError: (error: any) => {
      setNotification({
        message: error.response?.data?.message || error.message,
        color: "red",
        visible: true,
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    mutation.mutate(registerData);
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
      label: "Пароль",
      type: "password",
      placeholder: "Минимум 8 символов",
    },
    {
      name: "confirmPassword" as const,
      label: "Подтвердите пароль",
      type: "password",
      placeholder: "Повторите пароль",
    },
  ];

  return (
    <>
      <FormNotification
        visible={notification.visible}
        message={notification.message}
        color={notification.color}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
      />

      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 overflow-auto">
        <div className="relative w-full max-w-md my-8">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                Добро пожаловать
              </h1>
              <p className="text-gray-400 text-lg">Создайте новый аккаунт</p>
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

              <SubmitButton
                isLoading={mutation.isPending}
                loadingText="Регистрация..."
              >
                Зарегистрироваться
              </SubmitButton>

              <div className="text-center mt-6">
                <p className="text-gray-400">
                  Уже есть аккаунт?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Войти
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
