export const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  };
  