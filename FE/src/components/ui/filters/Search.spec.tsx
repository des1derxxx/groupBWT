import { render, screen, fireEvent } from "@testing-library/react";
import Search from "./Search";
import "@testing-library/jest-dom";

describe("Search Component", () => {
  const mockProps = {
    search: "",
    onSearchChange: jest.fn(),
    cleanSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("должен корректно отображать input с плейсхолдером", () => {
    render(<Search {...mockProps} />);
    expect(screen.getByPlaceholderText("Поиск")).toBeInTheDocument();
  });
  it("должен вызывать onSearchChange при вводе текста", () => {
    render(<Search {...mockProps} />);
    const input = screen.getByPlaceholderText("Поиск");
    fireEvent.change(input, { target: { value: "my query" } });
    expect(mockProps.onSearchChange).toHaveBeenCalledWith("my query");
    expect(mockProps.onSearchChange).toHaveBeenCalledTimes(1);
  });
  it("иконка очистки должна быть невидимой (invisible), если строка поиска пуста", () => {
    const { container } = render(<Search {...mockProps} search="" />);
    const clearIcon = container.querySelector("svg");
    expect(clearIcon).toHaveClass("invisible");
    expect(clearIcon).not.toHaveClass("visible");
  });

  it("иконка очистки должна быть видимой (visible), если в поиске есть текст", () => {
    const { container } = render(<Search {...mockProps} search="test" />);

    const clearIcon = container.querySelector("svg");
    expect(clearIcon).toHaveClass("visible");
    expect(clearIcon).not.toHaveClass("invisible");
  });

  it("должен вызывать cleanSearch при клике на иконку очистки", () => {
    const { container } = render(<Search {...mockProps} search="something" />);
    const clearIcon = container.querySelector("svg");
    if (clearIcon) {
      fireEvent.click(clearIcon);
    }
    expect(mockProps.cleanSearch).toHaveBeenCalledTimes(1);
  });

  it("input должен отображать текущее значение пропса search", () => {
    render(<Search {...mockProps} search="hello" />);

    const input = screen.getByPlaceholderText("Поиск") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });
});
