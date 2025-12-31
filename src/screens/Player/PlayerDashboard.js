import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Image, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../styles/spacing';

import NetInfo from '@react-native-community/netinfo';

export default function PlayerDashboard({ navigation }) {
    const { logout, userData } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { width: windowWidth } = useWindowDimensions();
    const isLargeScreen = windowWidth > 768;
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = useCallback(async () => {
        try { await logout(); } catch (error) { console.error('Logout error:', error); }
    }, [logout]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const ui = useMemo(() => ({
        padding: isLargeScreen ? spacing.xxl : spacing.m,
        cardWidth: isLargeScreen ? '48%' : '100%',
        gridGap: spacing.m,
    }), [isLargeScreen]);

    const StatCard = ({ icon, label, value, gradient }) => (
        <LinearGradient colors={gradient} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.statIconContainer}>
                <Ionicons name={icon} size={24} color="#FFF" />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </LinearGradient>
    );

    const ActionButton = ({ icon, label, color, onPress }) => (
        <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 0 }]}
            onPress={onPress}
        >
            <View style={[styles.actionIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={24} color="#FFF" />
            </View>
            <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
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
            {/* Main Background Gradient */}
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header Section */}
                <View style={[styles.header, { paddingHorizontal: ui.padding }]}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => setShowProfileModal(true)} style={styles.avatarContainer}>
                            {userData?.aadharPhotoURL ? (
                                <Image source={{ uri: userData.aadharPhotoURL }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.avatarText}>{userData?.displayName?.charAt(0) || 'P'}</Text>
                                </View>
                            )}
                            <View style={[styles.onlineBadge, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()},</Text>
                                {!isConnected && (
                                    <View style={styles.offlineTag}>
                                        <Text style={styles.offlineTagText}>Offline</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.userName, { color: theme.text }]}>{userData?.displayName || 'Player'}</Text>
                            <Text style={[styles.userEmail, { color: theme.primary }]}>{userData?.email || ''}</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Announcements')}
                            style={[styles.iconButton, { backgroundColor: theme.card }]}
                        >
                            <Ionicons name="notifications-outline" size={24} color={theme.text} />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={[styles.iconButton, { marginLeft: 8, backgroundColor: theme.card }]}>
                            <Ionicons name="log-out-outline" size={24} color={theme.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: ui.padding }]} showsVerticalScrollIndicator={false}>

                    {/* Stats Overview */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('performance')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -ui.padding, paddingHorizontal: ui.padding, marginBottom: spacing.l }}>
                        <StatCard icon="trophy-outline" label={t('wins')} value="12" gradient={['#F59E0B', '#D97706']} />
                        <StatCard icon="tennisball-outline" label={t('matches')} value="45" gradient={['#3B82F6', '#2563EB']} />
                        <StatCard icon="trending-up-outline" label={t('rank')} value="#42" gradient={['#10B981', '#059669']} />
                    </ScrollView>

                    <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', flexWrap: 'wrap', gap: ui.gridGap }}>
                        {/* Upcoming Match Card */}
                        <View style={[styles.card, { width: ui.cardWidth, backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 0 }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: theme.text }]}>{t('nextMatch')}</Text>
                                <TouchableOpacity>
                                    <Text style={[styles.seeAllText, { color: theme.primary }]}>{t('seeAll')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.matchCard, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC' }]}>
                                <View style={styles.matchTeam}>
                                    <View style={[styles.teamLogo, { backgroundColor: theme.card }]}><Text style={{ fontSize: 18 }}>🦁</Text></View>
                                    <Text style={[styles.teamName, { color: theme.text }]}>Lions</Text>
                                </View>
                                <View style={styles.matchInfo}>
                                    <Text style={[styles.matchTime, { color: theme.text }]}>14:00</Text>
                                    <Text style={[styles.matchDate, { color: theme.textSecondary }]}>Today</Text>
                                    <View style={[styles.vsBadge, { backgroundColor: isDarkMode ? theme.border : '#E2E8F0' }]}><Text style={[styles.vsText, { color: theme.textSecondary }]}>VS</Text></View>
                                </View>
                                <View style={styles.matchTeam}>
                                    <View style={[styles.teamLogo, { backgroundColor: theme.card }]}><Text style={{ fontSize: 18 }}>🦅</Text></View>
                                    <Text style={[styles.teamName, { color: theme.text }]}>Eagles</Text>
                                </View>
                            </View>
                        </View>

                        {/* Recent Announcements */}
                        <View style={[styles.card, { width: ui.cardWidth, backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 0 }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: theme.text }]}>{t('announcements')}</Text>
                            </View>
                            <View style={[styles.announcementItem, { borderBottomColor: theme.border }]}>
                                <View style={[styles.announcementIcon, { backgroundColor: theme.warning }]}>
                                    <Ionicons name="megaphone-outline" size={18} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={[styles.announcementText, { color: theme.text }]}>Tournament registration open!</Text>
                                    <Text style={[styles.announcementTime, { color: theme.textSecondary }]}>2 hours ago</Text>
                                </View>
                            </View>
                            <View style={[styles.announcementItem, { borderBottomWidth: 0 }]}>
                                <View style={[styles.announcementIcon, { backgroundColor: theme.info }]}>
                                    <Ionicons name="calendar-outline" size={18} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={[styles.announcementText, { color: theme.text }]}>Practice matches scheduled.</Text>
                                    <Text style={[styles.announcementTime, { color: theme.textSecondary }]}>Yesterday</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Text style={[styles.sectionTitle, { marginTop: spacing.xl, color: theme.text }]}>{t('quickActions')}</Text>
                    <View style={styles.actionsGrid}>
                        <ActionButton
                            icon="people-outline"
                            label={t('myTeam')}
                            color={theme.primary}
                            onPress={() => navigation.navigate('MyTeam')}
                        />
                        <ActionButton
                            icon="ribbon-outline"
                            label={t('tournaments')}
                            color="#8B5CF6"
                            onPress={() => navigation.navigate('PlayerTournaments')}
                        />
                        <ActionButton
                            icon="stats-chart-outline"
                            label={t('statistics')}
                            color={theme.success}
                            onPress={() => navigation.navigate('Statistics')}
                        />
                        <ActionButton
                            icon="settings-outline"
                            label={t('settings')}
                            color={theme.textSecondary}
                            onPress={() => navigation.navigate('PlayerSettings')}
                        />
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
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Player Profile</Text>
                            <TouchableOpacity onPress={() => setShowProfileModal(false)} style={[styles.closeButton, { backgroundColor: theme.surfaceHighlight }]}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <View style={styles.profileHeaderCenter}>
                                <View style={styles.largeAvatarContainer}>
                                    {userData?.aadharPhotoURL ? (
                                        <Image source={{ uri: userData.aadharPhotoURL }} style={styles.largeAvatar} />
                                    ) : (
                                        <View style={[styles.largeAvatar, styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                                            <Text style={{ fontSize: 40, color: '#FFF', fontWeight: 'bold' }}>{userData?.displayName?.charAt(0) || 'P'}</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.primary, borderColor: theme.card }]}>
                                        <Ionicons name="camera" size={16} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.profileNameLarge, { color: theme.text }]}>{userData?.displayName || 'Player Name'}</Text>
                                <Text style={[styles.profileRole, { color: theme.textSecondary, backgroundColor: theme.surfaceHighlight }]}>Registered Player</Text>
                            </View>

                            <View style={[styles.profileSection, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#FAFAFA' }]}>
                                <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Personal Details</Text>
                                <ProfileRow icon="person-outline" label="Full Name" value={userData?.displayName} />
                                <ProfileRow icon="mail-outline" label="Email Address" value={userData?.email} />
                                <ProfileRow icon="call-outline" label="Phone Number" value={userData?.phoneNumber} />
                                <ProfileRow icon="location-outline" label="Address" value={userData?.address} />
                            </View>

                            <View style={[styles.profileSection, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#FAFAFA' }]}>
                                <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Physical Stats</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    <View style={{ width: '50%' }}><ProfileRow icon="resize-outline" label="Height" value={userData?.height ? `${userData.height} cm` : null} /></View>
                                    <View style={{ width: '50%' }}><ProfileRow icon="speedometer-outline" label="Weight" value={userData?.weight ? `${userData.weight} kg` : null} /></View>
                                    <View style={{ width: '50%' }}><ProfileRow icon="calendar-outline" label="Age" value={userData?.age} /></View>
                                    <View style={{ width: '50%' }}><ProfileRow icon="male-female-outline" label="Gender" value={userData?.gender} /></View>
                                </View>
                            </View>

                            <View style={[styles.profileSection, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#FAFAFA' }]}>
                                <Text style={[styles.profileSectionTitle, { color: theme.text }]}>Identity</Text>
                                <ProfileRow icon="card-outline" label="Aadhaar Number" value={userData?.aadharNumber} />
                                <ProfileRow icon="calendar-number-outline" label="Date of Birth" value={userData?.dob} />

                                <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 }}>
                                    <Text style={[styles.profileLabel, { marginBottom: 8, color: theme.textSecondary }]}>Aadhaar Card Photo</Text>
                                    {userData?.profilePhotoURL ? (
                                        <Image
                                            source={{ uri: userData.profilePhotoURL }}
                                            style={styles.identityImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={{ height: 100, backgroundColor: isDarkMode ? theme.background : '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' }}>
                                            <Ionicons name="image-outline" size={24} color={theme.textLight} />
                                            <Text style={{ marginTop: 4, color: theme.textLight, fontSize: 12 }}>No photo uploaded</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.editProfileButton, { borderColor: theme.primary }]}
                                onPress={() => {
                                    setShowProfileModal(false);
                                    navigation.navigate('EditProfile');
                                }}
                            >
                                <Ionicons name="create-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                                <Text style={[styles.editProfileButtonText, { color: theme.primary }]}>Edit Details</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.m, marginBottom: spacing.s },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { position: 'relative' },
    avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' },
    avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 20, color: '#FFF', fontWeight: 'bold' },
    onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF' },
    offlineTag: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginLeft: 6, borderWidth: 0.5, borderColor: '#FECACA' },
    offlineTagText: { color: '#EF4444', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    greeting: { fontSize: 13, fontWeight: '600' },
    userName: { fontSize: 18, fontWeight: '800' },
    userEmail: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    iconButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#FFF' },

    scrollContent: { paddingBottom: spacing.xxl },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.m },

    statCard: { width: 140, height: 100, borderRadius: 20, padding: 16, marginRight: 12, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    statIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '900', color: '#FFF' },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

    card: { borderRadius: 24, padding: spacing.l, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: spacing.m },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
    cardTitle: { fontSize: 16, fontWeight: '800' },
    seeAllText: { fontSize: 13, fontWeight: '700' },

    matchCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16 },
    matchTeam: { alignItems: 'center', width: '30%' },
    teamLogo: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    teamName: { fontSize: 12, fontWeight: '700' },
    matchInfo: { alignItems: 'center' },
    matchTime: { fontSize: 16, fontWeight: '900' },
    matchDate: { fontSize: 11, marginBottom: 4 },
    vsBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    vsText: { fontSize: 10, fontWeight: '800' },

    announcementItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    announcementIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    announcementText: { fontSize: 14, fontWeight: '600' },
    announcementTime: { fontSize: 11, marginTop: 2 },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    actionButton: { width: '48%', padding: 16, borderRadius: 20, alignItems: 'center', marginBottom: spacing.m, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionLabel: { fontSize: 14, fontWeight: '700' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 24, height: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '900' },
    closeButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

    profileHeaderCenter: { alignItems: 'center', marginBottom: 32 },
    largeAvatarContainer: { position: 'relative', marginBottom: 16 },
    largeAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'rgba(0,0,0,0.05)' },
    editAvatarButton: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    profileNameLarge: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
    profileRole: { fontSize: 14, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },

    profileSection: { marginBottom: 24, borderRadius: 20, padding: 16 },
    profileSectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    profileRowIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    profileLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
    profileValue: { fontSize: 15, fontWeight: '700' },

    editProfileButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', borderWidth: 2, borderRadius: 16, paddingVertical: 16, marginTop: 8, marginBottom: 40 },
    editProfileButtonText: { fontSize: 16, fontWeight: '800' },

    identityImage: { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#EDF2F7', borderWidth: 1, borderColor: '#E2E8F0' }
});
