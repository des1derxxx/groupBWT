import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/",
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    console.log("Отправка запроса:", config.method, config.url);

    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Ответ получен:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "Ошибка ответа:",
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      console.log("Проблема с токеном ");
      localStorage.removeItem("access_token");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default api;
