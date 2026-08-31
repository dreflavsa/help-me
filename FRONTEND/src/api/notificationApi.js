import axiosClient from "./axiosClient";

export const listerNotificationsRequest = () =>
  axiosClient.get("/notifications");

export const marquerNotificationLueRequest = (id) =>
  axiosClient.patch(`/notifications/${id}/lue`);
