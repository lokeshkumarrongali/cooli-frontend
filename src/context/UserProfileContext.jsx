import { useState, useEffect } from "react";
import api from "../api/axios";
import { auth } from "../config/firebase";
import { UserProfileContext } from "./UserProfileContextObject";

const STORAGE_KEY = "cooli_profile";

const DEFAULT_PROFILE = {
  sharedProfile: {
    name: "",
    email: "",
    phone: "",
    photo: "",
    address: {
      houseNo: "",
      street: "",
      village: "",
      mandal: "",
      district: "",
      state: "",
      country: "",
      pincode: ""
    },
    bio: ""
  },
  workerProfile: {
    skills: [],
    experience: "",
    expectedWage: "",
    availability: "",
    portfolio: []
  },
  employerProfile: {
    businessName: "",
    businessType: "",
    companyDescription: ""
  }
};

export function UserProfileProvider({ children }) {
  const [profileData, setProfileData] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : DEFAULT_PROFILE;
    } catch (error) {
      return DEFAULT_PROFILE;
    }
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch if we have a firebase user logged in
      if (!auth.currentUser) {
        setIsLoaded(true);
        return;
      }

      try {
        const response = await api.get("/profile");
        if (response.data?.data) {
          const remoteData = response.data.data;
          setProfileData(remoteData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
        }
      } catch (error) {
        console.error("Failed to fetch profile from server:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    // Watch for auth changes to trigger fetch
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile();
      } else {
        // Clear data on logout
        setProfileData(DEFAULT_PROFILE);
        setIsLoaded(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2️⃣ Automatically Save Profile to Backend & LocalStorage when state changes
  useEffect(() => {
    if (!isLoaded || !auth.currentUser) return;

    const saveTimeout = setTimeout(async () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
        const response = await api.put("/profile", profileData);
        if (response.data?.data) {
          const remoteData = response.data.data;
          // Apply strictly without re-triggering the same effect continuously
          setProfileData(prev => {
            if (JSON.stringify(prev) === JSON.stringify(remoteData)) return prev;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
            return remoteData;
          });
        }
      } catch (error) {
        console.error("Failed to sync profile with server:", error);
      }
    }, 1500);

    return () => clearTimeout(saveTimeout);
  }, [profileData, isLoaded]);

  const updateSharedProfile = (data) => {
    setProfileData((prev) => ({
      ...prev,
      sharedProfile: { ...prev.sharedProfile, ...data }
    }));
  };

  const updateWorkerProfile = (data) => {
    setProfileData((prev) => ({
      ...prev,
      workerProfile: { ...prev.workerProfile, ...data }
    }));
  };

  const updateEmployerProfile = (data) => {
    setProfileData((prev) => ({
      ...prev,
      employerProfile: { ...prev.employerProfile, ...data }
    }));
  };

  return (
    <UserProfileContext.Provider
      value={{
        profileData,
        updateSharedProfile,
        updateWorkerProfile,
        updateEmployerProfile
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}
