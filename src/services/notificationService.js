import api from "../api/axios";

export const fetchNotifications = () =>
  api.get("/notifications").then(res => res.data.data || []);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then(res => res.data);

export const markAllNotificationsRead = () =>
  api.patch("/notifications/read-all").then(res => res.data);
