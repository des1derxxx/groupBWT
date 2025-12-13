import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/api/loginApi";
import { loginSchema } from "@/components/schemas/authSchemas";
import type { LoginFormData } from "@/components/schemas/authSchemas";
import { FormInput } from "@/components/ui/auth/FormInput";
import { SubmitButton } from "@/components/ui/auth/SubmitButton";
import { FormNotification } from "@/components/ui/auth/FormNotification";
import FormWrapper from "@/components/ui/auth/FormWrapper";

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
      setTimeout(() => navigate("/gallery"), 1000);
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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
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

      <FormWrapper
        title="С возвращением"
        description="Войдите в свой аккаунт"
        hasHeader={false}
        bottom={{
          text: "Нет аккаунта?",
          buttonLabel: "Зарегистрироваться",
          buttonOnClick: () => navigate("/register"),
        }}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5" noValidate>
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

          <SubmitButton isLoading={mutation.isPending} loadingText="Вход...">
            Войти
          </SubmitButton>
        </form>
      </FormWrapper>
    </>
  );
};

export default Login;
