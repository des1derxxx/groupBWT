import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email обязателен")
    .email("Введите корректный email адрес"),
  password: z.string().min(1, "Введите пароль"),
});

const baseUserSchema = z.object({
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
});

export const registerSchema = baseUserSchema
  .refine((data) => data.password && data.password.length > 0, {
    message: "Пароль обязателен",
    path: ["password"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const profileSchema = baseUserSchema.refine(
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

export type FormField = {
  name: "firstname" | "lastname" | "email" | "password" | "confirmPassword";
  label: string;
  type: "text" | "password";
  placeholder: string;
};

const baseFields: Omit<FormField, "label" | "placeholder">[] = [
  {
    name: "firstname",
    type: "text",
  },
  {
    name: "lastname",
    type: "text",
  },
  {
    name: "email",
    type: "text",
  },
  {
    name: "password",
    type: "password",
  },
  {
    name: "confirmPassword",
    type: "password",
  },
];

const registerFieldConfig = {
  firstname: { label: "Имя", placeholder: "Иван" },
  lastname: { label: "Фамилия", placeholder: "Иванов" },
  email: { label: "Электронная почта", placeholder: "ivan@example.com" },
  password: { label: "Пароль", placeholder: "Минимум 8 символов" },
  confirmPassword: { label: "Подтвердите пароль", placeholder: "Повторите пароль" },
};

const profileFieldConfig = {
  firstname: { label: "Имя", placeholder: "Иван" },
  lastname: { label: "Фамилия", placeholder: "Иванов" },
  email: { label: "Электронная почта", placeholder: "ivan@example.com" },
  password: {
    label: "Новый пароль (оставьте пустым, если не хотите менять)",
    placeholder: "Оставьте пустым, чтобы не менять",
  },
  confirmPassword: {
    label: "Подтвердите новый пароль",
    placeholder: "Повторите пароль",
  },
};

function createFormFields(config: typeof registerFieldConfig): FormField[] {
  return baseFields.map((field) => ({
    ...field,
    ...config[field.name],
  })) as FormField[];
}

export const registerFields = createFormFields(registerFieldConfig);
export const profileFields = createFormFields(profileFieldConfig);