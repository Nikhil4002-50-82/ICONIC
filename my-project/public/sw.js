self.addEventListener("push", (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      actions: [
        { action: "taken", title: "Mark as Taken" },
        { action: "missed", title: "Mark as Missed" }
      ]
    });
  });
  
  self.addEventListener("notificationclick", (event) => {
    if (event.action === "taken" || event.action === "missed") {
      fetch(`/api/update-medicine-status`, {
        method: "POST",
        body: JSON.stringify({ status: event.action }),
        headers: { "Content-Type": "application/json" }
      });
    }
    event.notification.close();
  });
  