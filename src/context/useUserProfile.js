import { useContext } from "react";
import { UserProfileContext } from "./UserProfileContextObject";

/**
 * Custom hook to access user profile data and update functions.
 * Split into a separate file to satisfy Vite's Fast Refresh rules.
 */
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
