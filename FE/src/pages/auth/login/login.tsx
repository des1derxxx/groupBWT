import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Notification } from "@mantine/core";
import { loginUser } from "./loginApi";
import type { LoginData } from "./loginApi";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [notification, setNotification] = useState<{
    message: string;
    color: "red" | "green";
    visible: boolean;
  }>({ message: "", color: "green", visible: false });

  const mutation = useMutation({
    mutationFn: (data: LoginData) => loginUser(data),
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

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Введите корректный email адрес";
        break;
      case "password":
        if (value.length < 1) return "Введите пароль";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {
      email: "",
      password: "",
    };

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => err !== "");

    if (!hasErrors) {
      mutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      {notification.visible && (
        <Notification
          color={notification.color}
          onClose={() =>
            setNotification((prev) => ({ ...prev, visible: false }))
          }
          title={notification.color === "green" ? "Успех" : "Ошибка"}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          {notification.message}
        </Notification>
      )}
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 overflow-auto">
        <div className="relative w-full max-w-md my-8">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                С возвращением
              </h1>
              <p className="text-gray-400 text-lg">Войдите в свой аккаунт</p>
            </div>

            <div className="space-y-5">
              {(["email", "password"] as Array<keyof typeof formData>).map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      {field === "email" ? "Электронная почта" : "Пароль"}
                    </label>
                    <input
                      type={field === "password" ? "password" : "text"}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-5 py-3 bg-gray-900 bg-opacity-50 border ${
                        errors[field] && touched[field]
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-xl focus:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-30 outline-none transition-all duration-300 text-white placeholder-gray-500`}
                      placeholder={
                        field === "email"
                          ? "ivan@example.com"
                          : "Введите пароль"
                      }
                    />
                    {errors[field] && touched[field] && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                )
              )}

              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-purple-500/50 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Вход..." : "Войти"}
              </button>

              <div className="text-center mt-6">
                <p className="text-gray-400">
                  Нет аккаунта?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
