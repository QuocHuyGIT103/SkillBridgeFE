import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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

// Initialize Firebase Storage (force correct bucket if env misconfigured)
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucketEnv = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined)?.trim();

function toGsUrl(bucket?: string): string | undefined {
  if (!bucket) return undefined;
  // Strip gs:// or https:// prefix and any path, keep host only
  const normalized = bucket
    .replace(/^gs:\/\//i, '')
    .replace(/^https?:\/\/([^/]+).*/i, '$1')
    .trim();
  return `gs://${normalized}`;
}

const envBucketLooksValid = storageBucketEnv && /appspot\.com$/i.test(storageBucketEnv);
const bucketUrl = envBucketLooksValid
  ? toGsUrl(storageBucketEnv)
  : projectId
  ? `gs://${projectId}.appspot.com`
  : undefined;

const storage = bucketUrl ? getStorage(app, bucketUrl) : getStorage(app);

// Initialize Firebase Auth (used for Storage rules that require auth)
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// VAPID key for web push - Replace with your actual VAPID key
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Compute backend API base URL robustly (supports either VITE_API_URL or VITE_API_BASE_URL)
const API_BASE_URL = (import.meta.env.VITE_API_URL
  || (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1` : undefined)
  || 'http://localhost:3000/api/v1') as string;

class FirebaseService {
  private signingIn?: Promise<void>;

  // Try backend upload using Cloudinary endpoint as a fallback
  private async uploadViaBackend(
    file: File,
    destPath: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; name: string; type: string; size: number }> {
    try {
      // Extract conversationId from destPath: conversations/:id/(images|files)
      const match = destPath.match(/^conversations\/([^/]+)/i);
      const conversationId = match?.[1];
      const subdir = destPath.includes('/images') ? 'images' : (destPath.includes('/files') ? 'files' : 'attachments');
      if (!conversationId) {
        throw new Error('Không xác định được conversationId từ đường dẫn');
      }

      const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || '';
      const form = new FormData();
      form.append('file', file);

      if (onProgress) onProgress(10);
      const resp = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/attachments?subdir=${encodeURIComponent(subdir)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Lỗi upload tệp qua backend');
      }
      const json = await resp.json();
      const data = json?.data || json;
      if (onProgress) onProgress(100);
      return { url: data.url, name: file.name, type: file.type || 'application/octet-stream', size: file.size };
    } catch (err: any) {
      console.error('Backend upload error', err);
      throw new Error(err?.message || 'Lỗi tải tệp lên qua backend');
    }
  }

  // Ensure we have a Firebase auth user (anonymous sign-in for dev/test)
  private async ensureSignedIn(): Promise<void> {
    try {
      if (!auth.currentUser) {
        if (!this.signingIn) {
          this.signingIn = signInAnonymously(auth)
            .then(() => {})
            .catch((err) => {
            this.signingIn = undefined;
            throw err;
          });
        }
        await this.signingIn;
      }
    } catch (error) {
      // If anonymous sign-in fails, we continue; upload may still work on open rules
      console.warn("Firebase anonymous sign-in failed:", error);
    }
  }
  // Upload file to Firebase Storage with progress callback
  async uploadFile(
    file: File,
    destPath: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; name: string; type: string; size: number }> {
    // Make file name ASCII-safe to avoid edge cases with special characters
    const safeName = `${Date.now()}-${file.name}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "_");
    const fullPath = `${destPath}/${safeName}`;
    const storageRef = ref(storage, fullPath);

    try {
      // Ensure authentication if rules require request.auth != null
      await this.ensureSignedIn();

      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type || "application/octet-stream",
      });

      // Watchdog: if no progress for N seconds, cancel and trigger fallback
      let madeProgress = false;
      const WATCHDOG_MS = 8000; // 8s without progress -> fallback
      const watchdog = setTimeout(() => {
        if (!madeProgress) {
          try { (task as any).cancel?.(); } catch { /* ignore cancel errors */ }
        }
      }, WATCHDOG_MS);

      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snapshot) => {
            if (onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(Math.round(progress));
            }
            // Mark progress and clear watchdog when bytes start transferring
            if (snapshot.bytesTransferred > 0 && !madeProgress) {
              madeProgress = true;
              clearTimeout(watchdog);
            }
          },
          (error) => {
            clearTimeout(watchdog);
            const code = (error as any)?.code || 'unknown';
            let message = 'Lỗi tải tệp lên';
            switch (code) {
              case 'storage/unauthorized':
                message = 'Không có quyền truy cập Storage (kiểm tra rules hoặc đăng nhập).';
                break;
              case 'storage/bucket-not-found':
                message = 'Bucket không tồn tại hoặc cấu hình sai.';
                break;
              case 'storage/quota-exceeded':
                message = 'Vượt quá quota Firebase Storage.';
                break;
              case 'storage/canceled':
                message = 'Tải tệp đã bị hủy.';
                break;
              case 'storage/invalid-argument':
                message = 'Đường dẫn hoặc tham số upload không hợp lệ.';
                break;
              default:
                // If watchdog canceled due to no progress, surface specific message
                message = message || 'Không có tiến trình upload, chuyển sang backend.';
            }
            console.error('Firebase Storage upload error', { path: fullPath, code, error });
            reject(new Error(message));
          },
          () => {
            clearTimeout(watchdog);
            resolve();
          }
        );
      });

      const url = await getDownloadURL(task.snapshot.ref);
      return { url, name: safeName, type: file.type, size: file.size };
    } catch (err) {
      // Fallback: upload via backend Cloudinary endpoint
      console.warn('Firebase upload thất bại, chuyển sang backend upload', err);
      return await this.uploadViaBackend(file, destPath, onProgress);
    }
  }

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
      // Get access token from localStorage (support both key formats)
      const accessToken = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
      
      if (!accessToken) {
        console.warn("No access token found, skipping FCM token registration");
        return;
      }

      // Send token to your backend server
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/v1/notifications/register-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      if (response.ok) {
        console.log("FCM token sent to server successfully");
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Failed to send FCM token to server:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
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
