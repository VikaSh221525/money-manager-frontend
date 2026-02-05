import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem("token"),
    loading: false,
    error: null,

    signup: async (formData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post("/auth/signup", formData);
            localStorage.setItem("token", res.data.token);
            set({ user: res.data.user, token: res.data.token });

            toast.success("SignUp successfull 🎉");
            return true;
        } catch (err) {
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
            localStorage.setItem("token", res.data.token);
            set({ user: res.data.user, token: res.data.token });

            toast.success("Login successfull ✅");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid credentials");
            return false;
        } finally {
            set({ loading: false });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
    },

    getMe: async () => {
        try {
            const res = await axios.get("/auth/me");
            set({ user: res.data });
        } catch {
            set({ user: null, token: null });
            localStorage.removeItem("token");
        }
    }
}));