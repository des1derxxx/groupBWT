import { GalleryRole } from "@/api/galleryApi";
import { z } from "zod";

export const addGalleryMemberSchema = z.object({
  email: z
    .string()
    .min(1, "Email обязателен")
    .email("Введите корректный email"),
  role: z.nativeEnum(GalleryRole),
});

export type AddGalleryMemberSchema = z.infer<typeof addGalleryMemberSchema>;
