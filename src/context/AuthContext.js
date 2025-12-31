import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword as firebaseUpdatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    initializeApp
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionStartTime, setSessionStartTime] = useState(null);

    // Auth State Listener
    useEffect(() => {
        let unsubscribeSnapshot;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);

            if (firebaseUser) {
                // Ensure session start time exists for this session
                let storedTime = await AsyncStorage.getItem('sessionStartTime');
                if (!storedTime) {
                    const now = Date.now();
                    await AsyncStorage.setItem('sessionStartTime', now.toString());
                    setSessionStartTime(now);
                } else {
                    setSessionStartTime(parseInt(storedTime));
                }
            }

            // Clean up previous listener if any
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                unsubscribeSnapshot = null;
            }

            try {
                if (firebaseUser) {
                    setUser(firebaseUser);
                    const userRef = doc(db, 'users', firebaseUser.uid);

                    // Subscribe to real-time updates
                    unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setUserData(data);

                            // Check for session revocation
                            if (data.revocationDate && sessionStartTime) {
                                const revocationTime = data.revocationDate?.toMillis?.() || 0;
                                if (revocationTime > sessionStartTime) {
                                    console.log('Session revoked. Logging out...');
                                    logout();
                                }
                            }
                        } else {
                            setUserData(null);
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error('Snapshot Error:', error);
                        setLoading(false);
                    });
                } else {
                    setUser(null);
                    setUserData(null);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Auth State Change Error:', error.message);
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
            }
        };
    }, []);

    const register = async (email, password, role, additionalData = {}) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                role: role,
                createdAt: new Date().toISOString(),
                deviceInfo: {
                    model: Device.modelName || 'Unknown Device',
                    os: Device.osName || 'Unknown OS',
                    osVersion: Device.osVersion || '',
                    lastActive: new Date().toISOString()
                },
                ...additionalData
            });

            return user;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Set session start time
            const now = Date.now();
            await AsyncStorage.setItem('sessionStartTime', now.toString());
            setSessionStartTime(now);

            // Record device info
            const userRef = doc(db, 'users', userCredential.user.uid);
            await updateDoc(userRef, {
                deviceInfo: {
                    model: Device.modelName || 'Unknown Device',
                    os: Device.osName || 'Unknown OS',
                    osVersion: Device.osVersion || '',
                    lastActive: new Date().toISOString()
                }
            });

            return userCredential.user;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('sessionStartTime');
            await signOut(auth);
            setUserData(null);
            setUser(null);
            setSessionStartTime(null);
        } catch (error) {
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw error;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            if (!auth.currentUser) throw new Error("No user logged in");
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await firebaseUpdatePassword(auth.currentUser, newPassword);
        } catch (error) {
            throw error;
        }
    };

    const createOrganizer = async (email, password, organizationName, phoneNumber, idCardDetails) => {
        try {
            const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
            const { getAuth: getSecondaryAuth } = await import('firebase/auth');
            const secondaryAuth = getSecondaryAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCredential.user;

            await setDoc(doc(db, 'users', newUser.uid), {
                uid: newUser.uid,
                email: newUser.email,
                role: 'organizer',
                organizationName: organizationName,
                phoneNumber: phoneNumber,
                idCardDetails: idCardDetails,
                isVerified: true,
                createdAt: new Date().toISOString()
            });

            await secondaryAuth.signOut();
            await secondaryApp.delete();

            return newUser;
        } catch (error) {
            throw error;
        }
    };

    const revokeOtherSessions = async () => {
        try {
            if (!user) return;
            const now = Date.now();

            // Update Firestore revocation date
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                revocationDate: serverTimestamp()
            });

            // Update local session start time to prevent current device from logging out
            await AsyncStorage.setItem('sessionStartTime', now.toString());
            setSessionStartTime(now);

            return true;
        } catch (error) {
            console.error('Revocation Error:', error);
            throw error;
        }
    };

    const value = {
        user,
        userData,
        loading,
        register,
        login,
        logout,
        resetPassword,
        changePassword,
        createOrganizer,
        revokeOtherSessions
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
