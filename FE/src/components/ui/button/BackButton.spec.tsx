import { render, screen, fireEvent } from "@testing-library/react";
import { BackButton } from "./backButton";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("BackButton Component", () => {
  const mockedNavigate = useNavigate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен корректно рендериться (наличие кнопки)", () => {
    render(<BackButton />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("должен вызывать navigate(-1) при клике на кнопку", () => {
    const navigateSpy = jest.fn();
    mockedNavigate.mockReturnValue(navigateSpy);

    render(<BackButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(navigateSpy).toHaveBeenCalledWith(-1);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it("должен содержать иконку стрелки", () => {
    const { container } = render(<BackButton />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("должен иметь корректные классы для позиционирования и стилей", () => {
    render(<BackButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("absolute", "top-3", "left-3", "z-50", "flex");
    expect(button).toHaveClass("!bg-purple-600", "text-white");
  });
});
