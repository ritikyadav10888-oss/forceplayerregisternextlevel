import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
    apiKey: "AIzaSyD_mF_6--xpH5u_VhAwOrLa9Q7_wVR94OY",
    authDomain: "force-players.firebaseapp.com",
    projectId: "force-players",
    storageBucket: "force-players.firebasestorage.app",
    messagingSenderId: "501633872072",
    appId: "1:501633872072:web:ee5687a418aa5dcab8b5fd",
    measurementId: "G-WP15BDP4XM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    } catch (e) {
        auth = getAuth(app);
    }
}

export { auth };

export const db = (() => {
    try {
        return initializeFirestore(app, {
            experimentalAutoDetectLongPolling: true,
            forceLongPolling: true, // Force long polling for maximum compatibility
        });
    } catch (e) {
        return getFirestore(app);
    }
})();

export const storage = getStorage(app);
export default app;
