// src/utils/notifications.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permiso de notificaciones denegado');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-noise', {
      name: 'Daily Noise',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: true,
    });
  }

  return true;
}

export async function scheduleDailyNotification(hour = 10, minute = 0) {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await cancelDailyNotification();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎧 DAILY NOISE',
      body: 'Nuevo sonido para hoy. No lo ignores.',
      data: { type: 'daily-recommendation' },
      color: '#FF0000',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      ...(Platform.OS === 'android' && { channelId: 'daily-noise' }),
    },
  });

  console.log('Notificación diaria programada. ID:', id);
  return id;
}

export async function cancelDailyNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}