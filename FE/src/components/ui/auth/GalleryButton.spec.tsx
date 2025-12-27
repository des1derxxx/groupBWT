import { render, screen, fireEvent } from "@testing-library/react";
import { GalleryButton } from "./GalleryButton";
import "@testing-library/jest-dom";

describe("GalleryButton Component", () => {
  it("должен рендерить текст (children) корректно", () => {
    render(<GalleryButton>Click Me</GalleryButton>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("должен вызывать onClick при нажатии", () => {
    const handleClick = jest.fn();
    render(<GalleryButton onClick={handleClick}>Click Me</GalleryButton>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("должен отображать текст загрузки и быть заблокированным, когда isLoading={true}", () => {
    render(
      <GalleryButton isLoading={true} loadingText="Waiting...">
        Submit
      </GalleryButton>
    );

    const button = screen.getByRole("button");
    expect(screen.getByText("Waiting...")).toBeInTheDocument();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("должен быть заблокирован, если передан проп disabled", () => {
    render(<GalleryButton disabled>Disabled Button</GalleryButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("не должен вызывать onClick, если кнопка заблокирована (disabled или isLoading)", () => {
    const handleClick = jest.fn();
    render(
      <GalleryButton onClick={handleClick} disabled>
        Can't click
      </GalleryButton>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("должен применять правильные классы градиента для разных цветов", () => {
    const { rerender } = render(
      <GalleryButton color="purple">Purple</GalleryButton>
    );
    let button = screen.getByRole("button");

    rerender(<GalleryButton color="green">Green</GalleryButton>);
    expect(button).toHaveClass("from-green-500");
  });

  it("должен применять классы скругления в зависимости от пропса isRounded", () => {
    const { rerender } = render(
      <GalleryButton isRounded={true}>Rounded</GalleryButton>
    );
    expect(screen.getByRole("button")).toHaveClass("rounded-2xl");

    rerender(<GalleryButton isRounded={false}>Square</GalleryButton>);
    expect(screen.getByRole("button")).toHaveClass("rounded-none");
  });

  it("не должен иметь класс rounded-2xl, если isRounded={false}", () => {
    render(<GalleryButton isRounded={false}>Square</GalleryButton>);
    expect(screen.getByRole("button")).not.toHaveClass("rounded-2xl");
  });
});
