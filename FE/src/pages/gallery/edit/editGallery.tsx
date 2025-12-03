import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormInput } from "../../../components/ui/auth/FormInput";
import {
  editOneGallery,
  getOneGallery,
  type GalleryItem,
  type AddOneGallery,
} from "../galleryApi";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  addGallerySchema,
  type AddGallerySchema,
} from "../../../components/schemas/addGallerySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitButton } from "../../../components/ui/auth/SubmitButton";

const EditGallery = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  // const [initialData, setInitialData] = useState<GalleryItem | null>(null);

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

  const { data: gallery } = useQuery<GalleryItem>({
    queryKey: ["gallery", id],
    queryFn: () => getOneGallery(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<AddGallerySchema>({
    resolver: zodResolver(addGallerySchema),
    mode: "onBlur",
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddOneGallery }) =>
      editOneGallery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllGallery"] });
    },
  });

  const onSubmit = (data: AddGallerySchema) => {
    if (!id) return;
    editMutation.mutate({
      id: id,
      data: data,
    });
  };

  useEffect(() => {
    if (gallery) {
      reset({
        title: gallery.title,
        description: gallery.description,
      });
      // setInitialData(gallery);
    }
  }, [gallery, reset]);
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
                  isLoading={editMutation.isPending}
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

export default EditGallery;
