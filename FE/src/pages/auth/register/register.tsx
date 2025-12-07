import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { registerUser, type RegisterData } from "@/api/registerApi";
import { registerSchema, registerFields } from "@/components/schemas/authSchemas";
import type { RegisterFormData } from "@/components/schemas/authSchemas";
import { FormInput } from "@/components/ui/auth/FormInput";
import { SubmitButton } from "@/components/ui/auth/SubmitButton";
import { FormNotification } from "@/components/ui/auth/FormNotification";
import FormWrapper from "@/components/ui/auth/FormWrapper";

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
    if (!data.password) {
      return;
    }
  
    const registerData: RegisterData = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
    };

    
    mutation.mutate(registerData);
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
        title="Добро пожаловать"
        hasHeader={false}
        description="Создайте новый аккаунт"
        bottom={{
          text: "Уже есть аккаунт?",
          buttonLabel: "Войти",
          buttonOnClick: () => navigate("/login"),
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {registerFields.map((field) => (
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
        </form>
      </FormWrapper>
    </>
  );
};

export default Register;
