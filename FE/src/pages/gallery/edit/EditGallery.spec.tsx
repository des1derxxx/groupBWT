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
import EditGallery from "./editGallery";
import "@testing-library/jest-dom";

jest.mock("@/api/galleryApi", () => ({
  getOneGallery: jest.fn(),
  editOneGallery: jest.fn(),
}));

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
  useParams: () => ({ id: "123" }),
}));

const mockGalleryData = {
  id: "123",
  title: "Старый заголовок",
  description: "Старое описание",
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

const renderEditGallery = () => {
  const queryClient = createTestQueryClient();
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/gallery/edit/123"]}>
          <Routes>
            <Route path="/gallery/edit/:id" element={<EditGallery />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("EditGallery Page Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.getOneGallery as jest.Mock).mockResolvedValue(mockGalleryData);
  });

  it("должен загружать данные и заполнять форму", async () => {
    renderEditGallery();
    expect(screen.getByText(/Редактирование галереи/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Заголовок")).toHaveValue(
        "Старый заголовок"
      );
      expect(screen.getByPlaceholderText("Описание")).toHaveValue(
        "Старое описание"
      );
    });
  });

  it("должен показывать состояние загрузки при отправке", async () => {
    (api.editOneGallery as jest.Mock).mockReturnValue(
      new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderEditGallery();
    await waitFor(() => screen.getByPlaceholderText("Заголовок"));

    fireEvent.change(screen.getByPlaceholderText("Заголовок"), {
      target: { value: "Новый заголовок" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    expect(screen.getByText("Сохранение...")).toBeInTheDocument();
  });

  it("успешное редактирование: вызов API и редирект", async () => {
    (api.editOneGallery as jest.Mock).mockResolvedValueOnce({ success: true });

    renderEditGallery();
    await waitFor(() => screen.getByPlaceholderText("Заголовок"));

    fireEvent.change(screen.getByPlaceholderText("Заголовок"), {
      target: { value: "Обновленное название" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    await waitFor(() => {
      expect(api.editOneGallery).toHaveBeenCalledWith(
        "123",
        expect.objectContaining({
          title: "Обновленное название",
        })
      );
    });

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/gallery/details/123");
    });
  });

  it("должен показывать ошибки валидации при очистке обязательных полей", async () => {
    renderEditGallery();
    await waitFor(() => screen.getByPlaceholderText("Заголовок"));

    const titleInput = screen.getByPlaceholderText("Заголовок");

    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.blur(titleInput);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });
    await waitFor(() => {
      expect(api.editOneGallery).not.toHaveBeenCalled();
    });
  });

  it("должен обрабатывать ошибку сервера при сохранении", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (api.editOneGallery as jest.Mock).mockRejectedValueOnce(
      new Error("Server Error")
    );

    renderEditGallery();
    await waitFor(() => screen.getByPlaceholderText("Заголовок"));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("Сохранение...")).not.toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });
  it("должен работать переход назад", async () => {
    renderEditGallery();
    const backBtn = screen.getByRole("button", { name: "" });
    fireEvent.click(backBtn);
    expect(mockedUsedNavigate).toHaveBeenCalled();
  });
});
