import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email обязателен")
    .email("Введите корректный email адрес"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z
  .object({
    firstname: z
      .string()
      .min(2, "Длина должна быть от 2 до 50 символов")
      .max(50, "Длина должна быть от 2 до 50 символов")
      .regex(/^[^\d]+$/, "Не должно содержать цифры"),
    lastname: z
      .string()
      .min(2, "Длина должна быть от 2 до 50 символов")
      .max(50, "Длина должна быть от 2 до 50 символов")
      .regex(/^[^\d]+$/, "Не должно содержать цифры"),
    email: z
      .string()
      .min(1, "Email обязателен")
      .email("Введите корректный email адрес"),
    password: z
      .string()
      .min(8, "Минимум 8 символов")
      .regex(/[a-z]/, "Должна быть хотя бы одна строчная буква")
      .regex(/[A-Z]/, "Должна быть хотя бы одна заглавная буква")
      .regex(/\d/, "Должна быть хотя бы одна цифра"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const profileSchema = z
  .object({
    firstname: z
      .string()
      .min(2, "Длина должна быть от 2 до 50 символов")
      .max(50, "Длина должна быть от 2 до 50 символов")
      .regex(/^[^\d]+$/, "Не должно содержать цифры"),
    lastname: z
      .string()
      .min(2, "Длина должна быть от 2 до 50 символов")
      .max(50, "Длина должна быть от 2 до 50 символов")
      .regex(/^[^\d]+$/, "Не должно содержать цифры"),
    email: z
      .string()
      .min(1, "Email обязателен")
      .email("Введите корректный email адрес"),
    password: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.length === 0) return true;
          return val.length >= 8;
        },
        { message: "Минимум 8 символов" }
      )
      .refine(
        (val) => {
          if (!val || val.length === 0) return true;
          return /[a-z]/.test(val);
        },
        { message: "Должна быть хотя бы одна строчная буква" }
      )
      .refine(
        (val) => {
          if (!val || val.length === 0) return true;
          return /[A-Z]/.test(val);
        },
        { message: "Должна быть хотя бы одна заглавная буква" }
      )
      .refine(
        (val) => {
          if (!val || val.length === 0) return true;
          return /\d/.test(val);
        },
        { message: "Должна быть хотя бы одна цифра" }
      ),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Пароли не совпадают",
      path: ["confirmPassword"],
    }
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
