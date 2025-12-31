import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';

export default function TermsScreen({ navigation }) {
    const { theme } = useTheme();

    const Section = ({ title, content }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>{content}</Text>
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Terms of Service</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.topInfo}>
                        <Text style={[styles.lastUpdated, { color: theme.primary }]}>Last Updated: December 2025</Text>
                        <Text style={[styles.introText, { color: theme.text }]}>
                            Welcome to Force Player. By using our application, you agree to comply with and be bound by the following terms and conditions of use.
                        </Text>
                    </View>

                    <Section
                        title="1. Acceptance of Terms"
                        content="By accessing or using the Force Player mobile application and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services."
                    />

                    <Section
                        title="2. User Eligibility"
                        content="You must be at least 13 years old to use this service. If you are under 18, you represent that you have your parent or guardian's permission to use the service."
                    />

                    <Section
                        title="3. User Conduct"
                        content="Users are expected to maintain sportsmanship and integrity. Any form of cheating, harassment, or use of the platform for illegal activities will result in immediate account termination."
                    />

                    <Section
                        title="4. Tournament Rules"
                        content="Each tournament may have its own specific rules. By registering for a tournament, you agree to abide by both the general platform terms and the specific tournament rules set by the organizer."
                    />

                    <Section
                        title="5. Fees and Payments"
                        content="Tournament registration fees are non-refundable unless specified otherwise by the tournament organizer or in cases of tournament cancellation."
                    />

                    <Section
                        title="6. Account Security"
                        content="You are responsible for maintaining the confidentiality of your account password. Force Player cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation."
                    />

                    <Section
                        title="7. Intellectual Property"
                        content="The Force Player logo, UI design, and content are the property of Force Player Inc. Unauthorized use of any brand assets is strictly prohibited."
                    />

                    <View style={styles.contactBox}>
                        <Text style={[styles.contactTitle, { color: theme.text }]}>Questions about our Terms?</Text>
                        <Text style={[styles.contactDesc, { color: theme.textSecondary }]}>If you have any questions, please contact our legal team.</Text>
                        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: theme.primary }]}>
                            <Text style={styles.contactBtnText}>Contact Support</Text>
                        </TouchableOpacity>
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

    topInfo: { marginBottom: 32 },
    lastUpdated: { fontSize: 13, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' },
    introText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },

    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
    sectionContent: { fontSize: 14, lineHeight: 22 },

    contactBox: { padding: 24, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.03)', marginTop: 20, alignItems: 'center' },
    contactTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
    contactDesc: { fontSize: 13, textAlign: 'center', marginBottom: 20 },
    contactBtn: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 16 },
    contactBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 }
});
