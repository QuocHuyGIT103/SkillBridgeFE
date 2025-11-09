import { useEffect } from "react";
import { firebaseService } from "../services/firebase.service";
import { useAuthStore } from "../store/auth.store";

export const useFirebase = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only initialize Firebase when user is authenticated
    if (!isAuthenticated) {
      return;
    }

    const initFirebase = async () => {
      try {
        await firebaseService.initialize();
        console.log("Firebase initialized successfully");
      } catch (error) {
        console.error("Error initializing Firebase:", error);
      }
    };

    initFirebase();
  }, [isAuthenticated]);

  return {
    firebaseService,
  };
};
