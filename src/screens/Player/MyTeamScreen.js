import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Share, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { schedulePractice, getTeamPractices, getUserRegistrations, getTournamentRegistrations, getPlayerStats } from '../../services/tournamentService';
import { useAuth } from '../../context/AuthContext';

export default function MyTeamScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showPracticeModal, setShowPracticeModal] = useState(false);
    const [practices, setPractices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Practice Form State
    const [practiceForm, setPracticeForm] = useState({
        date: new Date(),
        time: new Date(),
        venue: '',
        note: ''
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [teamInfo, setTeamInfo] = useState({ name: 'My Team', motto: 'Ready to Play' });
    const [teamMembers, setTeamMembers] = useState([]);
    const [stats, setStats] = useState({ matches: '0', wins: '0', winRate: '0%' });

    useEffect(() => {
        fetchTeamData();
    }, [user]);

    const fetchTeamData = async () => {
        setLoading(true);
        try {
            // 1. Get user's approved registrations to find their team
            const userRegs = await getUserRegistrations(user.uid);
            const approvedReg = userRegs.find(reg => reg.status === 'approved');

            if (approvedReg) {
                const teamName = approvedReg.teamName || 'Force Player';
                setTeamInfo({ name: teamName, motto: 'Unleash the Pride' });

                // 2. Fetch teammates (any player registered for the same tournament with the same team name)
                const tournamentRegs = await getTournamentRegistrations(approvedReg.tournamentId);
                const teammates = tournamentRegs
                    .filter(reg => reg.teamName === teamName)
                    .map(reg => ({
                        id: reg.userId,
                        name: reg.playerName,
                        role: reg.role || 'Player',
                        status: 'Online', // Could be dynamic with real-time presence
                        avatar: '🦁'
                    }));
                setTeamMembers(teammates);

                // 3. Fetch practices for this team
                const practiceData = await getTeamPractices(teamName);
                setPractices(practiceData);

                // 4. Calculate stats from player stats logic
                const playerStats = await getPlayerStats(user.uid);
                if (playerStats) {
                    setStats({
                        matches: playerStats.matchesPlayed.toString(),
                        wins: Math.floor(playerStats.matchesPlayed * (playerStats.winRate / 100)).toString(),
                        winRate: `${playerStats.winRate}%`
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching team data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSchedulePractice = async () => {
        if (!practiceForm.venue) {
            Alert.alert('Error', 'Please enter a venue for practice');
            return;
        }

        setLoading(true);
        try {
            await schedulePractice({
                teamId: teamInfo.name,
                date: practiceForm.date.toLocaleDateString(),
                time: practiceForm.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                venue: practiceForm.venue,
                note: practiceForm.note,
                createdBy: user.uid
            });
            Alert.alert('Success', 'Practice session scheduled!');
            setShowPracticeModal(false);
            setPracticeForm({ date: new Date(), time: new Date(), venue: '', note: '' });
            fetchTeamData();
        } catch (error) {
            Alert.alert('Error', 'Failed to schedule practice');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (platform) => {
        const shareMessage = `Hey! Join my team 'Lions Elite' on Force-PLAYER! 🦁⚽\n\nWe're competing in the local tournament and need strong players like you.\n\nDownload and Join here: https://forceplay.page.link/invite/lions-elite`;

        try {
            if (platform === 'native') {
                await Share.share({
                    message: shareMessage,
                    url: 'https://forceplay.page.link/invite/lions-elite', // iOS only
                    title: 'Join my Team!'
                });
            } else {
                await Share.share({ message: shareMessage });
            }
            setShowInviteModal(false);
        } catch (error) {
            console.error(error.message);
        }
    };

    const teamStats = [
        { label: t('matches'), value: stats.matches, icon: 'tennisball-outline' },
        { label: t('wins'), value: stats.wins, icon: 'trophy-outline' },
        { label: t('rate'), value: stats.winRate, icon: 'trending-up-outline' },
    ];

    // teamMembers is now fetched dynamically in fetchTeamData

    const MemberCard = ({ member }) => (
        <View style={[styles.memberCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.memberAvatar, { backgroundColor: theme.surfaceHighlight }]}>
                <Text style={{ fontSize: 24 }}>{member.avatar}</Text>
            </View>
            <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.text }]}>{member.name}</Text>
                <Text style={[styles.memberRole, { color: theme.textSecondary }]}>{member.role}</Text>
            </View>
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: member.status === 'Online' ? theme.success : theme.textLight }]} />
                <Text style={[styles.statusText, { color: theme.textSecondary }]}>{member.status}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backButton, { backgroundColor: theme.card }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('myTeam')}</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="chatbubbles-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Team Banner */}
                    <LinearGradient
                        colors={['#F57C00', '#E65100']}
                        style={styles.teamBanner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.teamLogoContainer}>
                            <Text style={{ fontSize: 40 }}>🦁</Text>
                        </View>
                        <View style={{ marginLeft: 20 }}>
                            <Text style={styles.teamName}>{teamInfo.name}</Text>
                            <Text style={styles.teamMotto}>{teamInfo.motto}</Text>
                        </View>
                    </LinearGradient>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        {teamStats.map((stat, index) => (
                            <View key={index} style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name={stat.icon} size={20} color={theme.primary} />
                                <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>


                    {/* Team Overview - New Section */}
                    {teamMembers.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Team Performance</Text>
                            </View>
                            <View style={[styles.detailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={styles.detailRow}>
                                    <View style={[styles.detailIcon, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}>
                                        <Ionicons name="flash-outline" size={20} color={theme.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Squad Depth</Text>
                                        <View style={styles.strengthBarContainer}>
                                            <View
                                                style={[
                                                    styles.strengthBar,
                                                    {
                                                        backgroundColor: theme.primary,
                                                        width: `${Math.min((teamMembers.length / 11) * 100, 100)}%`
                                                    }
                                                ]}
                                            />
                                        </View>
                                    </View>
                                    <Text style={[styles.detailValue, { color: theme.text }]}>
                                        {teamMembers.length}/11
                                    </Text>
                                </View>

                                <View style={[styles.detailRow, { marginTop: 16 }]}>
                                    <View style={[styles.detailIcon, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }]}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color={theme.success} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Team Chemistry</Text>
                                        <Text style={[styles.detailValue, { color: theme.text }]}>High Quality</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Roster Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Team Roster</Text>
                            <TouchableOpacity>
                                <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.memberList}>
                            {teamMembers.length > 0 ? (
                                teamMembers.map(member => (
                                    <MemberCard key={member.id} member={member} />
                                ))
                            ) : (
                                <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    <Ionicons name="people-outline" size={32} color={theme.border} />
                                    <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Register for a tournament to form a team!</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Upcoming Practices */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Practices</Text>
                        </View>
                        {practices.length > 0 ? (
                            <View style={styles.practiceList}>
                                {practices.map((practice) => (
                                    <View key={practice.id} style={[styles.practiceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                        <View style={[styles.practiceIcon, { backgroundColor: '#F0F9FF' }]}>
                                            <Ionicons name="calendar" size={20} color={theme.primary} />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={[styles.practiceVenue, { color: theme.text }]}>{practice.venue}</Text>
                                            <Text style={[styles.practiceDateTime, { color: theme.textSecondary }]}>
                                                {practice.date} at {practice.time}
                                            </Text>
                                        </View>
                                        {practice.note && (
                                            <TouchableOpacity
                                                onPress={() => Alert.alert('Practice Note', practice.note)}
                                                style={styles.infoIcon}
                                            >
                                                <Ionicons name="information-circle-outline" size={20} color={theme.textLight} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="calendar-outline" size={32} color={theme.border} />
                                <Text style={{ color: theme.textSecondary, marginTop: 8 }}>No practice scheduled</Text>
                            </View>
                        )}
                    </View>

                    {/* Team Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.primaryAction, { backgroundColor: theme.primary }]}
                            onPress={() => setShowPracticeModal(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryActionText}>Schedule Practice</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.secondaryAction, { borderColor: theme.primary }]}
                            onPress={() => setShowInviteModal(true)}
                        >
                            <Ionicons name="person-add-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.secondaryActionText, { color: theme.primary }]}>Invite Players</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Schedule Practice Modal */}
            <Modal
                visible={showPracticeModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPracticeModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowPracticeModal(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Schedule Practice</Text>
                                <TouchableOpacity onPress={() => setShowPracticeModal(false)}>
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Date</Text>
                                <TouchableOpacity
                                    style={[styles.inputWrapper, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border }]}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
                                    <Text style={[styles.inputText, { color: theme.text }]}>
                                        {practiceForm.date.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 16 }]}>Time</Text>
                                <TouchableOpacity
                                    style={[styles.inputWrapper, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border }]}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                                    <Text style={[styles.inputText, { color: theme.text }]}>
                                        {practiceForm.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 16 }]}>Venue</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border }]}>
                                    <Ionicons name="location-outline" size={20} color={theme.textSecondary} />
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        placeholder="e.g. YMCA Ground, Mumbai"
                                        placeholderTextColor={theme.textLight}
                                        value={practiceForm.venue}
                                        onChangeText={(text) => setPracticeForm({ ...practiceForm, venue: text })}
                                    />
                                </View>

                                <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 16 }]}>Note (Optional)</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border, height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                                    <Ionicons name="create-outline" size={20} color={theme.textSecondary} />
                                    <TextInput
                                        style={[styles.input, { color: theme.text, height: 60, textAlignVertical: 'top' }]}
                                        placeholder="Add instructions for teammates..."
                                        placeholderTextColor={theme.textLight}
                                        value={practiceForm.note}
                                        onChangeText={(text) => setPracticeForm({ ...practiceForm, note: text })}
                                        multiline
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                                    onPress={handleSchedulePractice}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>Schedule Practice</Text>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>

                {showDatePicker && (
                    <DateTimePicker
                        value={practiceForm.date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setPracticeForm({ ...practiceForm, date: selectedDate });
                        }}
                        minimumDate={new Date()}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={practiceForm.time}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (selectedTime) setPracticeForm({ ...practiceForm, time: selectedTime });
                        }}
                    />
                )}
            </Modal>

            {/* Social Invite Modal */}
            <Modal
                visible={showInviteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowInviteModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowInviteModal(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Invite Teammates</Text>
                            <TouchableOpacity onPress={() => setShowInviteModal(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                            Recruit top talent to join <Text style={{ fontWeight: '800', color: theme.primary }}>Lions Elite</Text>
                        </Text>

                        <View style={styles.socialGrid}>
                            <TouchableOpacity
                                style={[styles.socialItem, { backgroundColor: '#E8F5E9' }]}
                                onPress={() => handleShare('whatsapp')}
                            >
                                <View style={[styles.socialIcon, { backgroundColor: '#4CAF50' }]}>
                                    <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
                                </View>
                                <Text style={styles.socialName}>WhatsApp</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialItem, { backgroundColor: '#E3F2FD' }]}
                                onPress={() => handleShare('facebook')}
                            >
                                <View style={[styles.socialIcon, { backgroundColor: '#2196F3' }]}>
                                    <Ionicons name="logo-facebook" size={24} color="#FFF" />
                                </View>
                                <Text style={styles.socialName}>Facebook</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialItem, { backgroundColor: '#FDF2F8' }]}
                                onPress={() => handleShare('instagram')}
                            >
                                <LinearGradient colors={['#833AB4', '#FD1D1D', '#FCAF45']} style={styles.socialIcon}>
                                    <Ionicons name="logo-instagram" size={24} color="#FFF" />
                                </LinearGradient>
                                <Text style={styles.socialName}>Instagram</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialItem, { backgroundColor: theme.surfaceHighlight }]}
                                onPress={() => handleShare('native')}
                            >
                                <View style={[styles.socialIcon, { backgroundColor: theme.textSecondary }]}>
                                    <Ionicons name="share-social-outline" size={24} color="#FFF" />
                                </View>
                                <Text style={styles.socialName}>More</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.linkContainer, { backgroundColor: theme.surfaceHighlight, borderColor: theme.border }]}>
                            <Text style={[styles.inviteLink, { color: theme.textSecondary }]} numberOfLines={1}>
                                forceplay.page.link/lions-elite
                            </Text>
                            <TouchableOpacity style={[styles.copyBtn, { backgroundColor: theme.primary }]}>
                                <Ionicons name="copy-outline" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m, borderBottomWidth: 1 },
    backButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

    scrollContent: { padding: spacing.l },

    teamBanner: { borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 }, android: { elevation: 8 } }) },
    teamLogoContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    teamName: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    teamMotto: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 4 },

    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    statItem: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
    statValue: { fontSize: 20, fontWeight: '800', marginVertical: 4 },
    statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    seeAllText: { fontSize: 14, fontWeight: '700' },

    memberList: { gap: 12 },
    memberCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
    memberAvatar: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    memberInfo: { flex: 1, marginLeft: 16 },
    memberName: { fontSize: 16, fontWeight: '700' },
    memberRole: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    statusContainer: { alignItems: 'flex-end' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },

    actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 12, paddingBottom: 40 },
    primaryAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, shadowColor: '#F57C00', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    primaryActionText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
    secondaryAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 2 },
    secondaryActionText: { fontSize: 15, fontWeight: '800' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalContent: { width: '100%', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: '900' },
    closeBtn: { padding: 4 },
    modalSubtitle: { fontSize: 14, marginTop: 8, marginBottom: 24 },

    socialGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    socialItem: { alignItems: 'center', padding: 12, borderRadius: 20, width: '23%' },
    socialIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    socialName: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },

    linkContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1 },
    inviteLink: { flex: 1, fontSize: 13, fontWeight: '600', marginLeft: 8 },
    copyBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

    // Practice Styles
    practiceList: { gap: 12 },
    practiceCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
    practiceIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    practiceVenue: { fontSize: 15, fontWeight: '700' },
    practiceDateTime: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    emptyCard: { alignItems: 'center', padding: 32, borderRadius: 24, borderWidth: 1, borderStyle: 'dotted' },
    infoIcon: { padding: 4 },

    // Detail Card Styles
    detailsCard: { padding: 16, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    detailLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    detailValue: { fontSize: 15, fontWeight: '800' },
    strengthBarContainer: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginTop: 4, overflow: 'hidden' },
    strengthBar: { height: '100%', borderRadius: 3 },

    // Practice Modal Extra Styles
    inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 16, borderWidth: 1 },
    inputText: { marginLeft: 12, fontSize: 15, fontWeight: '500' },
    input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500', height: '100%' },
    submitBtn: { marginTop: 24, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
