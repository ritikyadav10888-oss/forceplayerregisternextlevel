import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';

export default function AnnouncementsScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();

    const announcements = [
        {
            id: '1',
            title: 'Tournament Schedule Update',
            message: 'The Mumbai Monsoon Trophy dates have been shifted from July 15th to July 20th due to weather forecasts. Please check your team schedule.',
            date: '2 hours ago',
            category: 'Update',
            icon: 'calendar',
            color: '#3B82F6',
            important: true
        },
        {
            id: '2',
            title: 'New Feature: Skill Analytics',
            message: 'You can now track your detailed performance stats including stamina, accuracy, and win rates in the new Analytics tab.',
            date: 'Yesterday',
            category: 'Feature',
            icon: 'analytics',
            color: '#10B981',
            important: false
        },
        {
            id: '3',
            title: 'Maintenance Notice',
            message: 'Force Player app will be under scheduled maintenance tonight from 2:00 AM to 4:00 AM IST. All services will be temporarily unavailable.',
            date: '1 day ago',
            category: 'Alert',
            icon: 'construct',
            color: '#F59E0B',
            important: false
        },
        {
            id: '4',
            title: 'Welcome to Regional Qualifiers',
            message: 'Registration is now open for the All-India Regional Qualifiers. Sign up today and showcase your skills on the national stage!',
            date: '3 days ago',
            category: 'Event',
            icon: 'trophy',
            color: '#8B5CF6',
            important: true
        }
    ];

    const AnnouncementCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={`${item.icon}-outline`} size={24} color={item.color} />
                </View>
                <View style={styles.headerContent}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.category, { color: item.color }]}>{item.category}</Text>
                        {item.important && (
                            <View style={[styles.importantTag, { backgroundColor: theme.error + '15' }]}>
                                <Text style={[styles.importantText, { color: theme.error }]}>Important</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.date, { color: theme.textSecondary }]}>{item.date}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.message, { color: theme.textSecondary }]}>{item.message}</Text>
            </View>

            <TouchableOpacity style={styles.readMore}>
                <Text style={[styles.readMoreText, { color: theme.primary }]}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Announcements</Text>
                    <View style={{ width: 40 }}>
                        <TouchableOpacity style={[styles.markRead, { backgroundColor: theme.card }]}>
                            <Ionicons name="checkmark-done" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.welcomeInfo}>
                        <View style={styles.bellIconBox}>
                            <Ionicons name="notifications" size={32} color={theme.primary} />
                        </View>
                        <Text style={[styles.welcomeTitle, { color: theme.text }]}>Stay Informed</Text>
                        <Text style={[styles.welcomeDesc, { color: theme.textSecondary }]}>
                            Catch up on the latest tournament updates, feature releases, and community news.
                        </Text>
                    </View>

                    {announcements.map((item) => (
                        <AnnouncementCard key={item.id} item={item} />
                    ))}

                    <View style={styles.footer}>
                        <Ionicons name="shield-checkmark" size={20} color={theme.textLight} />
                        <Text style={[styles.footerText, { color: theme.textLight }]}>
                            Verified Official Announcements
                        </Text>
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
    markRead: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },

    scrollContent: { padding: spacing.l },

    welcomeInfo: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    bellIconBox: { width: 70, height: 70, borderRadius: 25, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    welcomeTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
    welcomeDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

    card: { borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconContainer: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    headerContent: { flex: 1, marginLeft: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    category: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    importantTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    importantText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    date: { fontSize: 12, marginTop: 2, fontWeight: '600' },

    cardBody: { marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    message: { fontSize: 14, lineHeight: 22 },

    readMore: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
    readMoreText: { fontSize: 14, fontWeight: '800', marginRight: 4 },

    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    footerText: { fontSize: 12, fontWeight: '700', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 }
});
