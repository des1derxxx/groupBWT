import { useForm } from "react-hook-form";
import { FormInput } from "@/components/ui/auth/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { addOneGallery } from "@/api/galleryApi";
import {
  addGallerySchema,
  type AddGallerySchema,
} from "@/components/schemas/addGallerySchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SubmitButton } from "@/components/ui/auth/SubmitButton";

const AddGallery = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fields = [
    {
      name: "title" as const,
      label: "Заголовок",
      type: "text",
      placeholder: "Заголовок",
    },
    {
      name: "description" as const,
      label: "Описание",
      type: "text",
      placeholder: "Описание",
      multiline: true,
      rows: 5,
    },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<AddGallerySchema>({
    resolver: zodResolver(addGallerySchema),
    mode: "onBlur",
  });

  const addMutation = useMutation({
    mutationFn: addOneGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllGallery"] });
      reset();
      navigate("/gallery");
    },
  });

  const onSubmit = (data: AddGallerySchema) => {
    addMutation.mutate(data);
  };

  return (
    <div className="grow bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="w-full max-w-2xl p-10">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 text-center">
                Добавление в галерею
              </h1>

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
                    multiline={field.multiline}
                    rows={field.rows}
                  />
                ))}

                <SubmitButton
                  isLoading={addMutation.isPending}
                  loadingText="Сохранение..."
                >
                  Сохранить изменения
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGallery;
