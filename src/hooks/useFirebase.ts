import { useEffect } from "react";
import { firebaseService } from "../services/firebase.service";

export const useFirebase = () => {
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await firebaseService.initialize();
        console.log("Firebase initialized successfully");
      } catch (error) {
        console.error("Error initializing Firebase:", error);
      }
    };

    initFirebase();
  }, []);

  return {
    firebaseService,
  };
};
