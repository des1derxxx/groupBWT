import { render, screen, fireEvent } from "@testing-library/react";
import { GalleryFiltersPanel } from "./GalleryFiltersPanel";
import "@testing-library/jest-dom";

describe("GalleryFiltersPanel Component", () => {
  const mockProps = {
    onFromDateChange: jest.fn(),
    onToDateChange: jest.fn(),
    onMinImagesChange: jest.fn(),
    onMaxImagesChange: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен корректно отображать заголовок и группы фильтров", () => {
    render(<GalleryFiltersPanel {...mockProps} />);

    expect(screen.getByText("Фильтры")).toBeInTheDocument();
    expect(screen.getByText("Период")).toBeInTheDocument();
    expect(screen.getByText("Картинок")).toBeInTheDocument();
  });

  it("должен вызывать onFromDateChange при изменении даты 'От'", () => {
    const { container } = render(<GalleryFiltersPanel {...mockProps} />);
    const dateInputs = container.querySelectorAll('input[type="date"]');
    const fromInput = dateInputs[0];

    fireEvent.change(fromInput, { target: { value: "2025-01-01" } });

    expect(mockProps.onFromDateChange).toHaveBeenCalledWith("2025-01-01");
  });

  it("должен вызывать onToDateChange при изменении даты 'До'", () => {
    const { container } = render(<GalleryFiltersPanel {...mockProps} />);

    const dateInputs = container.querySelectorAll('input[type="date"]');
    const toInput = dateInputs[1];

    fireEvent.change(toInput, { target: { value: "2025-12-31" } });

    expect(mockProps.onToDateChange).toHaveBeenCalledWith("2025-12-31");
  });

  it("должен вызывать onMinImagesChange с числовым значением (поиск по placeholder)", () => {
    render(<GalleryFiltersPanel {...mockProps} />);
    const minInput = screen.getByPlaceholderText("0");
    fireEvent.change(minInput, { target: { value: "5" } });

    expect(mockProps.onMinImagesChange).toHaveBeenCalledWith(5);
  });

  it("должен вызывать onMaxImagesChange с числовым значением (поиск по placeholder)", () => {
    render(<GalleryFiltersPanel {...mockProps} />);
    const maxInput = screen.getByPlaceholderText("∞");
    fireEvent.change(maxInput, { target: { value: "10" } });

    expect(mockProps.onMaxImagesChange).toHaveBeenCalledWith(10);
  });

  it("должен отображать ошибку валидации, если дата 'От' позже даты 'До'", () => {
    render(
      <GalleryFiltersPanel
        {...mockProps}
        fromDate="2025-12-31"
        toDate="2025-01-01"
      />
    );
    const errorMessages = screen.getAllByText(
      /Дата начала позже даты окончания/i
    );
    expect(errorMessages.length).toBeGreaterThan(0);
  });
  it("должен отображать ошибку валидации, если минимум больше максимума", () => {
    render(<GalleryFiltersPanel {...mockProps} minImages={10} maxImages={5} />);

    const errorMessages = screen.getAllByText(/Минимум больше максимума/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });
  it("должен вызывать onReset при клике на кнопку сброса", () => {
    render(<GalleryFiltersPanel {...mockProps} />);
    const resetButton = screen.getByRole("button", { name: /Сбросить/i });
    fireEvent.click(resetButton);

    expect(mockProps.onReset).toHaveBeenCalledTimes(1);
  });
  it("не должен позволять ввод спецсимволов в числовые поля (e, +, -)", () => {
    render(<GalleryFiltersPanel {...mockProps} />);
    const minInput = screen.getByPlaceholderText("0");
    const isPrevented = !fireEvent.keyDown(minInput, { key: "e" });

    expect(isPrevented).toBe(true);
  });
});
