import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function PlayerSettingsScreen({ navigation }) {
    const { logout } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { language, changeLanguage, t } = useLanguage();
    const [notifications, setNotifications] = useState(true);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            "Are you sure you want to logout?",
            [
                { text: t('cancel'), style: "cancel" },
                { text: t('logout'), style: "destructive", onPress: logout }
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
                <Text style={[styles.settingLabel, { color: type === 'toggle' && color !== theme.text ? color : theme.text }]}>{label}</Text>
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
                <View style={styles.linkAction}>
                    {subLabel && <Text style={[styles.currentValueText, { color: theme.primary }]}>{value}</Text>}
                    <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
                </View>
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

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
        { code: 'hi_en', name: 'Hinglish', native: 'Hindi + English' },
        { code: 'mr', name: 'Marathi', native: 'मराठी' },
        { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা' },
        { code: 'te', name: 'Telugu', native: 'తెలుగు' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
        { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
        { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
    ];

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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('settings')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Account Section */}
                    <Section title={t('account')}>
                        <SettingItem
                            icon="person-outline"
                            label={t('editProfile')}
                            subLabel={t('editProfileSub')}
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label={t('privacy')}
                            subLabel={t('privacySub')}
                            onPress={() => navigation.navigate('PrivacySecurity')}
                        />
                    </Section>

                    {/* Preferences Section */}
                    <Section title={t('preferences')}>
                        <SettingItem
                            icon="notifications-outline"
                            label={t('notifications')}
                            type="toggle"
                            value={notifications}
                            onToggle={setNotifications}
                            color={theme.primary}
                        />
                        <SettingItem
                            icon="moon-outline"
                            label={t('darkMode')}
                            type="toggle"
                            value={isDarkMode}
                            onToggle={toggleTheme}
                            color="#6366F1"
                        />
                        <SettingItem
                            icon="language-outline"
                            label={t('language')}
                            value={languages.find(l => l.code === language)?.native}
                            onPress={() => setShowLanguageModal(true)}
                        />
                    </Section>

                    {/* Support Section */}
                    <Section title={t('support')}>
                        <SettingItem
                            icon="help-circle-outline"
                            label={t('helpCenter')}
                            onPress={() => navigation.navigate('HelpCenter')}
                        />
                        <SettingItem
                            icon="information-circle-outline"
                            label={t('about')}
                            onPress={() => navigation.navigate('About')}
                        />
                        <SettingItem
                            icon="star-outline"
                            label={t('rateUs')}
                            onPress={() => navigation.navigate('RateUs')}
                        />
                    </Section>

                    {/* Actions */}
                    <View style={{ marginTop: 24, paddingBottom: 40 }}>
                        <TouchableOpacity
                            style={[
                                styles.logoutButton,
                                { backgroundColor: isDarkMode ? '#450a0a' : '#FEF2F2', borderColor: isDarkMode ? '#7f1d1d' : '#FEE2E2' }
                            ]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={20} color={theme.error} style={{ marginRight: 8 }} />
                            <Text style={[styles.logoutText, { color: theme.error }]}>{t('logout')}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.versionText, { color: theme.textLight }]}>{t('version')} 1.0.0 (Build 20251230)</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Language Selection Modal */}
            <Modal
                visible={showLanguageModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('language')}</Text>
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.languageList}>
                                {languages.map((item) => (
                                    <TouchableOpacity
                                        key={item.code}
                                        style={[
                                            styles.languageItem,
                                            { borderBottomColor: theme.border },
                                            language === item.code && { backgroundColor: `${theme.primary}10` }
                                        ]}
                                        onPress={() => {
                                            changeLanguage(item.code);
                                            setShowLanguageModal(false);
                                        }}
                                    >
                                        <View>
                                            <Text style={[styles.languageName, { color: theme.text }]}>{item.name}</Text>
                                            <Text style={[styles.languageNative, { color: theme.textSecondary }]}>{item.native}</Text>
                                        </View>
                                        {language === item.code && (
                                            <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    linkAction: { flexDirection: 'row', alignItems: 'center' },
    currentValueText: { fontSize: 14, fontWeight: '600', marginRight: 8 },

    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
    logoutText: { fontSize: 16, fontWeight: '800' },
    versionText: { fontSize: 12, textAlign: 'center', fontWeight: '500' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 400, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800' },
    languageList: { gap: 12 },
    languageItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderBottomWidth: 1 },
    languageName: { fontSize: 16, fontWeight: '700' },
    languageNative: { fontSize: 12, marginTop: 2 }
});
