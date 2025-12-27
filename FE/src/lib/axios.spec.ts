import MockAdapter from "axios-mock-adapter";
import type { AxiosRequestConfig } from "axios";
import api from "./axios";

describe("Axios Interceptors", () => {
  let mock: InstanceType<typeof MockAdapter>;

  beforeAll(() => {
    mock = new MockAdapter(api);
  });

  beforeEach(() => {
    mock.reset();

    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("test-token");

    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
  });

  afterAll(() => {
    mock.restore();
    jest.restoreAllMocks();
  });

  it("adds Authorization header if token exists", async () => {
    mock.onGet("/test").reply((config: AxiosRequestConfig) => {
      expect(config.headers?.Authorization).toBe("Bearer test-token");
      return [200, { ok: true }];
    });

    const response = await api.get("/test");

    expect(response.status).toBe(200);
  });

  it("removes token on 401 response", async () => {
    mock.onGet("/secure").reply(401);

    await expect(api.get("/secure")).rejects.toBeDefined();

    expect(localStorage.removeItem).toHaveBeenCalledWith("access_token");
  });

  it("does not throw if token is missing", async () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValue(null);

    mock.onGet("/no-token").reply(200);

    const response = await api.get("/no-token");

    expect(response.status).toBe(200);
  });
});
