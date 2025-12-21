import axios from "axios";


const apiBase = axios.create({
  baseURL: "http://localhost:5000/",
  timeout: 5000,
});

export default apiBase