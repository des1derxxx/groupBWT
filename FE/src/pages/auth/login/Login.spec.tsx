import * as api from "@/api/loginApi";
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
import Login from "./login";
import "@testing-library/jest-dom";

jest.mock("@/api/loginApi", () => ({
  loginUser: jest.fn(),
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

const renderLogin = () => {
  const queryClient = createTestQueryClient();
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("Login Page Coverage (60%+)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("должен отображать ошибку, если сервер вернул ошибку", async () => {
    const serverErrorMessage = "Неверный пароль";
    (api.loginUser as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: serverErrorMessage } },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("ivan@example.com"), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Введите пароль"), {
      target: { value: "password123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /войти/i }));
    });
    const errorNotify = await screen.findByText(serverErrorMessage);
    expect(errorNotify).toBeInTheDocument();
  });

  it("должен показывать состояние загрузки на кнопке", async () => {
    (api.loginUser as jest.Mock).mockReturnValue(
      new Promise((resolve) => setTimeout(resolve, 2000))
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("ivan@example.com"), {
      target: { value: "loading@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Введите пароль"), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /войти/i }));
    });
    expect(await screen.findByText("Вход...")).toBeInTheDocument();
  });
  it("успешный вход: переход на /gallery", async () => {
    (api.loginUser as jest.Mock).mockResolvedValueOnce({
      access_token: "token",
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText("ivan@example.com"), {
      target: { value: "success@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Введите пароль"), {
      target: { value: "password123" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /войти/i }));
    });
    expect(
      await screen.findByText(/вход выполнен успешно/i)
    ).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/gallery");
    });
  });
});
