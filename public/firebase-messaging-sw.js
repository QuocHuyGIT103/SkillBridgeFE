// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Firebase config - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyCJnrntwfpqW6n_QGf9xAe8aog7vgs9Tro",
  authDomain: "skillbridge-notifications.firebaseapp.com",
  projectId: "skillbridge-notifications",
  storageBucket: "skillbridge-notifications.firebasestorage.app",
  messagingSenderId: "513849837225",
  appId: "1:513849837225:web:c5bbc3404b88c1f1910bb8",
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // Add your app icon
    badge: "/firebase-logo.png",
    tag: payload.messageId,
    data: payload.data,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/view-icon.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/dismiss-icon.png",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Handle notification click action
  event.waitUntil(
    clients.openWindow("https://your-app-domain.com") // Replace with your app URL
  );
});
