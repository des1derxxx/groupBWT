import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./loginApi";
import { loginSchema } from "../../../components/schemas/authSchemas";
import type { LoginFormData } from "../../../components/schemas/authSchemas";
import { FormInput } from "../../../components/ui/auth/FormInput";
import { SubmitButton } from "../../../components/ui/auth/SubmitButton";
import { FormNotification } from "../../../components/ui/auth/FormNotification";

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const [notification, setNotification] = useState({
    message: "",
    color: "green" as "red" | "green",
    visible: false,
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data: any) => {
      localStorage.setItem("access_token", data.access_token);
      setNotification({
        message: "Вход выполнен успешно!",
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

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit(onSubmit)();
    }
  };

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
                С возвращением
              </h1>
              <p className="text-gray-400 text-lg">Войдите в свой аккаунт</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormInput
                name="email"
                label="Электронная почта"
                type="text"
                placeholder="ivan@example.com"
                register={register}
                error={errors.email}
                touched={touchedFields.email}
                onKeyPress={handleKeyPress}
              />

              <FormInput
                name="password"
                label="Пароль"
                type="password"
                placeholder="Введите пароль"
                register={register}
                error={errors.password}
                touched={touchedFields.password}
                onKeyPress={handleKeyPress}
              />

              <SubmitButton
                isLoading={mutation.isPending}
                loadingText="Вход..."
              >
                Войти
              </SubmitButton>

              <div className="text-center mt-6">
                <p className="text-gray-400">
                  Нет аккаунта?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Зарегистрироваться
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

export default Login;
