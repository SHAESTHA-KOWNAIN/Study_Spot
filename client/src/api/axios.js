import axios from "axios";

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

const defaultApiBaseUrl = import.meta.env.PROD
  ? "https://study-spot.onrender.com/api"
  : "http://localhost:5000/api";

export const http = axios.create({
  baseURL: (configuredApiBaseUrl || defaultApiBaseUrl).replace(/\/+$/, ""),
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("studyspot-api-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getFriendlyErrorMessage = (error) => {
  if (!error.response) {
    return "Unable to reach the server. Check your connection, API URL, and server CORS configuration.";
  }

  const status = error.response.status;

  const messages = {
    400: "Please check your details and try again.",
    401: "Your email or password is incorrect.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource could not be found.",
    409: "An account with this email already exists. Please log in instead.",
    422: "Some of the information you entered is invalid.",
    429: "Too many attempts. Please try again later.",
    500: "Something went wrong on our server. Please try again later.",
    502: "The server is temporarily unavailable. Please try again.",
    503: "The service is temporarily unavailable. Please try again later.",
  };

  return messages[status] || "Something went wrong. Please try again.";
};

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("studyspot-api-token");
      sessionStorage.removeItem("studyspot-api-user");
      window.dispatchEvent(new Event("studyspot:unauthorized"));
    }

    error.userMessage =
      error.response?.data?.message || getFriendlyErrorMessage(error);

    return Promise.reject(error);
  },
);

export function normalizeResponse(response) {
  return response?.data?.data ?? response?.data;
}
