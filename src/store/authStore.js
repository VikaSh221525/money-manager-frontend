import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null,

    signup: async (formData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post("/auth/signup", formData);
            console.log("Signup response:", res.data);

            localStorage.setItem("token", res.data.token);
            set({ user: res.data.user, token: res.data.token });
            console.log("User set in store after signup:", res.data.user);

            // Initialize default categories for new user
            try {
                await axios.post("/categories/initialize");
                console.log("Default categories initialized for new user");
            } catch (catError) {
                console.log("Categories initialization skipped or already exists:", catError.response?.data?.message);
            }

            toast.success("Account created successfully! Please login.");
            return true;
        } catch (err) {
            console.error("Signup error:", err);
            toast.error(err.response?.data?.message || "Signup failed");
            return false;
        } finally {
            set({ loading: false });
        }
    },

    login: async (formData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post("/auth/login", formData);
            console.log("Login response:", res.data);

            localStorage.setItem("token", res.data.token);
            set({ user: res.data.user, token: res.data.token });
            console.log("User set in store after login:", res.data.user);

            toast.success("Login successful ");
            return true;
        } catch (err) {
            console.error("Login error:", err);
            toast.error(err.response?.data?.message || "Invalid credentials");
            return false;
        } finally {
            set({ loading: false });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
        toast.success("Logged out successfully");
    },

    // Silent logout without toast (used internally)
    silentLogout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
    },

    getMe: async () => {
        const { token } = get();
        console.log("getMe called, token:", token);

        if (!token) {
            console.log("No token found, clearing user");
            set({ user: null, token: null });
            return;
        }

        set({ loading: true });
        try {
            const res = await axios.get("/auth/me");
            console.log("getMe response:", res.data);
            // The API returns { success: true, user: {...} }
            const userData = res.data.user || res.data;
            set({ user: userData, loading: false });
            console.log("User set in store after getMe:", userData);
        } catch (err) {
            console.error("Failed to fetch user data:", err);
            set({ user: null, token: null, loading: false });
            localStorage.removeItem("token");
        }
    },

    // Update user profile picture
    updateProfilePicture: (profilePicUrl) => {
        const { user } = get();
        if (user) {
            set({ user: { ...user, profilePic: profilePicUrl } });
        }
    }
}));