import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true // Extremely important for sending cookies
});

// Response interceptor to automatically handle 401s (expired access token)
// by trying to refresh the token and retrying the request
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 Unauthorized and we haven't already retried, 
        // AND the original request wasn't the login route itself!
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url.includes('/auth/login')
        ) {
            originalRequest._retry = true;

            try {
                // Assuming your auth endpoints are prefixed differently or accessible here
                // Note: The server route is now /api/v1/auth/refresh
                const refreshApi = axios.create({ baseURL: "/api/v1/auth", withCredentials: true });
                await refreshApi.post('/refresh');

                // If refresh succeeds, the new httpOnly cookie is automatically stored by the browser.
                // We just retry the original failed request.
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (refresh token expired too) -> user is logged out
                localStorage.removeItem('attendEase_user');
                // Optional: window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;