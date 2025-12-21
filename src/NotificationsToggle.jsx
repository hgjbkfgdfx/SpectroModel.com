import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { User } from "@/api/entities";

export default function NotificationsToggle() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const user = await User.me();
        setNotificationsEnabled(user?.notifications_enabled || false);
        
        if ('Notification' in window && user?.notifications_enabled) {
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
        }
      } catch (error) {
        console.log("Using default notification settings");
      }
    };
    loadPreference();
  }, []);

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    
    if (newState && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("Please allow notifications in your browser settings");
        return;
      }
    }
    
    setNotificationsEnabled(newState);
    
    try {
      await User.updateMyUserData({ notifications_enabled: newState });
      
      if (newState && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('SpectroModel Notifications', {
          body: 'Notifications are now enabled! You\'ll receive updates about your analysis.',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error("Failed to save notification preference:", error);
    }
  };

  if (typeof window !== 'undefined') {
    window.sendNotification = (title, body) => {
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    };
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleNotifications}
      className="bg-white hover:bg-slate-200"
      title={notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
    >
      {notificationsEnabled ? (
        <Bell className="w-5 h-5 text-black font-black" style={{ fontWeight: 900 }} />
      ) : (
        <BellOff className="w-5 h-5 text-black font-black" style={{ fontWeight: 900 }} />
      )}
    </Button>
  );
}