import { render, screen, fireEvent, within } from "@testing-library/react";
import { GallerySort } from "./GallerySort";
import "@testing-library/jest-dom";

describe("GallerySort Component", () => {
  const mockProps = {
    sortBy: "createdAt" as const,
    order: "asc" as const,
    onSortByChange: jest.fn(),
    onOrderChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен корректно отображать символ направления сортировки внутри кнопки", () => {
    const { rerender } = render(<GallerySort {...mockProps} order="asc" />);
    const button = screen.getByRole("button");
    expect(within(button).getByText("↑")).toBeInTheDocument();

    rerender(<GallerySort {...mockProps} order="desc" />);
    expect(within(button).getByText("↓")).toBeInTheDocument();
  });

  it("должен вызывать onOrderChange с правильным значением при клике", () => {
    render(<GallerySort {...mockProps} order="asc" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockProps.onOrderChange).toHaveBeenCalledWith("desc");
  });

  it("должен отображать текущую опцию сортировки в select", () => {
    render(<GallerySort {...mockProps} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("createdAt");
  });

  it("должен вызывать onSortByChange при выборе новой опции", () => {
    render(<GallerySort {...mockProps} />);
    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "title" } });
    expect(mockProps.onSortByChange).toHaveBeenCalledWith("title");
  });

  it("должен содержать 3 опции в выпадающем списке", () => {
    render(<GallerySort {...mockProps} />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });
});
