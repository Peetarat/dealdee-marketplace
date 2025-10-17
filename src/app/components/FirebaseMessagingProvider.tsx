'''use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { app, auth, functions } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { httpsCallable } from 'firebase/functions';

const saveFcmToken = httpsCallable(functions, 'saveFcmToken');

const FirebaseMessagingProvider = ({ children }: { children: React.ReactNode }) => {
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const requestPermission = async () => {
      try {
        const messaging = getMessaging(app);
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          console.log('Notification permission granted.');
          const token = await getToken(messaging, {
            vapidKey: 'BPWDER-cfB8U8xvnTVAjDxRnJ1TnWLhtrjOoO-yjxYcXAQBJ20kOp6ckggg1NI7-fDJNA_Ro9XG2EVsThNdgX7w',
          });
          if (token) {
            console.log('FCM Token:', token);
            await saveFcmToken({ token });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };

    requestPermission();
  }, [user]);

  return <>{children}</>;
};

export default FirebaseMessagingProvider;
'''