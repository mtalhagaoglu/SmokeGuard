/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import firebase from '@react-native-firebase/app';
import OneSignal from 'react-native-onesignal';

const firebaseConfig = {
  apiKey: 'AIzaSyA9gidK-cCg2g2UZeyZJoFre8qLkKmgGwQ',
  authDomain: 'smokeguard-d10da.firebaseapp.com',
  databaseURL:
    'https://smokeguard-d10da-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'smokeguard-d10da',
  storageBucket: 'smokeguard-d10da.appspot.com',
  messagingSenderId: '35693728405',
  appId: '1:35693728405:web:e8dfb81920e780b2a1819c',
};

if (!firebase.apps.length) {
  console.log('Inıtıalıze Firebase');
  firebase.initializeApp(firebaseConfig);
}

// OneSignal Initialization
OneSignal.setAppId('2acf84c0-68ee-4f3d-be62-866cab05790c');

// promptForPushNotificationsWithUserResponse will show the native iOS or Android notification permission prompt.
// We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 8)
OneSignal.promptForPushNotificationsWithUserResponse();

//Method for handling notifications received while app in foreground
OneSignal.setNotificationWillShowInForegroundHandler(
  notificationReceivedEvent => {
    console.log(
      'OneSignal: notification will show in foreground:',
      notificationReceivedEvent,
    );
    let notification = notificationReceivedEvent.getNotification();
    console.log('notification: ', notification);
    const data = notification.additionalData;
    console.log('additionalData: ', data);
    // Complete with null means don't show a notification.
    notificationReceivedEvent.complete(notification);
  },
);

//Method for handling notifications opened
OneSignal.setNotificationOpenedHandler(notification => {
  console.log('OneSignal: notification opened:', notification);
});

AppRegistry.registerComponent(appName, () => App);
