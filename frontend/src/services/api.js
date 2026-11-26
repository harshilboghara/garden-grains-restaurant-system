import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const IMAGE_BASE_URL = API_BASE_URL.replace("/api", "");

// Create axios instance

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.code;

      // If token is expired, we can't refresh it (refresh requires valid token)
      // Just clear it and redirect to login
      if (errorCode === "TOKEN_EXPIRED") {
        localStorage.removeItem("token");
        // Only redirect if not already on login/register pages
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // If token is invalid but not expired, try to refresh (token might still be valid)
      if (errorCode === "INVALID_TOKEN" && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No token to refresh");
          }

          // Try to refresh the token (only works if token is still valid)
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const newToken = refreshResponse.data.token;
          localStorage.setItem("token", newToken);

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);
          isRefreshing = false;

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear token silently
          processQueue(refreshError, null);
          isRefreshing = false;
          localStorage.removeItem("token");

          // Only redirect if not already on login page
          if (
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register"
          ) {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      } else if (
        errorCode === "NO_TOKEN" ||
        errorCode === "INVALID_TOKEN" ||
        errorCode === "USER_NOT_FOUND"
      ) {
        // For these errors, clear token silently (don't redirect on startup)
        localStorage.removeItem("token");
        // Only redirect if we're not on login/register pages and not during initial load
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register" &&
          !originalRequest._skipRedirect
        ) {
          // Small delay to avoid redirect during app initialization
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }, 100);
        }
      } else if (errorCode === "ACCOUNT_DEACTIVATED") {
        // Account deactivated - logout
        localStorage.removeItem("token");
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login?message=Account deactivated";
        }
      }
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  resendOTP: (email) => api.post("/auth/resend-otp", { email }),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => api.post("/auth/reset-password", { token, newPassword }),
  refreshToken: () => api.post("/auth/refresh"),
};

// Menu API
export const menuAPI = {
  getMenu: (params) => api.get("/menu", { params }),
  getMenuItem: (id) => api.get(`/menu/${id}`),
  getCategories: () => api.get("/menu/categories"),
  createMenuItem: (data) => api.post("/menu", data),
  updateMenuItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  addRating: (id, rating, comment) =>
    api.post(`/menu/${id}/rating`, { rating, comment }),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post("/orders", orderData),
  getOrders: (params) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status, notes) =>
    api.put(`/orders/${id}/status`, { status, notes }),
  addFeedback: (id, rating, comment) =>
    api.post(`/orders/${id}/feedback`, { rating, comment }),
  getAllOrders: (params) => api.get("/orders/admin/all", { params }),
};

// Reservations API
export const reservationsAPI = {
  createReservation: (reservationData) =>
    api.post("/reservations", reservationData),
  getReservations: (params) => api.get("/reservations", { params }),
  updateReservationStatus: (id, status, notes) =>
    api.put(`/reservations/${id}/status`, { status, notes }),
  cancelReservation: (id) => api.delete(`/reservations/${id}`),
  getAllReservations: (params) =>
    api.get("/reservations/admin/all", { params }),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (orderId, amount) =>
    api.post("/payments/create-payment-intent", { orderId, amount }),
  confirmPayment: (orderId, paymentIntentId) =>
    api.post("/payments/confirm", { orderId, paymentIntentId }),
  processRefund: (orderId, amount) =>
    api.post("/payments/refund", { orderId, amount }),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message, orderId) =>
    api.post("/chatbot/chat", { message, orderId }),
  getSuggestions: (params) => api.get("/chatbot/suggestions", { params }),
  getFAQ: () => api.get("/chatbot/faq"),
};

// Feedback API
export const feedbackAPI = {
  getMenuItemFeedback: (menuItemId) => api.get(`/feedback/menu/${menuItemId}`),
  submitMenuItemFeedback: (menuItemId, rating, comment) =>
    api.post(`/feedback/menu/${menuItemId}`, { rating, comment }),
  getRestaurantFeedback: () => api.get("/feedback/restaurant"),
  submitRestaurantFeedback: (rating, comment) =>
    api.post("/feedback/restaurant", { rating, comment }),
  getRestaurantReviews: () => api.get("/feedback/restaurant/reviews"),
};

// Admin API
export const adminAPI = {
  getDashboard: (params) => api.get("/admin/dashboard", { params }),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUserStatus: (id, isActive) =>
    api.put(`/admin/users/${id}/status`, { isActive }),
  getSalesAnalytics: (params) => api.get("/admin/analytics/sales", { params }),
  getCustomerAnalytics: (params) =>
    api.get("/admin/analytics/customers", { params }),
  getFeedback: (params) => api.get("/admin/feedback", { params }),
};


// Users API
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (userData) => api.put("/users/profile", userData),
  changePassword: (currentPassword, newPassword) =>
    api.post("/users/change-password", { currentPassword, newPassword }),
  getUserOrders: (params) => api.get("/users/orders", { params }),
  getLoyaltyPoints: () => api.get("/users/loyalty-points"),
  uploadAvatar: (formData) => api.post("/users/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  deleteAvatar: () => api.delete("/users/profile/avatar"),
};

// Discounts API
export const discountsAPI = {
  getDiscounts: () => api.get("/discounts"),
  getAllDiscounts: () => api.get("/discounts/all"),
  validateDiscount: (code, orderTotal) =>
    api.post("/discounts/validate", { code, orderTotal }),
  createDiscount: (data) => api.post("/discounts", data),
  updateDiscount: (id, data) => api.put(`/discounts/${id}`, data),
  deleteDiscount: (id) => api.delete(`/discounts/${id}`),
};

// Contact API
export const contactAPI = {
  sendMessage: (data) => api.post("/contact", data),
};

// Inventory API
export const inventoryAPI = {
  getInventory: (params) => api.get("/inventory", { params }),
  getLogs: (params) => api.get("/inventory/logs", { params }),
  addItem: (data) => api.post("/inventory", data),
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  updateStock: (id, data) => api.patch(`/inventory/${id}/stock`, data),
};

export default api;
