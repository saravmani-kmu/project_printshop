import api from "./client";
import type { User } from "../types";

export const getMe = () => api.get<User>("/auth/me").then((r) => r.data);
export const getGoogleLoginUrl = () => api.get<{ url: string }>("/auth/google/login").then((r) => r.data.url);
export const setUserType = (user_type: "retail" | "b2b") => api.post("/auth/set-user-type", { user_type });
export const logout = () => api.post("/auth/logout");
