import { render, screen, fireEvent } from "@testing-library/react";
import { FormInput } from "./FormInput";
import "@testing-library/jest-dom";

describe("FormInput Component", () => {
  const mockRegister = jest.fn((name: string) => ({
    name,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  }));

  const defaultProps = {
    name: "email",
    label: "Email Address",
    register: mockRegister as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен корректно отображать input с меткой и плейсхолдером", () => {
    render(<FormInput {...defaultProps} placeholder="Enter your email" />);

    expect(screen.getByText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("должен вызывать register с правильным именем поля", () => {
    render(<FormInput {...defaultProps} />);

    expect(mockRegister).toHaveBeenCalledWith("email");
  });

  it("должен отображать textarea, если проп multiline установлен в true", () => {
    render(<FormInput {...defaultProps} multiline rows={5} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("должен отображать ошибку только когда поле 'touched' и есть объект 'error'", () => {
    const error = { type: "required", message: "Email is required" };

    const { rerender } = render(
      <FormInput {...defaultProps} error={error} touched={false} />
    );
    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();

    rerender(<FormInput {...defaultProps} error={error} touched={true} />);
    const errorMessage = screen.getByText("Email is required");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-red-400");
  });

  it("должен менять класс границы на красный при наличии ошибки и touched", () => {
    const error = { type: "required", message: "Error" };
    render(<FormInput {...defaultProps} error={error} touched={true} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-500");
  });

  it("должен вызывать onKeyPress при нажатии клавиш", () => {
    const handleKeyPress = jest.fn();
    render(<FormInput {...defaultProps} onKeyPress={handleKeyPress} />);

    const input = screen.getByRole("textbox");
    fireEvent.keyPress(input, { key: "Enter", code: 13, charCode: 13 });

    expect(handleKeyPress).toHaveBeenCalledTimes(1);
  });
});
