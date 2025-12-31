import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAuth } from '../../context/AuthContext';
import { registerForTournament } from '../../services/tournamentService';

export default function TournamentRegistrationScreen({ navigation, route }) {
    const { tournament } = route.params;
    const { user, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [regSuccess, setRegSuccess] = useState(null);

    const [formData, setFormData] = useState({
        playerName: userData?.fullName || '',
        phone: userData?.phoneNumber || '',
        teamName: '',
        role: '', // Batsman, Bowler, Wicket Keeper, All-rounder
        batsmanStyle: '', // Left, Right
        batsmanPosition: '', // Opener, 1st, 2nd, 3rd
        bowlerStyle: '', // Left, Right
        bowlerType: '', // Faster, Medium, Spinner
    });

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleRegister = async () => {
        if (tournament.format === 'team' && !formData.teamName) {
            Alert.alert('Error', 'Please enter a team name');
            return;
        }
        if (!formData.role) {
            Alert.alert('Error', 'Please select your primary role');
            return;
        }

        setLoading(true);
        try {
            const regId = await registerForTournament(tournament.id, user.uid, {
                ...formData,
                playerEmail: user.email,
                tournamentTitle: tournament.title,
                sport: tournament.sport
            });
            setRegSuccess(regId);
        } catch (error) {
            Alert.alert('Error', 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
    );

    if (regSuccess) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#FFF', '#F0FDF4']} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark-circle" size={100} color={colors.success} />
                    </View>
                    <Text style={styles.successTitle}>Registration Successful!</Text>
                    <Text style={styles.successSub}>Your registration for {tournament.title} has been received.</Text>

                    <View style={styles.regCard}>
                        <Text style={styles.regLabel}>Registration Number</Text>
                        <Text style={styles.regNumber}>{regSuccess}</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="mail-outline" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            A confirmation email has been sent to {user.email} with tournament rules and details.
                        </Text>
                    </View>

                    <Text style={styles.contactNote}>
                        The organizer will contact you soon for further updates.
                    </Text>

                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => navigation.navigate('PlayerDashboard')}
                    >
                        <Text style={styles.doneButtonText}>Go to Home</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient colors={['#FFF', '#F8F9FA']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Register</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.tournamentHeader}>
                        <Text style={styles.tourTitle}>{tournament.title}</Text>
                        <Text style={styles.tourSport}>{tournament.sport} • {tournament.format}</Text>
                    </View>

                    <StepIndicator />

                    {step === 1 ? (
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>

                            {tournament.format === 'team' && (
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Team Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your team name"
                                        value={formData.teamName}
                                        onChangeText={(text) => setFormData({ ...formData, teamName: text })}
                                    />
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Player Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your Full Name"
                                    value={formData.playerName}
                                    onChangeText={(text) => setFormData({ ...formData, playerName: text })}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contact Number"
                                    keyboardType="phone-pad"
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={() => setStep(2)}
                            >
                                <Text style={styles.nextButtonText}>Next: Sport Details</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Player Specialization ({tournament.sport})</Text>

                            {tournament.sport === 'Cricket' ? (
                                <View>
                                    <Text style={styles.inputLabel}>Your Primary Role</Text>
                                    <View style={styles.roleGrid}>
                                        {['Batsman', 'Bowler', 'Wicket Keeper', 'All-rounder'].map(role => (
                                            <TouchableOpacity
                                                key={role}
                                                style={[styles.roleChip, formData.role === role && styles.roleChipActive]}
                                                onPress={() => handleRoleSelect(role)}
                                            >
                                                <Text style={[styles.roleChipText, formData.role === role && styles.roleChipTextActive]}>{role}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Detailed Batsman Info */}
                                    {(formData.role === 'Batsman' || formData.role === 'All-rounder' || formData.role === 'Wicket Keeper') && (
                                        <View style={styles.subSection}>
                                            <Text style={styles.subTitle}>Batting Details</Text>
                                            <View style={styles.choiceGroup}>
                                                <Text style={styles.choiceLabel}>Batting Hand:</Text>
                                                <View style={styles.row}>
                                                    {['Left', 'Right'].map(style => (
                                                        <TouchableOpacity
                                                            key={style}
                                                            style={[styles.smallChip, formData.batsmanStyle === style && styles.smallChipActive]}
                                                            onPress={() => setFormData({ ...formData, batsmanStyle: style })}
                                                        >
                                                            <Text style={[styles.smallChipText, formData.batsmanStyle === style && styles.smallChipTextActive]}>{style}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                            <View style={styles.choiceGroup}>
                                                <Text style={styles.choiceLabel}>Preferred Position:</Text>
                                                <View style={styles.row}>
                                                    {['Opener', '1st', '2nd', '3rd'].map(pos => (
                                                        <TouchableOpacity
                                                            key={pos}
                                                            style={[styles.smallChip, formData.batsmanPosition === pos && styles.smallChipActive]}
                                                            onPress={() => setFormData({ ...formData, batsmanPosition: pos })}
                                                        >
                                                            <Text style={[styles.smallChipText, formData.batsmanPosition === pos && styles.smallChipTextActive]}>{pos}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {/* Detailed Bowler Info */}
                                    {(formData.role === 'Bowler' || formData.role === 'All-rounder') && (
                                        <View style={styles.subSection}>
                                            <Text style={styles.subTitle}>Bowling Details</Text>
                                            <View style={styles.choiceGroup}>
                                                <Text style={styles.choiceLabel}>Bowling Hand:</Text>
                                                <View style={styles.row}>
                                                    {['Left', 'Right'].map(style => (
                                                        <TouchableOpacity
                                                            key={style}
                                                            style={[styles.smallChip, formData.bowlerStyle === style && styles.smallChipActive]}
                                                            onPress={() => setFormData({ ...formData, bowlerStyle: style })}
                                                        >
                                                            <Text style={[styles.smallChipText, formData.bowlerStyle === style && styles.smallChipTextActive]}>{style}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                            <View style={styles.choiceGroup}>
                                                <Text style={styles.choiceLabel}>Bowling Type:</Text>
                                                <View style={styles.row}>
                                                    {['Fast', 'Medium', 'Spinner'].map(type => (
                                                        <TouchableOpacity
                                                            key={type}
                                                            style={[styles.smallChip, formData.bowlerType === type && styles.smallChipActive]}
                                                            onPress={() => setFormData({ ...formData, bowlerType: type })}
                                                        >
                                                            <Text style={[styles.smallChipText, formData.bowlerType === type && styles.smallChipTextActive]}>{type}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.inputLabel}>Position / Expertise</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. Forward, Defender, Guard"
                                        value={formData.role}
                                        onChangeText={(text) => setFormData({ ...formData, role: text })}
                                    />
                                    <Text style={styles.helperText}>Enter your playing position or specialization.</Text>
                                </View>
                            )}

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.prevButton}
                                    onPress={() => setStep(1)}
                                >
                                    <Text style={styles.prevButtonText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.registerButton}
                                    onPress={handleRegister}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.registerButtonText}>Submit Registration</Text>
                                            <Ionicons name="checkmark" size={20} color="#FFF" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },

    scrollContent: { flexGrow: 1, padding: spacing.l },
    tournamentHeader: { marginBottom: 24, alignItems: 'center' },
    tourTitle: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center' },
    tourSport: { fontSize: 14, color: colors.primary, fontWeight: '700', marginTop: 4 },

    stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2E8F0' },
    stepDotActive: { backgroundColor: colors.primary },
    stepLine: { width: 60, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 4 },
    stepLineActive: { backgroundColor: colors.primary },

    formSection: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20 },

    inputContainer: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, height: 50, fontSize: 15, color: colors.text },
    helperText: { fontSize: 12, color: colors.textSecondary, marginTop: 6, marginLeft: 4 },

    nextButton: { backgroundColor: colors.text, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 },

    roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    roleChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
    roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    roleChipText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    roleChipTextActive: { color: '#FFF' },

    subSection: { marginTop: 16, padding: 16, backgroundColor: '#F0F9FF', borderRadius: 16, marginBottom: 16 },
    subTitle: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 16 },
    choiceGroup: { marginBottom: 16 },
    choiceLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
    row: { flexDirection: 'row', gap: 8 },
    smallChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
    smallChipActive: { backgroundColor: colors.text, borderColor: colors.text },
    smallChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    smallChipTextActive: { color: '#FFF' },

    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    prevButton: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
    prevButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
    registerButton: { flex: 2, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    registerButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 },

    // Success Screen
    successContainer: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
    successIcon: { marginBottom: 24 },
    successTitle: { fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: 12 },
    successSub: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
    regCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, alignItems: 'center', width: '100%', shadowColor: colors.success, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4, borderWidth: 1, borderColor: '#D1FAE5', marginBottom: 32 },
    regLabel: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    regNumber: { fontSize: 32, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
    infoBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
    infoText: { flex: 1, fontSize: 13, color: '#1E40AF', marginLeft: 12, lineHeight: 18 },
    contactNote: { fontSize: 14, color: colors.success, fontWeight: '700', textAlign: 'center', marginBottom: 40 },
    doneButton: { backgroundColor: colors.text, borderRadius: 20, paddingVertical: 18, paddingHorizontal: 48, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
    doneButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
