import * as Notifications from 'expo-notifications';

export async function sendExpiryNotification(items) {
  if (!items || items.length === 0) return;
  const names = items.map(i => i.name).join(', ');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expiring Soon!',
      body: `The following items are about to expire: ${names}`,
      sound: true,
    },
    trigger: null,
  });
}
