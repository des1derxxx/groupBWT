import { render, screen, fireEvent } from "@testing-library/react";
import { CustomFileInput } from "./CustomFileInput";
import "@testing-library/jest-dom";

describe("CustomFileInput Component", () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: "Выберите файл",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("должен корректно отображать текст метки (label)", () => {
    render(<CustomFileInput {...defaultProps} />);
    expect(screen.getByText("Выберите файл")).toBeInTheDocument();
  });
  it("должен вызывать onChange при выборе одного файла", () => {
    render(<CustomFileInput {...defaultProps} />);
    const input = screen.getByLabelText("Выберите файл") as HTMLInputElement;
    const file = new File(["content"], "test.png", { type: "image/png" });
    fireEvent.change(input, {
      target: { files: [file] },
    });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange.mock.calls[0][0][0]).toBe(file);
  });

  it("должен поддерживать выбор нескольких файлов, если multiple={true}", () => {
    render(<CustomFileInput {...defaultProps} multiple />);

    const input = screen.getByLabelText("Выберите файл") as HTMLInputElement;
    expect(input).toHaveAttribute("multiple");

    const file1 = new File(["1"], "file1.png", { type: "image/png" });
    const file2 = new File(["2"], "file2.png", { type: "image/png" });
    const files = [file1, file2];

    fireEvent.change(input, {
      target: { files: files },
    });
    const receivedFiles = mockOnChange.mock.calls[0][0];

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(receivedFiles).toHaveLength(2);
    expect(receivedFiles[0]).toBe(file1);
    expect(receivedFiles[1]).toBe(file2);
  });
  it("должен иметь корректный атрибут accept", () => {
    render(<CustomFileInput {...defaultProps} accept="image/*" />);
    const input = screen.getByLabelText("Выберите файл");
    expect(input).toHaveAttribute("accept", "image/*");
  });
  it("input должен быть скрыт (иметь класс hidden)", () => {
    const { container } = render(<CustomFileInput {...defaultProps} />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveClass("hidden");
  });
  it("не должен вызывать onChange, если файлы не выбраны (null)", () => {
    render(<CustomFileInput {...defaultProps} />);
    const input = screen.getByLabelText("Выберите файл");
    fireEvent.change(input, {
      target: { files: null },
    });
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
