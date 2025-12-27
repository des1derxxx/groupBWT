import { getFileUrl } from "./getFileUrl";

describe("getFileUrl", () => {
  it("возвращает пустую строку если путь не задан", () => {
    expect(getFileUrl()).toBe("");
  });

  it("удаляет /api/ из начала пути, если путь начинается с /", () => {
    expect(getFileUrl("/api/files/image.png")).toBe(
      "http://localhost:5000/files/image.png"
    );
  });

  it("не удаляет /api/ если путь не начинается с /", () => {
    expect(getFileUrl("api/files/image.png")).toBe(
      "http://localhost:5000/api/files/image.png"
    );
  });

  it("использует baseURL, зафиксированный при импорте, если baseURL пустой после импорта", () => {
    expect(getFileUrl("/api/test/file.txt")).toBe(
      "http://localhost:5000/test/file.txt"
    );
  });

  it("убирает конечный слеш из baseURL", () => {
    expect(getFileUrl("/api/test")).toBe("http://localhost:5000/test");
  });
});
