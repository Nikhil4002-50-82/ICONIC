import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import supabase from "../utils/supabase";

export default async function sendReminders() {
  const now = new Date().toISOString();

  const { data: reminders } = await supabase
    .from("reminders")
    .select("id, user_id, medicine_id, reminder_time, status")
    .eq("status", "pending")
    .lte("reminder_time", now);

  if (!reminders.length) return;

  for (const reminder of reminders) {
    await webpush.sendNotification(reminder.user_id, {
      title: "Medicine Reminder",
      body: `It's time to take your medicine!`,
    });

    await supabase
      .from("reminders")
      .update({ status: "sent" })
      .eq("id", reminder.id);
  }
}
