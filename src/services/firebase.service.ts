import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config - Replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// VAPID key for web push - Replace with your actual VAPID key
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

class FirebaseService {
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async getRegistrationToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log("Notification permission denied");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      if (token) {
        console.log("FCM Registration Token:", token);
        return token;
      } else {
        console.log("No registration token available.");
        return null;
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  setupForegroundMessageHandler(callback: (payload: any) => void): void {
    onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
      callback(payload);
    });
  }

  async sendTokenToServer(token: string): Promise<void> {
    try {
      // Send token to your backend server
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/v1/notifications/register-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      if (response.ok) {
        console.log("FCM token sent to server successfully");
      } else {
        console.error("Failed to send FCM token to server");
      }
    } catch (error) {
      console.error("Error sending FCM token to server:", error);
    }
  }

  async initialize(): Promise<void> {
    const token = await this.getRegistrationToken();
    if (token) {
      await this.sendTokenToServer(token);

      // Setup foreground message handler
      this.setupForegroundMessageHandler((payload) => {
        // Handle foreground notifications
        if (payload.notification) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/vite.svg", // Add your app icon
            tag: payload.data,
          });
        }
      });
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
