import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAuth } from '../../context/AuthContext';
import {
    getOrganizerTournaments,
    getTournamentMatches,
    getTournamentRegistrations,
    scheduleMatch,
    updateMatchStatus,
    updateMatchResult
} from '../../services/tournamentService';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ScheduleMatchesScreen({ navigation }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);

    // UI State
    const [showTournamentPicker, setShowTournamentPicker] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Result Update State
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [resultData, setResultData] = useState({ scoreA: '', scoreB: '', winnerTeam: '' });

    // Form State for New Match
    const [newMatch, setNewMatch] = useState({
        teamA: '',
        teamB: '',
        date: new Date(),
        time: new Date(),
        venue: '',
        round: '1'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [selectedDateFilter, setSelectedDateFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const orgTournaments = await getOrganizerTournaments(user.uid);
            setTournaments(orgTournaments);
            if (orgTournaments.length > 0) {
                handleTournamentSelect(orgTournaments[0]);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleTournamentSelect = async (tournament) => {
        setSelectedTournament(tournament);
        setShowTournamentPicker(false);
        setLoading(true);
        try {
            const [tournamentMatches, tournamentTeams] = await Promise.all([
                getTournamentMatches(tournament.id),
                getTournamentRegistrations(tournament.id)
            ]);
            setMatches(tournamentMatches);
            setTeams(tournamentTeams);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMatch = async () => {
        if (!newMatch.teamA || !newMatch.teamB || !newMatch.venue) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (newMatch.teamA === newMatch.teamB) {
            Alert.alert("Error", "Teams must be different");
            return;
        }

        setIsSubmitting(true);
        try {
            const matchData = {
                tournamentId: selectedTournament.id,
                teamA: newMatch.teamA,
                teamB: newMatch.teamB,
                venue: newMatch.venue,
                date: newMatch.date.toLocaleDateString(),
                time: newMatch.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Scheduled',
                round: newMatch.round
            };
            await scheduleMatch(matchData);
            const updatedMatches = await getTournamentMatches(selectedTournament.id);
            setMatches(updatedMatches);
            setShowAddModal(false);
            setNewMatch({ teamA: '', teamB: '', date: new Date(), time: new Date(), venue: '', round: '1' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateResult = async () => {
        if (!resultData.scoreA || !resultData.scoreB || !resultData.winnerTeam) {
            Alert.alert("Error", "Please enter scores and select the winner");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateMatchResult(selectedMatch.id, {
                score: `${resultData.scoreA} - ${resultData.scoreB}`,
                winnerTeam: resultData.winnerTeam
            });
            const updatedMatches = await getTournamentMatches(selectedTournament.id);
            setMatches(updatedMatches);
            setShowResultModal(false);
            Alert.alert("Success", "Match result updated!");
        } catch (error) {
            Alert.alert("Error", "Failed to update result");
        } finally {
            setIsSubmitting(false);
        }
    };

    const MatchCard = ({ match }) => (
        <View style={styles.matchCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge,
                match.status === 'Live' ? { backgroundColor: '#FEF2F2' } :
                    match.status === 'Scheduled' ? { backgroundColor: '#ECFDF5' } :
                        { backgroundColor: '#F1F5F9' }
                ]}>
                    <Text style={[styles.statusText,
                    match.status === 'Live' ? { color: colors.error } :
                        match.status === 'Scheduled' ? { color: colors.success } :
                            { color: colors.textSecondary }
                    ]}>
                        {match.status === 'Live' ? '● LIVE NOW' : match.status}
                    </Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.matchContent}>
                <View style={styles.team}>
                    <View style={styles.teamLogo}><Text style={styles.teamLogoText}>{match.teamA.charAt(0)}</Text></View>
                    <Text style={styles.teamName}>{match.teamA}</Text>
                </View>

                <View style={styles.versusContainer}>
                    <Text style={styles.vsText}>VS</Text>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.timeText}>{match.time}</Text>
                    </View>
                </View>

                <View style={styles.team}>
                    <View style={[styles.teamLogo, { backgroundColor: '#FFF0F5' }]}><Text style={[styles.teamLogoText, { color: '#D946EF' }]}>{match.teamB.charAt(0)}</Text></View>
                    <Text style={styles.teamName}>{match.teamB}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.venueContainer}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.venueText}>{match.venue}</Text>
                </View>
                {match.status === 'Completed' ? (
                    <View style={styles.resultBadge}>
                        <Text style={styles.resultText}>{match.score}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                            setSelectedMatch(match);
                            setResultData({ scoreA: '', scoreB: '', winnerTeam: '' });
                            setShowResultModal(true);
                        }}
                    >
                        <Text style={styles.editButtonText}>Update Result</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FFF', '#F8F9FA', '#F1F5F9']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tournamentSelector}
                        onPress={() => setShowTournamentPicker(true)}
                    >
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {selectedTournament?.title || 'Select Tournament'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={colors.text} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                        onPress={() => setActiveTab('past')}
                    >
                        <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Completed</Text>
                    </TouchableOpacity>
                </View>

                {/* Scheduler Help Banner */}
                <View style={styles.helpBanner}>
                    <View style={styles.helpContent}>
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.helpTitle}>Tournament Format</Text>
                            <Text style={styles.helpText}>
                                {selectedTournament?.scheduleType || 'Standard'} • {selectedTournament?.scoringMetric || 'Default'} Metrics
                            </Text>
                        </View>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : matches.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.noMatchesText}>No matches scheduled yet</Text>
                        {selectedTournament && (
                            <TouchableOpacity
                                style={styles.emptyAddBtn}
                                onPress={() => setShowAddModal(true)}
                            >
                                <Text style={styles.emptyAddBtnText}>Schedule First Match</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {matches
                            .filter(m => activeTab === 'past' ? m.status === 'Completed' : m.status !== 'Completed')
                            .map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                    </ScrollView>
                )}
            </SafeAreaView>

            {/* Tournament Picker Modal */}
            <Modal visible={showTournamentPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Tournament</Text>
                            <TouchableOpacity onPress={() => setShowTournamentPicker(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {tournaments.map(t => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[styles.pickerItem, selectedTournament?.id === t.id && styles.pickerItemSelected]}
                                    onPress={() => handleTournamentSelect(t)}
                                >
                                    <Text style={[styles.pickerItemText, selectedTournament?.id === t.id && styles.pickerItemTextSelected]}>
                                        {t.title}
                                    </Text>
                                    {selectedTournament?.id === t.id && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Add Match Modal */}
            <Modal visible={showAddModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '85%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule New Match</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Team A</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                                {teams.map(team => (
                                    <TouchableOpacity
                                        key={team.id}
                                        style={[styles.teamChip, newMatch.teamA === team.teamName && styles.teamChipSelected]}
                                        onPress={() => setNewMatch({ ...newMatch, teamA: team.teamName })}
                                    >
                                        <Text style={[styles.teamChipText, newMatch.teamA === team.teamName && styles.teamChipTextSelected]}>
                                            {team.teamName || team.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.vsBadge}>
                                <Text style={styles.vsBadgeText}>VS</Text>
                            </View>

                            <Text style={styles.inputLabel}>Team B</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                {teams.map(team => (
                                    <TouchableOpacity
                                        key={team.id}
                                        style={[styles.teamChip, newMatch.teamB === team.teamName && styles.teamChipSelected]}
                                        onPress={() => setNewMatch({ ...newMatch, teamB: team.teamName })}
                                    >
                                        <Text style={[styles.teamChipText, newMatch.teamB === team.teamName && styles.teamChipTextSelected]}>
                                            {team.teamName || team.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.inputLabel}>Date</Text>
                                    <TouchableOpacity style={styles.inputField} onPress={() => setShowDatePicker(true)}>
                                        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                                        <Text style={{ marginLeft: 8, fontSize: 13, color: colors.text }}>{newMatch.date.toLocaleDateString()}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.inputLabel}>Time</Text>
                                    <TouchableOpacity style={styles.inputField} onPress={() => setShowTimePicker(true)}>
                                        <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                                        <Text style={{ marginLeft: 8, fontSize: 13, color: colors.text }}>{newMatch.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Venue / Court</Text>
                            <View style={styles.inputField}>
                                <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                                <TextInput
                                    style={{ flex: 1, marginLeft: 8, color: colors.text }}
                                    placeholder="Enter Ground/Pitch name"
                                    placeholderTextColor="#94A3B8"
                                    value={newMatch.venue}
                                    onChangeText={(v) => setNewMatch({ ...newMatch, venue: v })}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                                onPress={handleAddMatch}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Confirm Schedule</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>

                        {showDatePicker && (
                            <DateTimePicker
                                value={newMatch.date}
                                mode="date"
                                onChange={(e, d) => { setShowDatePicker(false); if (d) setNewMatch({ ...newMatch, date: d }); }}
                            />
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                value={newMatch.time}
                                mode="time"
                                onChange={(e, d) => { setShowTimePicker(false); if (d) setNewMatch({ ...newMatch, time: d }); }}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Update Result Modal */}
            <Modal
                visible={showResultModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowResultModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Match Result</Text>
                            <TouchableOpacity onPress={() => setShowResultModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedMatch && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.scoreInputRow}>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={styles.teamNameLabel}>{selectedMatch.teamA}</Text>
                                        <TextInput
                                            style={styles.scoreInput}
                                            placeholder="Score"
                                            keyboardType="numeric"
                                            value={resultData.scoreA}
                                            onChangeText={(text) => setResultData({ ...resultData, scoreA: text })}
                                        />
                                    </View>
                                    <Text style={styles.vsDivider}>-</Text>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={styles.teamNameLabel}>{selectedMatch.teamB}</Text>
                                        <TextInput
                                            style={styles.scoreInput}
                                            placeholder="Score"
                                            keyboardType="numeric"
                                            value={resultData.scoreB}
                                            onChangeText={(text) => setResultData({ ...resultData, scoreB: text })}
                                        />
                                    </View>
                                </View>

                                <Text style={styles.inputLabel}>Winner Team</Text>
                                <View style={styles.row}>
                                    {[selectedMatch.teamA, selectedMatch.teamB, 'Draw'].map((team) => (
                                        <TouchableOpacity
                                            key={team}
                                            style={[styles.teamChip, resultData.winnerTeam === team && styles.teamChipSelected]}
                                            onPress={() => setResultData({ ...resultData, winnerTeam: team })}
                                        >
                                            <Text style={[styles.teamChipText, resultData.winnerTeam === team && styles.teamChipTextSelected]}>
                                                {team}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={handleUpdateResult}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Result</Text>}
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    tournamentSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.text },
    addButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

    tabContainer: { flexDirection: 'row', paddingHorizontal: spacing.l, marginBottom: spacing.m },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: colors.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    activeTabText: { color: colors.primary, fontWeight: '800' },

    scrollContent: { padding: spacing.l, paddingTop: 0, paddingBottom: 100 },

    matchCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '800' },

    matchContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    team: { alignItems: 'center', width: '30%' },
    teamLogo: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    teamLogoText: { fontSize: 20, fontWeight: '800', color: colors.primary },
    teamName: { fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'center' },

    versusContainer: { alignItems: 'center' },
    vsText: { fontSize: 14, fontWeight: '900', color: '#CBD5E1', marginBottom: 6 },
    timeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    timeText: { fontSize: 12, fontWeight: '700', color: colors.text, marginLeft: 4 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
    venueContainer: { flexDirection: 'row', alignItems: 'center' },
    venueText: { fontSize: 12, color: colors.textSecondary, marginLeft: 4, fontWeight: '500' },
    editButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    editButtonText: { fontSize: 12, fontWeight: '700', color: colors.text },

    helpBanner: { marginHorizontal: spacing.l, marginBottom: spacing.m, backgroundColor: '#EEF2FF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#C7D2FE' },
    helpContent: { flexDirection: 'row', alignItems: 'center' },
    helpTitle: { fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' },
    helpText: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    noMatchesText: { fontSize: 16, color: colors.textSecondary, marginTop: 16, fontWeight: '600' },
    emptyAddBtn: { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    emptyAddBtnText: { color: '#FFF', fontWeight: '800' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
    pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    pickerItemSelected: { backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 12, marginHorizontal: -12 },
    pickerItemText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
    pickerItemTextSelected: { color: colors.primary, fontWeight: '800' },

    inputLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 16 },
    inputField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 50 },
    teamChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    teamChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    teamChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    teamChipTextSelected: { color: '#FFF' },
    vsBadge: { alignSelf: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 12, marginBottom: -4, zIndex: 1 },
    vsBadgeText: { fontSize: 12, fontWeight: '900', color: colors.textSecondary },
    row: { flexDirection: 'row', marginTop: 8 },
    saveBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 32, marginBottom: 20 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

    scoreInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
    teamNameLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
    scoreInput: { width: 80, height: 60, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', textAlign: 'center', fontSize: 24, fontWeight: '800', color: colors.primary },
    vsDivider: { fontSize: 24, fontWeight: '900', color: '#CBD5E1', marginHorizontal: 20, marginTop: 25 },
    resultBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    resultText: { fontSize: 12, fontWeight: '800', color: colors.primary }
});
