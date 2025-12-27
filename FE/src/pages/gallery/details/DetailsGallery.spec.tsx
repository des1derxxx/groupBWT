import * as api from "@/api/galleryApi";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import DetailsGallery from "./detailsGallery";
import "@testing-library/jest-dom";
jest.mock("@/api/galleryApi");

const mockGallery = {
  id: "gallery-1",
  title: "Моя Галерея",
  description: "Описание тестовой галереи",
  createdAt: "2025-01-01T00:00:00Z",
  imagesCount: 2,
};

const mockImagesResponse = {
  data: {
    images: [
      { id: "img-1", url: "test1.jpg", filename: "photo1.jpg" },
      { id: "img-2", url: "test2.jpg", filename: "photo2.jpg" },
    ],
    totalPages: 1,
    totalImages: 2,
  },
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

const renderDetailsGallery = () => {
  const queryClient = createTestQueryClient();
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/gallery/gallery-1"]}>
          <Routes>
            <Route path="/gallery/:id" element={<DetailsGallery />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("DetailsGallery Page Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.getOneGallery as jest.Mock).mockResolvedValue(mockGallery);
    (api.getImages as jest.Mock).mockResolvedValue(mockImagesResponse);
    (api.getAllGalleryUser as jest.Mock).mockResolvedValue({
      data: [mockGallery],
      totalPages: 1,
    });
  });

  it("должен отображать информацию о галерее и изображения", async () => {
    renderDetailsGallery();
    expect(await screen.findByText("Моя Галерея")).toBeInTheDocument();

    expect(screen.getByText(/Описание тестовой галереи/i)).toBeInTheDocument();
    await waitFor(
      () => {
        const images = document.querySelectorAll("img");
        expect(images.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it("должен открывать модальное окно удаления", async () => {
    renderDetailsGallery();

    await screen.findByText("Моя Галерея");
    await waitFor(() => {
      const trashIcon = document.querySelector(".tabler-icon-trash");
      if (!trashIcon) throw new Error("Trash icon not found");
      fireEvent.click(trashIcon);
    });
    expect(
      await screen.findByText(/Подтвердите удаление/i)
    ).toBeInTheDocument();
  });
  it("должен вызывать API удаления при подтверждении", async () => {
    (api.deleteOneImage as jest.Mock).mockResolvedValue({});
    renderDetailsGallery();

    await screen.findByText("Моя Галерея");
    await waitFor(() => {
      const trashIcon = document.querySelector(".tabler-icon-trash");
      if (trashIcon) fireEvent.click(trashIcon);
    });
    const confirmBtn = await screen.findByRole("button", { name: /удалить/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });
    await waitFor(() => {
      expect(api.deleteOneImage).toHaveBeenCalled();
    });
  });
  it("должен открывать модальное окно загрузки файлов", async () => {
    renderDetailsGallery();
    await screen.findByText("Моя Галерея");
    const uploadIcon = document.querySelector(".tabler-icon-upload");
    if (uploadIcon) {
      fireEvent.click(uploadIcon);
    }
    expect(await screen.findByText(/Загрузка фото/i)).toBeInTheDocument();
  });

  it("должен корректно обрабатывать ошибку загрузки данных", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    (api.getOneGallery as jest.Mock).mockRejectedValue(new Error("404"));
    renderDetailsGallery();
    await waitFor(() => {
      expect(screen.queryByText("Моя Галерея")).not.toBeInTheDocument();
    });
  });
});
