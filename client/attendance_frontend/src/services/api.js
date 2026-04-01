import axios from "axios";

const api = axios.create({
    // Vercel will inject the true backend URL here via environment variables! 
    // If running locally, it falls back to the Vite /api/v1 proxy string!
    baseURL: import.meta.env.VITE_API_URL || "/api/v1",
    withCredentials: true // Extremely important for sending cookies
});

// Interceptor to attach Bearer token to bypass strict Third-Party Cookie blocking in Chrome
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('attendEase_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

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
                const rt = localStorage.getItem('attendEase_refresh_token');
                if (!rt) throw new Error("No refresh token stored");

                const refreshApi = axios.create({ 
                    baseURL: import.meta.env.VITE_API_URL || "/api/v1", 
                    withCredentials: true 
                });
                
                const res = await refreshApi.post('/auth/refresh', { refreshToken: rt });

                // Update new tokens in memory
                const newAccessToken = res.data.data.accessToken;
                const newRefreshToken = res.data.data.refreshToken;
                localStorage.setItem('attendEase_token', newAccessToken);
                localStorage.setItem('attendEase_refresh_token', newRefreshToken);

                // Update original request header
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Retry the original failed request
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