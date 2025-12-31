import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAuth } from '../../context/AuthContext';
import { getOrganizerRegistrations, updateRegistrationStatus, deleteRegistration, updateRegistration } from '../../services/tournamentService';

export default function ManageTeamsScreen({ navigation }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'active'
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [teamRequests, setTeamRequests] = useState([]);
    const [activeTeams, setActiveTeams] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReg, setEditingReg] = useState({ id: '', playerName: '', teamName: '', role: '' });

    useEffect(() => {
        loadTeams();
    }, [activeTab]);

    const loadTeams = async () => {
        setLoading(true);
        try {
            const status = activeTab === 'requests' ? 'pending' : 'approved';
            const data = await getOrganizerRegistrations(user.uid, status);
            if (activeTab === 'requests') {
                setTeamRequests(data);
            } else {
                setActiveTeams(data);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateRegistrationStatus(id, status);
            Alert.alert("Success", `Team ${status === 'approved' ? 'Approved' : 'Rejected'}`);
            loadTeams(); // Refresh list
        } catch (error) {
            Alert.alert("Error", "Failed to update status");
        }
    };

    const handleDeleteRegistration = async (id, playerName) => {
        Alert.alert(
            "Delete Application",
            `Are you sure you want to delete ${playerName}'s application? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteRegistration(id);
                            Alert.alert("Success", "Application deleted");
                            loadTeams();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete application");
                        }
                    }
                }
            ]
        );
    };

    const handleEditSave = async () => {
        setLoading(true);
        try {
            await updateRegistration(editingReg.id, {
                playerName: editingReg.playerName,
                teamName: editingReg.teamName,
                role: editingReg.role
            });
            Alert.alert("Success", "Registration updated");
            setShowEditModal(false);
            loadTeams();
        } catch (error) {
            Alert.alert("Error", "Failed to update registration");
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = teamRequests.filter(t =>
        t.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredActive = activeTeams.filter(t =>
        t.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const TeamCard = ({ team, isRequest }) => (
        <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
                <View style={styles.teamIcon}>
                    <Text style={styles.teamInitials}>{team.playerName?.charAt(0) || 'P'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.teamName}>{team.playerName}</Text>
                    <Text style={styles.captainName}>Team: {team.teamName || 'Solo'}</Text>
                </View>
                {isRequest ? (
                    <View style={styles.timeTag}>
                        <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.timeText}>
                            {team.registeredAt?.toDate?.().toLocaleDateString() || 'Today'}
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.statusTag, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={[styles.statusText, { color: colors.success }]}>Active</Text>
                    </View>
                )}
            </View>

            <View style={styles.teamStats}>
                <View style={styles.statBadge}>
                    <Ionicons name="medal-outline" size={14} color={colors.primary} />
                    <Text style={styles.statText}>{team.role || 'Player'}</Text>
                </View>
                {team.phone && (
                    <View style={styles.statBadge}>
                        <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.statText}>{team.phone}</Text>
                    </View>
                )}
            </View>

            {isRequest ? (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtnSmall]}
                        onPress={() => handleDeleteRegistration(team.id, team.playerName)}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.editBtnSmall]}
                        onPress={() => {
                            setEditingReg({
                                id: team.id,
                                playerName: team.playerName,
                                teamName: team.teamName,
                                role: team.role
                            });
                            setShowEditModal(true);
                        }}
                    >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleStatusUpdate(team.id, 'rejected')}
                    >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleStatusUpdate(team.id, 'approved')}
                    >
                        <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.viewBtn, { flex: 1 }]}
                        onPress={() => {
                            setSelectedPlayer(team);
                            setShowDetailModal(true);
                        }}
                    >
                        <Text style={styles.viewBtnText}>Analyze Details</Text>
                        <Ionicons name="analytics-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.editBtnSmall]}
                        onPress={() => {
                            setEditingReg({
                                id: team.id,
                                playerName: team.playerName,
                                teamName: team.teamName,
                                role: team.role
                            });
                            setShowEditModal(true);
                        }}
                    >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtnSmall, { flex: 0.2 }]}
                        onPress={() => handleDeleteRegistration(team.id, team.playerName)}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                </View>
            )}
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
                    <Text style={styles.headerTitle}>Manage Teams</Text>
                    <TouchableOpacity onPress={loadTeams} style={styles.backButton}>
                        <Ionicons name="refresh" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search teams..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                        onPress={() => setActiveTab('requests')}
                    >
                        <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                            Requests {teamRequests.length > 0 && <Text style={styles.badge}>{teamRequests.length}</Text>}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                            Active Teams
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                        {activeTab === 'requests' ? (
                            filteredRequests.length > 0 ? (
                                filteredRequests.map(team => <TeamCard key={team.id} team={team} isRequest />)
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="mail-open-outline" size={64} color="#CBD5E1" />
                                    <Text style={styles.emptyText}>No pending requests</Text>
                                </View>
                            )
                        ) : (
                            filteredActive.length > 0 ? (
                                filteredActive.map(team => <TeamCard key={team.id} team={team} />)
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                                    <Text style={styles.emptyText}>No active teams yet</Text>
                                </View>
                            )
                        )}
                    </ScrollView>
                )}

                {/* Detail Modal */}
                <Modal visible={showDetailModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Player Analysis</Text>
                                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {selectedPlayer && (
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.profileSummary}>
                                        <View style={styles.largeIcon}>
                                            <Text style={styles.largeIconText}>{selectedPlayer.playerName?.charAt(0) || 'P'}</Text>
                                        </View>
                                        <Text style={styles.profileName}>{selectedPlayer.playerName}</Text>
                                        <Text style={styles.profileSub}>{selectedPlayer.playerEmail}</Text>
                                    </View>

                                    <View style={styles.detailsGrid}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Team Name</Text>
                                            <Text style={styles.detailValue}>{selectedPlayer.teamName || 'Solo'}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Primary Role</Text>
                                            <Text style={styles.detailValue}>{selectedPlayer.role || 'N/A'}</Text>
                                        </View>
                                        {selectedPlayer.sport === 'Cricket' && (
                                            <>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Batting Style</Text>
                                                    <Text style={styles.detailValue}>{selectedPlayer.batsmanStyle || 'Not set'}</Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Bowling Style</Text>
                                                    <Text style={styles.detailValue}>{selectedPlayer.bowlerStyle || 'Not set'}</Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Position</Text>
                                                    <Text style={styles.detailValue}>{selectedPlayer.batsmanPosition || 'N/A'}</Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Text style={styles.detailLabel}>Bowler Type</Text>
                                                    <Text style={styles.detailValue}>{selectedPlayer.bowlerType || 'N/A'}</Text>
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    <TouchableOpacity style={styles.contactBtn} onPress={() => Alert.alert("Contact", `Calling ${selectedPlayer.phone}...`)}>
                                        <Ionicons name="call" size={20} color="#FFF" />
                                        <Text style={styles.contactBtnText}>Contact Player</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Edit Modal */}
                <Modal visible={showEditModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { height: 'auto', paddingBottom: 40 }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Application</Text>
                                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.editForm}>
                                <Text style={styles.inputLabel}>Player Name</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editingReg.playerName}
                                    onChangeText={(text) => setEditingReg({ ...editingReg, playerName: text })}
                                />

                                <Text style={styles.inputLabel}>Team Name</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editingReg.teamName}
                                    onChangeText={(text) => setEditingReg({ ...editingReg, teamName: text })}
                                />

                                <Text style={styles.inputLabel}>Role</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editingReg.role}
                                    onChangeText={(text) => setEditingReg({ ...editingReg, role: text })}
                                />

                                <TouchableOpacity style={styles.saveBtn} onPress={handleEditSave}>
                                    <Text style={styles.saveBtnText}>Save Changes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },

    searchContainer: { paddingHorizontal: spacing.l, marginBottom: spacing.m },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#E2E8F0' },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: colors.text, height: '100%' },

    tabsContainer: { flexDirection: 'row', paddingHorizontal: spacing.l, marginBottom: spacing.m },
    tab: { marginRight: 24, paddingVertical: 8 },
    activeTab: { borderBottomWidth: 3, borderBottomColor: colors.primary },
    tabText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
    activeTabText: { color: colors.primary, fontWeight: '800' },
    badge: { fontSize: 12, backgroundColor: colors.error, color: '#FFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },

    listContent: { padding: spacing.l, paddingTop: 0, paddingBottom: 100 },

    teamCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
    teamHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    teamIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    teamInitials: { fontSize: 20, fontWeight: '800', color: colors.primary },
    teamName: { fontSize: 16, fontWeight: '800', color: colors.text },
    captainName: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

    timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    timeText: { fontSize: 11, color: colors.textSecondary, marginLeft: 4, fontWeight: '500' },

    statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },

    teamStats: { flexDirection: 'row', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    statBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 16, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F8FAFC' },
    statText: { fontSize: 12, color: colors.textSecondary, marginLeft: 6, fontWeight: '500' },

    actionButtons: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    rejectBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
    approveBtn: { backgroundColor: colors.primary },
    rejectBtnText: { color: colors.error, fontWeight: '700', fontSize: 14 },
    approveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    deleteBtnSmall: { flex: 0.2, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
    editBtnSmall: { flex: 0.2, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' },

    viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: '#F8FAFC', borderRadius: 14 },
    viewBtnText: { color: colors.primary, fontWeight: '700', marginRight: 8 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600', marginTop: 16 },

    // Modal & Profile Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: colors.text },

    profileSummary: { alignItems: 'center', marginBottom: 32 },
    largeIcon: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#DBEAFE' },
    largeIconText: { fontSize: 32, fontWeight: '900', color: colors.primary },
    profileName: { fontSize: 24, fontWeight: '900', color: colors.text },
    profileSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
    detailItem: { width: '48%', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    detailLabel: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
    detailValue: { fontSize: 14, fontWeight: '700', color: colors.text },

    contactBtn: { backgroundColor: colors.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, gap: 12 },
    contactBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    editForm: { width: '100%' },
    inputLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, marginTop: 16 },
    modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, color: colors.text },
    saveBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
