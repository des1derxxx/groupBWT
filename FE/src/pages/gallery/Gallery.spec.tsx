import * as api from "@/api/galleryApi";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import Gallery from "./gallery";
import "@testing-library/jest-dom";
jest.mock("@/api/galleryApi", () => ({
  getAllGalleryUser: jest.fn(),
  deleteOneGallery: jest.fn(),
}));

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const mockGalleries = {
  items: [
    {
      id: "1",
      title: "Природа",
      description: "Лес",
      imagesCount: 5,
      createdAt: "2025-01-01",
    },
    {
      id: "2",
      title: "Город",
      description: "Улицы",
      imagesCount: 2,
      createdAt: "2025-01-02",
    },
  ],
  total: 15,
  totalPages: 2,
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

const renderGallery = () => {
  const queryClient = createTestQueryClient();
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("Gallery Page Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (api.getAllGalleryUser as jest.Mock).mockResolvedValue(mockGalleries);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("должен отображать список галерей после загрузки", async () => {
    renderGallery();
    expect(await screen.findByText("Природа")).toBeInTheDocument();
  });

  it("должен корректно менять страницу пагинации", async () => {
    renderGallery();
    await screen.findByText("Природа");

    const page2Btn = await screen.findByText("2");

    await act(async () => {
      fireEvent.click(page2Btn);
    });

    await waitFor(() => {
      expect(api.getAllGalleryUser).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it("должен открывать Drawer с фильтрами и находить заголовок внутри него", async () => {
    renderGallery();
    const filterBtn = await screen.findByRole("button", { name: /фильтры/i });
    fireEvent.click(filterBtn);
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getAllByText("Фильтры")[0]).toBeInTheDocument();
  });

  it("должен работать поиск с дебаунсом", async () => {
    renderGallery();
    await screen.findByText("Природа");

    const searchInput = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(searchInput, { target: { value: "Тест" } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(api.getAllGalleryUser).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Тест" })
      );
    });
  });

  it("должен открывать модальное окно удаления и вызывать API", async () => {
    (api.deleteOneGallery as jest.Mock).mockResolvedValueOnce({});
    renderGallery();

    await screen.findByText("Природа");

    const dotsIcons = document.querySelectorAll(".tabler-icon-dots-vertical");
    fireEvent.click(dotsIcons[0]);

    const deleteOptions = screen.getAllByText(/Удалить/i);
    fireEvent.click(deleteOptions[0]);

    expect(
      await screen.findByText(/Подтвердите удаление/i)
    ).toBeInTheDocument();

    const allButtons = screen.getAllByRole("button", { name: /удалить/i });
    const confirmBtn = allButtons[allButtons.length - 1];

    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(api.deleteOneGallery).toHaveBeenCalledWith("1");
  });

  it("должен сбрасывать фильтры", async () => {
    renderGallery();
    await screen.findByText("Природа");

    const resetButtons = screen.getAllByText(/Сбросить/i);
    fireEvent.click(resetButtons[0]);

    await waitFor(() => {
      expect(api.getAllGalleryUser).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });
  });

  it("должен переходить на страницу добавления", async () => {
    renderGallery();
    const addBtn = await screen.findByRole("button", { name: /добавить/i });
    fireEvent.click(addBtn);
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/gallery/add");
  });
});
