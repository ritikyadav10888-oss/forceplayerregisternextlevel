import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';

export default function PrivacySecurityScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { revokeOtherSessions, userData } = useAuth();

    const [twoFactor, setTwoFactor] = useState(false);
    const [profileVisible, setProfileVisible] = useState(true);
    const [revoking, setRevoking] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    const formatLastSeen = (timestamp) => {
        if (!timestamp) return 'Unknown';
        try {
            const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
            const seconds = Math.floor((new Date() - date) / 1000);

            if (seconds < 60) return 'just now';
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            if (days < 7) return `${days}d ago`;

            return date.toLocaleDateString();
        } catch (e) {
            return 'Recently';
        }
    };

    const handleRevokeSessions = async () => {
        Alert.alert(
            "Security Confirmation",
            "This will instantly log you out from all other devices (laptops, other phones). You will remain logged in on this device. Proceed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log out all others",
                    style: "destructive",
                    onPress: async () => {
                        setRevoking(true);
                        try {
                            await revokeOtherSessions();
                            Alert.alert("Success", "All other sessions have been terminated successfully.");
                        } catch (error) {
                            Alert.alert("Error", "Failed to revoke sessions. Please try again.");
                        } finally {
                            setRevoking(false);
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, label, subLabel, value, onToggle, onPress, type = 'link', color = theme.text }) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={type === 'toggle'}
        >
            <View style={[styles.settingIcon, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
                {subLabel && <Text style={[styles.settingSubLabel, { color: theme.textSecondary }]}>{subLabel}</Text>}
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFF"
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
            )}
        </TouchableOpacity>
    );

    const Section = ({ title, children }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {children}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backButton, { backgroundColor: theme.card }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('privacy')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <Section title="Password Security">
                        <SettingItem
                            icon="key-outline"
                            label="Change Password"
                            subLabel="Securely update your login credentials"
                            onPress={() => navigation.navigate('ChangePassword')}
                            color="#F57C00"
                        />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label="Two-Factor Authentication (2FA)"
                            subLabel="Add an extra layer of protection"
                            type="toggle"
                            value={twoFactor}
                            onToggle={setTwoFactor}
                            color="#10B981"
                        />
                    </Section>

                    <Section title="Privacy Controls">
                        <SettingItem
                            icon="eye-outline"
                            label="Public Profile Visibility"
                            subLabel="Control who can see your stats"
                            type="toggle"
                            value={profileVisible}
                            onToggle={setProfileVisible}
                            color="#8B5CF6"
                        />
                        <SettingItem
                            icon="document-lock-outline"
                            label="Data Usage Policy"
                            subLabel="Review how your data is handled"
                            onPress={() => navigation.navigate('PrivacyPolicy')}
                            color="#F43F5E"
                        />
                    </Section>

                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Device Management</Text>
                        <View style={[styles.deviceCountBadge, { backgroundColor: theme.primary }]}>
                            <Text style={styles.deviceCountText}>2</Text>
                        </View>
                    </View>
                    <View style={styles.deviceList}>
                        <View style={[styles.deviceItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={[styles.deviceIcon, { backgroundColor: `${theme.primary}15` }]}>
                                <Ionicons name={Device.deviceType === Device.DeviceType.PHONE ? "phone-portrait-outline" : "tablet-portrait-outline"} size={24} color={theme.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.deviceName, { color: theme.text }]}>
                                    {Device.modelName || 'Current Device'} (Active)
                                </Text>
                                <Text style={[styles.deviceInfo, { color: theme.textSecondary }]}>
                                    {Device.osName} {Device.osVersion} • {isOnline ? "Connected" : "No Internet"}
                                </Text>
                            </View>
                            <Text style={[styles.deviceAction, { color: isOnline ? theme.success : theme.error }]}>
                                {isOnline ? "Online" : "Offline"}
                            </Text>
                        </View>

                        {/* If there's another device recorded, show it as 'Other' */}
                        {userData?.deviceInfo?.model && userData.deviceInfo.model !== Device.modelName && (
                            <View style={[styles.deviceItem, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 12 }]}>
                                <View style={[styles.deviceIcon, { backgroundColor: `${theme.textSecondary}15` }]}>
                                    <Ionicons name="desktop-outline" size={24} color={theme.textSecondary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.deviceName, { color: theme.text }]}>{userData.deviceInfo.model}</Text>
                                    <Text style={[styles.deviceInfo, { color: theme.textSecondary }]}>
                                        {userData.deviceInfo.os} {userData.deviceInfo.osVersion} • Last seen {formatLastSeen(userData.deviceInfo.lastActive)}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRevokeSessions()}>
                                    <Text style={[styles.deviceAction, { color: theme.error }]}>Log out</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.logoutAllBtn, revoking && { opacity: 0.5 }]}
                            onPress={handleRevokeSessions}
                            disabled={revoking}
                        >
                            <Text style={[styles.logoutAllText, { color: theme.primary }]}>
                                {revoking ? "Terminating sessions..." : "Log out of all other sessions"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    scrollContent: { padding: spacing.l },

    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
    sectionCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },

    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    settingIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    settingContent: { flex: 1 },
    settingLabel: { fontSize: 16, fontWeight: '700' },
    settingSubLabel: { fontSize: 12, marginTop: 2 },

    deviceItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1, marginTop: 4 },
    deviceIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    deviceName: { fontSize: 16, fontWeight: '800' },
    deviceInfo: { fontSize: 12, marginTop: 2 },
    deviceAction: { fontSize: 13, fontWeight: '700' },

    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 },
    deviceCountBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
    deviceCountText: { color: '#FFF', fontSize: 11, fontWeight: '900' },
    deviceList: { marginBottom: 28 },
    logoutAllBtn: { alignSelf: 'center', marginTop: 16 },
    logoutAllText: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' }
});
