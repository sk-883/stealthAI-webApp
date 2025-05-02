import { apiRequest } from "./queryClient";
import { User, LoginSchema } from "@shared/schema";

/**
 * Logs the user in
 * @param credentials The login credentials
 * @returns The user data
 */
export async function login(credentials: LoginSchema): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/login", credentials);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred during login");
  }
}

/**
 * Logs the user out
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest("POST", "/api/logout", {});
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to log out");
  }
}

/**
 * Registers a new user
 * @param userData The user data to register
 * @returns The created user data
 */
export async function register(userData: any): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/register", userData);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }
    const createdUser = await response.json();
    return createdUser;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred during registration");
  }
}

/**
 * Gets the current logged in user
 * @returns The user data or null if not logged in
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/user", {
      credentials: "include",
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to get current user");
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Checks if the user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
