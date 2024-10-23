import { Fragment, useEffect, useRef, useState } from "react"
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from "react-native"
import useToast from "@/hooks/useToast"
import useAuth from "@/hooks/useAuth"
import { saveDeviceToken } from "@/services/supabase"



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  })
})


async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9b4427',
    });
  }
  await Notifications.setNotificationCategoryAsync('reply_comment', [
    {
      identifier: 'see',
      buttonTitle: 'Go to Comment',
      options: {
        opensAppToForeground: false
      }
    },
    {
      identifier: 'reply',
      buttonTitle: 'Reply',
      textInput: {
        placeholder: 'Type your reply here',
        submitButtonTitle: 'Send',
      },
      options: {
        opensAppToForeground: true,
      }
    }
  ])

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted to get push token for push notification!');
    }
    const pushTokenString = (await Notifications.getDevicePushTokenAsync()).data;
    return pushTokenString;
  } else {
    throw new Error('Must use physical device for push notifications');
  }
}




export default function NotificationProvider() {
  const toast = useToast();
  const { session } = useAuth();

  const user = session?.user;

  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!user) return;
    registerForPushNotificationsAsync()
      .then(token => saveDeviceToken(user.id as string, token))
      .catch((err: any) => toast.message(String(err.message || err)));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response)
      //  TODO: handle notification response
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [user]);

  return (
    <Fragment />
  )
}