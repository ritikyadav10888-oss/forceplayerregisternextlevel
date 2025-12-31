import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function OrganizerSettingsScreen({ navigation }) {
    const { userData, logout } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { t } = useLanguage();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout, style: 'destructive' }
            ]
        );
    };

    const SettingItem = ({ icon, label, type, value, onToggle, onPress, color = theme.text }) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: theme.border, backgroundColor: theme.card }]}
            onPress={type === 'action' ? onPress : () => type === 'toggle' && onToggle(!value)}
            disabled={type === 'toggle'}
        >
            <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC' }]}>
                <Ionicons name={icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.settingLabel, { color }]}>{label}</Text>

            {type === 'toggle' && (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={'#FFF'}
                />
            )}
            {type === 'action' && (
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            )}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }) => (
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{title}</Text>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.card }]}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.profileHeader}>
                            <View style={[styles.avatarContainer, { backgroundColor: theme.secondary }]}>
                                <Text style={styles.avatarText}>{userData?.organizationName?.charAt(0) || 'O'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.profileName, { color: theme.text }]}>{userData?.organizationName || 'Organization Name'}</Text>
                                <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{userData?.email || 'admin@example.com'}</Text>
                                <View style={[styles.verifiedBadge, { backgroundColor: isDarkMode ? `${theme.success}15` : '#ECFDF5' }]}>
                                    <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                                    <Text style={[styles.verifiedText, { color: theme.success }]}>Verified Account</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.background }]}>
                                <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* General Settings */}
                    <SectionHeader title="General" />
                    <View style={[styles.sectionCard, { borderColor: theme.border }]}>
                        <SettingItem
                            icon="notifications-outline"
                            label="Push Notifications"
                            type="toggle"
                            value={notificationsEnabled}
                            onToggle={setNotificationsEnabled}
                        />
                        <SettingItem
                            icon="moon-outline"
                            label="Dark Mode"
                            type="toggle"
                            value={isDarkMode}
                            onToggle={toggleTheme}
                        />
                    </View>

                    {/* Tournament Preferences */}
                    <SectionHeader title="Tournament Preferences" />
                    <View style={[styles.sectionCard, { borderColor: theme.border }]}>
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label="Auto-Approve Teams"
                            type="toggle"
                            value={autoApprove}
                            onToggle={setAutoApprove}
                        />
                        <SettingItem
                            icon="card-outline"
                            label="Payment Methods"
                            type="action"
                            onPress={() => console.log('Payments')}
                        />
                        <SettingItem
                            icon="document-text-outline"
                            label="Default Rules"
                            type="action"
                            onPress={() => console.log('Rules')}
                        />
                    </View>

                    {/* Support & Legal */}
                    <SectionHeader title="Support" />
                    <View style={[styles.sectionCard, { borderColor: theme.border }]}>
                        <SettingItem
                            icon="help-circle-outline"
                            label="Help Center"
                            type="action"
                            onPress={() => navigation.navigate('HelpCenter')}
                        />
                        <SettingItem
                            icon="lock-closed-outline"
                            label="Privacy Policy"
                            type="action"
                            onPress={() => navigation.navigate('PrivacyPolicy')}
                        />
                        <SettingItem
                            icon="log-out-outline"
                            label="Log Out"
                            type="action"
                            onPress={handleLogout}
                            color={theme.error}
                        />
                    </View>

                    <Text style={[styles.versionText, { color: theme.textLight }]}>Version 1.0.0 • Force Player Registration</Text>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    scrollContent: { padding: spacing.l, paddingTop: 0, paddingBottom: 100 },

    profileCard: { borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, borderWidth: 1 },
    profileHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
    profileName: { fontSize: 18, fontWeight: '800' },
    profileEmail: { fontSize: 13, marginBottom: 4 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start' },
    verifiedText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
    editButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    editButtonText: { fontSize: 12, fontWeight: '700' },

    sectionHeader: { fontSize: 12, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 4 },
    sectionCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 24, borderWidth: 1 },

    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    settingIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: '600' },

    versionText: { textAlign: 'center', fontSize: 12, marginTop: 12, marginBottom: 24, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }
});
