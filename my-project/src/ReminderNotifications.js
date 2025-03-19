import axios from "axios";

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return alert("This browser does not support notifications.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Please enable notifications in browser settings.");
    return;
  }

  const subscription = await navigator.serviceWorker.ready.then((reg) =>
    reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "YOUR_PUBLIC_VAPID_KEY"
    })
  );

  console.log("Push Subscription:", subscription);
  return subscription;
};

export const sendMedicineReminder = async (medicine) => {
  const subscription = await requestNotificationPermission();
  if (!subscription) return;

  await axios.post("/api/send-notification", {
    subscription,
    title: "Medicine Reminder",
    body: `Time to take ${medicine.name} (${medicine.dosage})`
  });

  console.log("Reminder sent for:", medicine.name);
};
