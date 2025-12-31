import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();

    const socialLinks = [
        { name: 'logo-instagram', color: '#E1306C', url: 'https://instagram.com' },
        { name: 'logo-twitter', color: '#1DA1F2', url: 'https://twitter.com' },
        { name: 'logo-facebook', color: '#4267B2', url: 'https://facebook.com' },
        { name: 'logo-github', color: theme.text, url: 'https://github.com' }
    ];

    const FeatureItem = ({ icon, title, desc }) => (
        <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name={icon} size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{desc}</Text>
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('about')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* App Logo & Mission */}
                    <View style={styles.logoSection}>
                        <LinearGradient
                            colors={[theme.primary, '#8B5CF6']}
                            style={styles.logoGradient}
                        >
                            <Ionicons name="flash" size={60} color="#FFF" />
                        </LinearGradient>
                        <Text style={[styles.appName, { color: theme.text }]}>Force Player</Text>
                        <Text style={[styles.tagline, { color: theme.primary }]}>Elevate Your Game</Text>
                        <Text style={[styles.missionText, { color: theme.textSecondary }]}>
                            Force Player is India's premier multi-sport tournament platform, designed to bridge the gap between passion and professional play. We empower athletes by providing seamless tournament registrations, real-time performance tracking, and community engagement.
                        </Text>
                    </View>

                    {/* Features Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>What We Offer</Text>
                        <FeatureItem
                            icon="trophy-outline"
                            title="Tournament Management"
                            desc="Easy registration and participation in top-tier local and national tournaments."
                        />
                        <FeatureItem
                            icon="stats-chart-outline"
                            title="Skill Analytics"
                            desc="Track your progress with detailed performance metrics and career stats."
                        />
                        <FeatureItem
                            icon="people-outline"
                            title="Team Collaboration"
                            desc="Form teams, manage rosters, and coordinate with teammates effortlessly."
                        />
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>10K+</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Players</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>500+</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tournaments</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>50+</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Cities</Text>
                        </View>
                    </View>

                    {/* Social Media */}
                    <View style={styles.socialSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text, textAlign: 'center' }]}>Follow Our Community</Text>
                        <View style={styles.socialIconsRow}>
                            {socialLinks.map((link, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.socialIconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                                    onPress={() => Linking.openURL(link.url)}
                                >
                                    <Ionicons name={link.name} size={24} color={link.color} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Footer Info */}
                    <View style={styles.footer}>
                        <Text style={[styles.versionText, { color: theme.textLight }]}>Version 1.0.0 (Gold)</Text>
                        <Text style={[styles.copyrightText, { color: theme.textSecondary }]}>© 2025 Force Player Inc. All Rights Reserved.</Text>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                                <Text style={[styles.footerLink, { color: theme.primary }]}>Terms</Text>
                            </TouchableOpacity>
                            <View style={[styles.footerDot, { backgroundColor: theme.textLight }]} />
                            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                                <Text style={[styles.footerLink, { color: theme.primary }]}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

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

    logoSection: { alignItems: 'center', marginBottom: 40 },
    logoGradient: { width: 120, height: 120, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15 },
    appName: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
    tagline: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 },
    missionText: { fontSize: 15, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },

    section: { marginBottom: 40 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
    featureIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    featureTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
    featureDesc: { fontSize: 13, lineHeight: 18 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, gap: 12 },
    statBox: { flex: 1, padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
    statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

    socialSection: { marginBottom: 40 },
    socialIconsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
    socialIconBtn: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },

    footer: { alignItems: 'center' },
    versionText: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
    copyrightText: { fontSize: 13, marginBottom: 16 },
    footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    footerLink: { fontSize: 14, fontWeight: '700' },
    footerDot: { width: 4, height: 4, borderRadius: 2 }
});
