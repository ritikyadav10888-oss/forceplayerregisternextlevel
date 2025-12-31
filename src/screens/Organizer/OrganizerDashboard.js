import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Image, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../styles/spacing';

import { useFocusEffect } from '@react-navigation/native';
import { getOrganizerStats, getOrganizerActivities } from '../../services/tournamentService';

export default function OrganizerDashboard({ navigation }) {
    const { userData, logout, user } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { width: windowWidth } = useWindowDimensions();
    const isLargeScreen = windowWidth > 768;
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [stats, setStats] = useState({ activeTournaments: 0, totalTeams: 0, pendingRequests: 0 });
    const [activities, setActivities] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!user?.uid) return;
        setRefreshing(true);
        try {
            const [newStats, newActivities] = await Promise.all([
                getOrganizerStats(user.uid),
                getOrganizerActivities(user.uid)
            ]);
            setStats(newStats);
            setActivities(newActivities);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [user])
    );

    const ui = useMemo(() => ({
        padding: isLargeScreen ? spacing.xxl : spacing.l,
        cardWidth: isLargeScreen ? '48%' : '100%',
        gridGap: spacing.m,
    }), [isLargeScreen]);

    const StatCard = ({ icon, label, value, gradient, subtext }) => (
        <LinearGradient colors={gradient} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.statHeader}>
                <View style={styles.statIconContainer}>
                    <Ionicons name={icon} size={22} color="#FFF" />
                </View>
                <Text style={styles.statValue}>{value}</Text>
            </View>
            <View>
                <Text style={styles.statLabel}>{label}</Text>
                {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
            </View>
        </LinearGradient>
    );

    const ActionButton = ({ icon, label, color, subtitle, onPress }) => (
        <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onPress}
        >
            <View style={[styles.actionIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={28} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
                <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    const ProfileRow = ({ icon, label, value }) => (
        <View style={styles.profileRow}>
            <View style={[styles.profileRowIcon, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#EEF2FF' }]}>
                <Ionicons name={icon} size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.profileLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.profileValue, { color: theme.text }]}>{value || 'Not Set'}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={[styles.header, { paddingHorizontal: ui.padding }]}>
                    <TouchableOpacity onPress={() => setShowProfileModal(true)}>
                        <View>
                            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
                            <Text style={[styles.orgName, { color: theme.text }]}>{userData?.organizationName || 'Organizer'}</Text>
                            <View style={[styles.verifiedBadge, { backgroundColor: isDarkMode ? `${theme.success}15` : '#ECFDF5' }]}>
                                <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                                <Text style={[styles.verifiedText, { color: theme.success }]}>Verified Account</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Announcements')}
                            style={[styles.notificationButton, { backgroundColor: theme.card }]}
                        >
                            <Ionicons name="notifications-outline" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={logout} style={[styles.logoutButton, { backgroundColor: isDarkMode ? `${theme.error}15` : '#FEF2F2' }]}>
                            <Ionicons name="log-out-outline" size={24} color={theme.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: ui.padding }]} showsVerticalScrollIndicator={false}>

                    {/* Dashboard Stats */}
                    <Text style={styles.sectionTitle}>Dashboard Overview</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -ui.padding, paddingHorizontal: ui.padding, marginBottom: spacing.xl }}>
                        <StatCard
                            icon="trophy-outline"
                            label="Active Tournaments"
                            value={stats.activeTournaments}
                            gradient={['#6366F1', '#4F46E5']}
                            subtext="Live Events"
                        />
                        <StatCard
                            icon="people-outline"
                            label="Total Teams"
                            value={stats.totalTeams}
                            gradient={['#EC4899', '#DB2777']}
                            subtext="Approved Squads"
                        />
                        <StatCard
                            icon="alert-circle-outline"
                            label="Pending Requests"
                            value={stats.pendingRequests}
                            gradient={['#F59E0B', '#D97706']}
                            subtext="Awaiting Action"
                        />
                        <StatCard
                            icon="cash-outline"
                            label="Total Revenue"
                            value="₹12k"
                            gradient={['#10B981', '#059669']}
                            subtext="Updated today"
                        />
                    </ScrollView>

                    {/* Management Console */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Management Console</Text>
                    <View style={styles.actionsGrid}>
                        <ActionButton
                            icon="add-circle-outline"
                            label="Create Tournament"
                            subtitle="Setup new event & brackets"
                            color={theme.primary}
                            onPress={() => navigation.navigate('CreateTournament')}
                        />
                        <ActionButton
                            icon="list-outline"
                            label="Manage Teams"
                            subtitle="Approve/Reject registrations"
                            color={isDarkMode ? '#8B5CF6' : '#6366F1'}
                            onPress={() => navigation.navigate('ManageTeams')}
                        />
                        <ActionButton
                            icon="calendar-outline"
                            label="Schedule Matches"
                            subtitle="Drag & drop game planner"
                            color={theme.success}
                            onPress={() => navigation.navigate('ScheduleMatches')}
                        />
                        <ActionButton
                            icon="settings-outline"
                            label="Settings"
                            subtitle="Profile & System preferences"
                            color={theme.textSecondary}
                            onPress={() => navigation.navigate('OrganizerSettings')}
                        />
                    </View>

                    {/* Recent Activity */}
                    <View style={styles.activitySection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m }}>
                            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Recent Activity</Text>
                            <TouchableOpacity onPress={loadData}>
                                <Ionicons name="refresh" size={16} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            {refreshing && <ActivityIndicator style={{ marginBottom: 10 }} color={theme.primary} />}
                            {activities.length > 0 ? activities.map((item, index) => (
                                <View key={item.id} style={[styles.activityItem, { borderLeftColor: theme.border, borderLeftWidth: index === activities.length - 1 ? 0 : 2, paddingBottom: index === activities.length - 1 ? 0 : 24 }]}>
                                    <View style={[styles.activityDot, { backgroundColor: item.type === 'tournament_created' ? theme.primary : theme.success }]} />
                                    <View style={styles.activityRow}>
                                        <View style={styles.activityContent}>
                                            <Text style={[styles.activityText, { color: theme.text }]}>
                                                {item.type === 'tournament_created' ? (
                                                    <>Created tournament <Text style={{ fontWeight: '700' }}>{item.title}</Text></>
                                                ) : (
                                                    <><Text style={{ fontWeight: '700' }}>{item.playerName}</Text> registered for {item.tournamentTitle}</>
                                                )}
                                            </Text>
                                            <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                                                {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.activityActionBtn, { borderColor: theme.border }]}
                                            onPress={() => {
                                                if (item.type === 'tournament_created') {
                                                    navigation.navigate('EditTournament', { tournamentId: item.id });
                                                } else {
                                                    navigation.navigate('ManageTeams');
                                                }
                                            }}
                                        >
                                            <Text style={[styles.activityActionText, { color: theme.primary }]}>
                                                {item.type === 'tournament_created' ? 'Edit' : 'Manage'}
                                            </Text>
                                            <Ionicons
                                                name={item.type === 'tournament_created' ? "create-outline" : "people-outline"}
                                                size={14}
                                                color={theme.primary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )) : (
                                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                    <Ionicons name="documents-outline" size={40} color={theme.border} />
                                    <Text style={{ color: theme.textSecondary, marginTop: 10 }}>No recent activity</Text>
                                </View>
                            )}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Profile Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showProfileModal}
                onRequestClose={() => setShowProfileModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Organization Profile</Text>
                            <TouchableOpacity onPress={() => setShowProfileModal(false)} style={[styles.closeButton, { backgroundColor: theme.background }]}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <View style={styles.profileHeaderCenter}>
                                <View style={styles.largeAvatarContainer}>
                                    <View style={[styles.largeAvatar, styles.avatarPlaceholder, { backgroundColor: theme.secondary, borderColor: theme.background }]}>
                                        <Text style={{ fontSize: 40, color: '#FFF', fontWeight: 'bold' }}>{userData?.organizationName?.charAt(0) || 'O'}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.profileNameLarge, { color: theme.text }]}>{userData?.organizationName || 'Organization'}</Text>
                                <View style={[styles.verifiedBadgeLarge, { backgroundColor: isDarkMode ? `${theme.success}15` : '#ECFDF5' }]}>
                                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                                    <Text style={[styles.verifiedTextLarge, { color: theme.success }]}>Verified Organizer</Text>
                                </View>
                            </View>

                            <View style={[styles.profileSection, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#FAFAFA' }]}>
                                <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Contact Details</Text>
                                <ProfileRow icon="business-outline" label="Organization Name" value={userData?.organizationName} />
                                <ProfileRow icon="mail-outline" label="Email Address" value={userData?.email} />
                                <ProfileRow icon="call-outline" label="Phone Number" value={userData?.phoneNumber} />
                            </View>

                            <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: theme.background }]} onPress={() => setShowProfileModal(false)}>
                                <Text style={[styles.editProfileButtonText, { color: theme.text }]}>Close Profile</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.l },
    greeting: { fontSize: 13, fontWeight: '700' },
    orgName: { fontSize: 22, fontWeight: '900' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
    verifiedText: { fontSize: 11, fontWeight: '800', marginLeft: 4 },
    notificationButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    logoutButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

    scrollContent: { paddingBottom: 100 },
    sectionTitle: { fontSize: 13, fontWeight: '900', marginBottom: spacing.m, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 4 },

    statCard: { width: 160, height: 110, borderRadius: 20, padding: 16, marginRight: 12, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    statIconContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.95)', fontWeight: '700' },
    statSubtext: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    actionsGrid: { marginBottom: spacing.xl },
    actionButton: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1 },
    actionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    actionLabel: { fontSize: 16, fontWeight: '800' },
    actionSubtitle: { fontSize: 12, marginTop: 2 },

    activitySection: { marginBottom: spacing.l },
    activityCard: { borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1 },
    activityItem: { flexDirection: 'row', borderLeftWidth: 2, paddingLeft: 20, paddingBottom: 24, position: 'relative' },
    activityDot: { position: 'absolute', left: -5, top: 0, width: 8, height: 8, borderRadius: 4 },
    activityContent: { flex: 1, marginTop: -4 },
    activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
    activityActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, gap: 6, marginLeft: 12 },
    activityActionText: { fontSize: 11, fontWeight: '800' },
    activityText: { fontSize: 14, lineHeight: 20 },
    activityTime: { fontSize: 11, marginTop: 4, fontWeight: '600' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 24, height: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '900' },
    closeButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

    profileHeaderCenter: { alignItems: 'center', marginBottom: 32 },
    largeAvatarContainer: { position: 'relative', marginBottom: 16 },
    largeAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
    avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    profileNameLarge: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
    verifiedBadgeLarge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    verifiedTextLarge: { fontSize: 12, fontWeight: '700', marginLeft: 6 },

    profileSection: { marginBottom: 24, borderRadius: 20, padding: 16 },
    profileSectionTitle: { fontSize: 11, fontWeight: '900', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 4 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    profileRowIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    profileLabel: { fontSize: 11, fontWeight: '800', marginBottom: 2 },
    profileValue: { fontSize: 15, fontWeight: '800' },

    editProfileButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, paddingVertical: 18, marginTop: 8, marginBottom: 40 },
    editProfileButtonText: { fontSize: 16, fontWeight: '900' }
});
