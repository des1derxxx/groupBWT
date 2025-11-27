import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Notification } from "@mantine/core";
import { changeUserData, getUserData } from "./profileApi";
import type { updateData } from "./profileApi";

const Profile = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string>("");

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [initialEmail, setInitialEmail] = useState("");

  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    firstname: false,
    lastname: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [notification, setNotification] = useState<{
    message: string;
    color: "red" | "green";
    visible: boolean;
  }>({ message: "", color: "green", visible: false });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData();
        setFormData({
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          password: "",
          confirmPassword: "",
        });
        setInitialEmail(userData.email);
        setUserId(userData.id);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  const mutation = useMutation({
    mutationFn: (data: updateData) => changeUserData(userId, data),
    onSuccess: (data: any) => {
      const emailChanged = formData.email !== initialEmail;
      const passwordChanged = formData.password.length > 0;

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
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
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

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstname":
      case "lastname":
        if (value.length > 0 && (value.length < 2 || value.length > 50))
          return "Длина должна быть от 2 до 50 символов";
        if (value.length > 0 && /\d/.test(value))
          return "Не должно содержать цифры";
        break;
      case "email":
        if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Введите корректный email адрес";
        break;
      case "password":
        if (value.length > 0) {
          if (value.length < 8) return "Минимум 8 символов";
          if (!/[a-z]/.test(value))
            return "Должна быть хотя бы одна строчная буква";
          if (!/[A-Z]/.test(value))
            return "Должна быть хотя бы одна заглавная буква";
          if (!/\d/.test(value)) return "Должна быть хотя бы одна цифра";
        }
        break;
      case "confirmPassword":
        if (formData.password.length > 0 && value !== formData.password)
          return "Пароли не совпадают";
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

    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          formData.confirmPassword !== value ? "Пароли не совпадают" : "",
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = () => {
    const newErrors: typeof errors = {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (key !== "confirmPassword") {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    if (formData.password.length > 0) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      if (confirmError) newErrors.confirmPassword = confirmError;
    }

    setErrors(newErrors);
    setTouched({
      firstname: true,
      lastname: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => err !== "");

    if (!hasErrors) {
      const dataToUpdate: updateData = {};
      if (formData.firstname) dataToUpdate.firstname = formData.firstname;
      if (formData.lastname) dataToUpdate.lastname = formData.lastname;
      if (formData.email) dataToUpdate.email = formData.email;
      if (formData.password) dataToUpdate.password = formData.password;

      mutation.mutate(dataToUpdate);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
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
      <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
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

            <div className="space-y-5">
              {(
                [
                  "firstname",
                  "lastname",
                  "email",
                  "password",
                  "confirmPassword",
                ] as Array<keyof typeof formData>
              ).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {field === "firstname"
                      ? "Имя"
                      : field === "lastname"
                        ? "Фамилия"
                        : field === "email"
                          ? "Электронная почта"
                          : field === "password"
                            ? "Новый пароль (оставьте пустым, если не хотите менять)"
                            : "Подтвердите новый пароль"}
                  </label>
                  <input
                    type={field.includes("password") ? "password" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-5 py-3 bg-gray-900 bg-opacity-50 border ${
                      errors[field] && touched[field]
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-xl focus:bg-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500 focus:ring-opacity-30 outline-none transition-all duration-300 text-white placeholder-gray-500`}
                    placeholder={
                      field === "firstname"
                        ? "Иван"
                        : field === "lastname"
                          ? "Иванов"
                          : field === "email"
                            ? "ivan@example.com"
                            : field === "password"
                              ? "Оставьте пустым, чтобы не менять"
                              : "Повторите пароль"
                    }
                  />
                  {errors[field] && touched[field] && (
                    <p className="text-red-400 text-xs mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}

              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-xl p-4 mt-6">
                <p className="text-yellow-300 text-sm">
                  <strong>Важно:</strong> При изменении email или пароля вам
                  потребуется войти заново с новыми данными.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl hover:shadow-purple-500/50 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
