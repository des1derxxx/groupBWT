import * as api from "@/api/profileApi";
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
import Profile from "./profile";
import "@testing-library/jest-dom";
jest.mock("@/api/profileApi", () => ({
  getUserData: jest.fn(),
  changeUserData: jest.fn(),
}));

const mockUser = {
  id: "user-123",
  firstname: "Иван",
  lastname: "Иванов",
  email: "ivan@test.com",
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

const renderProfile = () => {
  const queryClient = createTestQueryClient();
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("Profile Page Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.getUserData as jest.Mock).mockResolvedValue(mockUser);
  });
  const getField = (name: string) =>
    document.querySelector(`input[name="${name}"]`) as HTMLInputElement;

  it("должен отображать состояние загрузки, затем данные пользователя", async () => {
    renderProfile();

    expect(screen.getByText(/Загрузка.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getField("firstname")).toHaveValue("Иван");
      expect(getField("lastname")).toHaveValue("Иванов");
      expect(getField("email")).toHaveValue("ivan@test.com");
    });
  });

  it("должен успешно обновлять данные пользователя без смены email", async () => {
    (api.changeUserData as jest.Mock).mockResolvedValueOnce({ success: true });
    renderProfile();

    await waitFor(() => expect(getField("firstname")).toHaveValue("Иван"));

    fireEvent.change(getField("firstname"), {
      target: { value: "Петр" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    expect(api.changeUserData).toHaveBeenCalledWith(
      "user-123",
      expect.objectContaining({ firstname: "Петр" })
    );

    expect(
      await screen.findByText(/Данные успешно обновлены!/i)
    ).toBeInTheDocument();
  });

  it("должен показывать уведомление 'Данные обновлены.' при смене email", async () => {
    (api.changeUserData as jest.Mock).mockResolvedValueOnce({ success: true });
    renderProfile();

    await waitFor(() => expect(getField("email")).toHaveValue("ivan@test.com"));

    fireEvent.change(getField("email"), {
      target: { value: "new@test.com" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    expect(await screen.findByText("Данные обновлены.")).toBeInTheDocument();
  });

  it("должен обрабатывать ошибки сервера при обновлении", async () => {
    const errorMessage = "Email уже занят";
    (api.changeUserData as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderProfile();
    await waitFor(() => expect(getField("firstname")).toHaveValue("Иван"));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it("должен валидировать форму и не отправлять данные при некорректном email", async () => {
    renderProfile();
    await waitFor(() => expect(getField("email")).toHaveValue("ivan@test.com"));

    fireEvent.change(getField("email"), { target: { value: "not-an-email" } });
    fireEvent.blur(getField("email"));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    expect(api.changeUserData).not.toHaveBeenCalled();
  });

  it("должен закрывать уведомление при клике на крестик", async () => {
    (api.changeUserData as jest.Mock).mockResolvedValueOnce({});
    renderProfile();
    await waitFor(() => expect(getField("firstname")).toHaveValue("Иван"));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /сохранить изменения/i })
      );
    });

    await screen.findByText(/Данные успешно обновлены!/i);
    const allButtons = screen.getAllByRole("button");
    const closeBtn = allButtons.find(
      (btn) => btn.querySelector("svg") && btn.getAttribute("type") !== "submit"
    );

    if (closeBtn) {
      fireEvent.click(closeBtn);
    }

    await waitFor(() => {
      expect(
        screen.queryByText(/Данные успешно обновлены!/i)
      ).not.toBeInTheDocument();
    });
  });
});
