import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import "@testing-library/jest-dom";

describe("PublicRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("должен рендерить детей, если токен отсутствует", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <PublicRoute>
          <div data-testid="public-content">Public Content</div>
        </PublicRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("public-content")).toBeInTheDocument();
    expect(screen.queryByText("Gallery Page")).not.toBeInTheDocument();
  });

  it("должен перенаправлять на /gallery, если токен существует", () => {
    localStorage.setItem("access_token", "fake-token");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div data-testid="public-content">Public Content</div>
              </PublicRoute>
            }
          />
          <Route path="/gallery" element={<div>Gallery Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByTestId("public-content")).not.toBeInTheDocument();
    expect(screen.getByText("Gallery Page")).toBeInTheDocument();
  });
});
