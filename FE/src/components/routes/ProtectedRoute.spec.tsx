import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

beforeEach(() => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ProtectedRoute", () => {
  it("редиректит на /login если токена нет", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected Content")).toBeNull();
  });

  it("рендерит children если токен есть", () => {
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("test-token");

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("редиректит на /login если токена нет (проверка маршрута)", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).toBeNull();
  });
});
