import * as api from "@/api/galleryApi";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import AddGallery from "./addGallery";
import "@testing-library/jest-dom";
jest.mock("@/api/galleryApi", () => ({
  addOneGallery: jest.fn(),
}));
const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderAddGallery = () => {
  const queryClient = createTestQueryClient();
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AddGallery />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("AddGallery Page Coverage (60%+)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("должен отображать форму и заголовок", () => {
    renderAddGallery();
    expect(screen.getByText("Добавление в галерею")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Заголовок")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Описание")).toBeInTheDocument();
  });

  it("должен показывать ошибки валидации при пустых полях", async () => {
    renderAddGallery();

    const submitBtn = screen.getByRole("button", {
      name: /сохранить изменения/i,
    });
    const titleInput = screen.getByPlaceholderText("Заголовок");
    fireEvent.focus(titleInput);
    fireEvent.blur(titleInput);

    await act(async () => {
      fireEvent.click(submitBtn);
    });
    await waitFor(() => {
      expect(titleInput).toHaveClass("border-red-500");
    });
  });

  it("должен показывать состояние загрузки на кнопке при отправке", async () => {
    (api.addOneGallery as jest.Mock).mockReturnValue(
      new Promise((resolve) => setTimeout(resolve, 2000))
    );

    renderAddGallery();

    fireEvent.change(screen.getByPlaceholderText("Заголовок"), {
      target: { value: "Природа" },
    });
    fireEvent.change(screen.getByPlaceholderText("Описание"), {
      target: { value: "Красивые пейзажи" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });
    expect(await screen.findByText("Сохранение...")).toBeInTheDocument();
  });

  it("успешное добавление: вызов API и редирект", async () => {
    (api.addOneGallery as jest.Mock).mockResolvedValueOnce({
      id: "1",
      title: "Тест",
    });

    renderAddGallery();

    fireEvent.change(screen.getByPlaceholderText("Заголовок"), {
      target: { value: "Мой Альбом" },
    });
    fireEvent.change(screen.getByPlaceholderText("Описание"), {
      target: { value: "Описание альбома" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    await waitFor(() => {
      expect(api.addOneGallery).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Мой Альбом",
          description: "Описание альбома",
        }),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/gallery");
    });
  });

  it("должен работать переход назад при клике на BackButton", () => {
    renderAddGallery();
    const backBtn = screen.getAllByRole("button")[0];
    fireEvent.click(backBtn);

    expect(mockedUsedNavigate).toHaveBeenCalledWith(-1);
  });
});
