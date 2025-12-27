import { render, screen, fireEvent } from "@testing-library/react";
import { CorfirmDelete } from "./corfirmDelete";
import "@testing-library/jest-dom";

describe("CorfirmDelete Component", () => {
  const mockProps = {
    cancelDelete: jest.fn(),
    confirmDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен отображать заголовок и текст подтверждения", () => {
    render(<CorfirmDelete {...mockProps} />);
    expect(screen.getByText("Подтвердите удаление")).toBeInTheDocument();
    expect(
      screen.getByText(/Вы уверены, что хотите удалить картинку/i)
    ).toBeInTheDocument();
  });
  it("должен корректно отображать обе кнопки", () => {
    render(<CorfirmDelete {...mockProps} />);
    expect(screen.getByRole("button", { name: /отмена/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /удалить/i })
    ).toBeInTheDocument();
  });
  it("должен вызывать cancelDelete при клике на кнопку 'Отмена'", () => {
    render(<CorfirmDelete {...mockProps} />);
    const cancelButton = screen.getByRole("button", { name: /отмена/i });
    fireEvent.click(cancelButton);
    expect(mockProps.cancelDelete).toHaveBeenCalledTimes(1);
    expect(mockProps.confirmDelete).not.toHaveBeenCalled();
  });
  it("должен вызывать confirmDelete при клике на кнопку 'Удалить'", () => {
    render(<CorfirmDelete {...mockProps} />);
    const deleteButton = screen.getByRole("button", { name: /удалить/i });
    fireEvent.click(deleteButton);
    expect(mockProps.confirmDelete).toHaveBeenCalledTimes(1);
    expect(mockProps.cancelDelete).not.toHaveBeenCalled();
  });
  it("должен иметь фиксированное позиционирование и центрирование (проверка классов)", () => {
    const { container } = render(<CorfirmDelete {...mockProps} />);
    const overlay = container.querySelector(".fixed.inset-0");
    expect(overlay).toHaveClass(
      "backdrop-blur-xl",
      "flex",
      "items-center",
      "justify-center"
    );
  });
  it("должен использовать правильные цвета для кнопок (интеграция с GalleryButton)", () => {
    render(<CorfirmDelete {...mockProps} />);
    const cancelButton = screen.getByRole("button", { name: /отмена/i });
    const deleteButton = screen.getByRole("button", { name: /удалить/i });
    expect(cancelButton).toHaveClass("from-gray-500");
    expect(deleteButton).toHaveClass("from-red-500");
  });
});
