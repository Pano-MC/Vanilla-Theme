import { writable } from "svelte/store";

import { sendLogout } from "$lib/services/auth.js";
import { invalidateAll } from "$app/navigation";
import { redirect } from "@sveltejs/kit";

export const notificationsCount = writable(0);
export const quickNotifications = writable([]);

export const initialized = writable(false);

export async function logout() {
  sendLogout().then(async () => {
    await invalidateAll();
  });
}

export function requireLogin(session) {
  if (!session.user) {
    throw redirect(302, "/");
  }
}

export function requireNotLogin(session) {
  if (session.user) {
    throw redirect(302, "/");
  }
}
