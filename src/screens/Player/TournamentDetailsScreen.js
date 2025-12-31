import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { checkTournamentStatus } from '../../services/tournamentService';

export default function TournamentDetailsScreen({ navigation, route }) {
    const { tournament } = route.params;
    const status = checkTournamentStatus(tournament);

    const InfoRow = ({ icon, label, value }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    const handleRegisterPress = () => {
        navigation.navigate('TournamentRegistration', { tournament });
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FFF', '#F8F9FA', '#F1F5F9']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tournament Details</Text>
                    <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}>
                        <Ionicons name="share-social-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Banner Image */}
                    {tournament.bannerImage ? (
                        <Image source={{ uri: tournament.bannerImage }} style={styles.bannerImage} />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                        </View>
                    )}

                    {/* Title Section */}
                    <View style={styles.titleSection}>
                        <View style={styles.sportBadge}>
                            <Ionicons name="trophy-outline" size={16} color={colors.primary} />
                            <Text style={styles.sportBadgeText}>{tournament.sport}</Text>
                        </View>
                        <Text style={styles.title}>{tournament.title}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Text style={styles.organizer}>Format: <Text style={{ fontWeight: '700', color: colors.primary }}>{tournament.format}</Text></Text>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: status.open ? '#ECFDF5' : '#FEF2F2' }
                            ]}>
                                <View style={[styles.statusDot, { backgroundColor: status.open ? colors.success : colors.error }]} />
                                <Text style={[styles.statusText, { color: status.open ? colors.success : colors.error }]}>
                                    {status.reason}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.statValue}>{tournament.teamsRegistered || 0}/{tournament.maxParticipants}</Text>
                            <Text style={styles.statLabel}>{tournament.format === 'team' ? 'Teams' : 'Participants'}</Text>
                        </View>
                        <View style={styles.statLine} />
                        <View style={styles.statItem}>
                            <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.statValue}>₹{tournament.entryFee}</Text>
                            <Text style={styles.statLabel}>Entry</Text>
                        </View>
                        <View style={styles.statLine} />
                        <View style={styles.statItem}>
                            <Ionicons name="gift-outline" size={20} color={colors.warning} />
                            <Text style={[styles.statValue, { color: colors.warning }]}>₹{tournament.prizePool}</Text>
                            <Text style={styles.statLabel}>Prize</Text>
                        </View>
                    </View>

                    {/* Dates Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Important Dates</Text>
                        <View style={styles.detailsCard}>
                            <InfoRow icon="calendar-outline" label="Tournament Start" value={tournament.startDate} />
                            <InfoRow icon="flag-outline" label="Tournament End" value={tournament.endDate} />
                            <InfoRow icon="timer-outline" label="Registration Deadline" value={tournament.registrationDeadline} />
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About Tournament</Text>
                        <View style={styles.contentCard}>
                            <Text style={styles.descriptionText}>{tournament.description}</Text>
                        </View>
                    </View>

                    {/* Rules */}
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>Rules & Regulations</Text>
                        </View>
                        <View style={[styles.contentCard, { backgroundColor: '#FEFCE8', borderColor: '#FEF08A' }]}>
                            <Text style={styles.rulesText}>{tournament.rules}</Text>
                        </View>
                    </View>

                </ScrollView>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.registerButton, !status.open && { opacity: 0.6 }]}
                        onPress={handleRegisterPress}
                        disabled={!status.open}
                    >
                        <LinearGradient
                            colors={status.open ? [colors.primary, '#4F46E5'] : ['#94A3B8', '#64748B']}
                            style={styles.registerButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.registerButtonText}>
                                {status.open ? 'Register Now' : 'Registration Closed'}
                            </Text>
                            <Ionicons name={status.open ? "arrow-forward" : "lock-closed"} size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    shareButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },

    scrollContent: { padding: spacing.l, paddingBottom: 120 },

    bannerImage: { width: '100%', height: 200, borderRadius: 24, marginBottom: 24, backgroundColor: '#F1F5F9' },
    bannerPlaceholder: { width: '100%', height: 200, borderRadius: 24, marginBottom: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },

    titleSection: { marginBottom: 24 },
    sportBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
    sportBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary, marginLeft: 6 },
    title: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 8 },
    organizer: { fontSize: 14, color: colors.textSecondary },

    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 15, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 },
    statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, fontWeight: '600', textTransform: 'uppercase' },
    statLine: { width: 1, backgroundColor: '#F1F5F9' },

    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16 },

    detailsCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
    contentCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    infoLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2, fontWeight: '600' },
    infoValue: { fontSize: 14, fontWeight: '700', color: colors.text },

    descriptionText: { fontSize: 15, color: colors.text, lineHeight: 24 },
    rulesText: { fontSize: 14, color: '#854D0E', lineHeight: 22, fontWeight: '500' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.l, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    registerButton: { borderRadius: 24, overflow: 'hidden' },
    registerButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
    registerButtonText: { fontSize: 18, fontWeight: '800', color: '#FFF', marginRight: 10 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '700' }
});
