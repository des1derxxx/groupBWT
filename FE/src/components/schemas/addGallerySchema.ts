import { z } from "zod";

export const addGallerySchema = z.object({
  title: z
    .string()
    .min(2, "Название должно содержать минимум 2 символа")
    .max(50, "Максимальная длина — 50 символов"),

  description: z
    .string()
    .max(255, "Максимальная длина — 255 символов")
    .optional(),
});

export type AddGallerySchema = z.infer<typeof addGallerySchema>;
