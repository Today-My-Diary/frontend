import { useEffect, useCallback, useRef } from "react";
import { messaging, getToken, onMessage } from "../config/firebase";
import { env } from "../config/env";
import { useToast } from "./useToast";
import { useFCMStore } from "../stores/useFCMStore";

async function fetchFCMToken() {
  if (!messaging) return null;
  try {
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const registration = await navigator.serviceWorker.ready;
    return await getToken(messaging, {
      vapidKey: env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    console.error("FCM Init Error:", error);
    return null;
  }
}

interface UseFCMOptions {
  withToastListener?: boolean;
}

export const useFCM = ({ withToastListener = false }: UseFCMOptions = {}) => {
  const { fcmToken, setFcmToken } = useFCMStore();
  const { showToast } = useToast();
  const isInitialized = useRef(false);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await fetchFCMToken();
        if (token) setFcmToken(token);
      } else {
        showToast({
          description: "알림 권한이 거부되었습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Permission Error:", error);
      showToast({ description: "알림 설정 오류", type: "error" });
    }
  }, [showToast, setFcmToken]);

  // withToastListener인 경우 (최상단 컴포넌트에서만 사용)
  useEffect(() => {
    if (!withToastListener || !("Notification" in window)) return;
    if (
      Notification.permission === "granted" &&
      !isInitialized.current &&
      !fcmToken
    ) {
      isInitialized.current = true;
      fetchFCMToken().then((token) => {
        if (token) setFcmToken(token);
        else isInitialized.current = false;
      });
    }
    console.log("FCM Token:", fcmToken);
  }, [withToastListener, fcmToken, setFcmToken]);

  useEffect(() => {
    if (!withToastListener || !messaging || !("Notification" in window)) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      if (!payload.notification?.title) return;
      showToast({
        description: `${payload.notification.title}\n${payload.notification.body || ""}`,
        type: "info",
      });
    });
    return () => unsubscribe();
  }, [withToastListener, showToast]);

  return { fcmToken, requestPermission };
};
