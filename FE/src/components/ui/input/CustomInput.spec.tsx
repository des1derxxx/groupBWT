import { render, screen, fireEvent } from "@testing-library/react";
import { CustomInput } from "./CustomInput";
import "@testing-library/jest-dom";

describe("CustomInput Component", () => {
  it("должен отображать метку (label), если она передана", () => {
    render(<CustomInput label="Username" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("должен отображать сообщение об ошибке и применять красный бордер", () => {
    const errorMessage = "Invalid value";
    render(<CustomInput error={errorMessage} />);
    const errorText = screen.getByText(errorMessage);
    const input = screen.getByRole("textbox");
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass("text-red-400");
    expect(input).toHaveClass("border-red-500");
  });
  it("должен корректно передавать стандартные атрибуты (placeholder, type, value)", () => {
    render(
      <CustomInput
        placeholder="Search..."
        type="text"
        value="initial value"
        readOnly
      />
    );
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    expect(input.value).toBe("initial value");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("readonly");
  });
  it("должен вызывать onChange при вводе текста", () => {
    const handleChange = jest.fn();
    render(<CustomInput onChange={handleChange} placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    fireEvent.change(input, { target: { value: "new text" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
  it("должен объединять базовые классы с переданными через className", () => {
    render(<CustomInput className="custom-extra-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-extra-class");
    expect(input).toHaveClass("bg-gray-700");
  });
  it("не должен рендерить label, если проп label не передан", () => {
    const { container } = render(<CustomInput />);
    const label = container.querySelector("label");
    expect(label).not.toBeInTheDocument();
  });
});
