import { render, screen } from "@testing-library/react";
import { SubmitButton } from "./SubmitButton";
import "@testing-library/jest-dom";

describe("SubmitButton Component", () => {
  it("должен иметь атрибут type='submit'", () => {
    render(<SubmitButton>Отправить</SubmitButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("должен корректно отображать текст внутри кнопки", () => {
    render(<SubmitButton>Войти</SubmitButton>);
    expect(screen.getByText("Войти")).toBeInTheDocument();
  });

  it("должен отображать loadingText и блокироваться при isLoading={true}", () => {
    render(
      <SubmitButton isLoading={true} loadingText="Вход...">
        Войти
      </SubmitButton>
    );

    const button = screen.getByRole("button");
    expect(screen.getByText("Вход...")).toBeInTheDocument();
    expect(screen.queryByText("Войти")).not.toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("должен быть заблокирован, если передан проп disabled", () => {
    render(<SubmitButton disabled>Заблокировано</SubmitButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("должен иметь базовые стили градиента", () => {
    render(<SubmitButton>Стили</SubmitButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "bg-gradient-to-r",
      "from-purple-600",
      "to-pink-600"
    );
  });

  it("должен иметь классы анимации и трансформации", () => {
    render(<SubmitButton>Трансформация</SubmitButton>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "hover:scale-[1.02]",
      "active:scale-[0.98]",
      "transition-all"
    );
  });
});
