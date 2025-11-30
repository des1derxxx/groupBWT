import React from "react";
import { Notification } from "@mantine/core";

interface FormNotificationProps {
  visible: boolean;
  message: string;
  color: "red" | "green";
  onClose: () => void;
}

export const FormNotification: React.FC<FormNotificationProps> = ({
  visible,
  message,
  color,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Notification
      color={color}
      onClose={onClose}
      title={color === "green" ? "Успех" : "Ошибка"}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
      }}
    >
      {message}
    </Notification>
  );
};
