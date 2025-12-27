import * as api from "@/api/registerApi";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import Register from "./register";
import "@testing-library/jest-dom";

jest.mock("@/api/registerApi", () => ({
  registerUser: jest.fn(),
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

const renderRegister = () => {
  const queryClient = createTestQueryClient();
  return render(
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("Register Page Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const validPassword = "Password123";

  it("успешная регистрация: сохранение токена и редирект", async () => {
    const user = userEvent.setup({ delay: null });
    const fakeToken = "reg-token-2025";
    (api.registerUser as jest.Mock).mockResolvedValueOnce({
      access_token: fakeToken,
    });

    renderRegister();

    await user.type(screen.getByPlaceholderText("Иван"), "Ivan");
    await user.type(screen.getByPlaceholderText("Иванов"), "Ivanov");
    await user.type(
      screen.getByPlaceholderText("ivan@example.com"),
      "test@mail.com"
    );
    await user.type(
      screen.getByPlaceholderText("Минимум 8 символов"),
      validPassword
    );
    await user.type(
      screen.getByPlaceholderText("Повторите пароль"),
      validPassword
    );

    const submitBtn = screen.getByRole("button", {
      name: /зарегистрироваться/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstname: "Ivan",
          lastname: "Ivanov",
          email: "test@mail.com",
          password: validPassword,
        }),
        expect.anything()
      );
    });

    expect(await screen.findByText(/регистрация успешна/i)).toBeInTheDocument();
    expect(localStorage.getItem("access_token")).toBe(fakeToken);

    act(() => {
      jest.advanceTimersByTime(1600);
    });

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/gallery");
    });
  });

  it("должен отображать ошибку от сервера", async () => {
    const user = userEvent.setup({ delay: null });
    const serverError = "Этот email уже зарегистрирован";
    (api.registerUser as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: serverError } },
    });

    renderRegister();

    await user.type(screen.getByPlaceholderText("Иван"), "Ivan");
    await user.type(screen.getByPlaceholderText("Иванов"), "Ivanov");
    await user.type(
      screen.getByPlaceholderText("ivan@example.com"),
      "error@mail.com"
    );
    await user.type(
      screen.getByPlaceholderText("Минимум 8 символов"),
      validPassword
    );
    await user.type(
      screen.getByPlaceholderText("Повторите пароль"),
      validPassword
    );

    await user.click(
      screen.getByRole("button", { name: /зарегистрироваться/i })
    );

    expect(await screen.findByText(serverError)).toBeInTheDocument();
  });
});
