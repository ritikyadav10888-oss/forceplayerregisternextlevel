import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacyPolicyScreen({ navigation }) {
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Policy</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.topInfo}>
                        <Text style={[styles.lastUpdated, { color: theme.primary }]}>Last Updated: December 2025</Text>
                        <Text style={[styles.introText, { color: theme.text }]}>
                            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                        </Text>
                    </View>

                    <Section
                        title="1. Information We Collect"
                        content="We collect information you provide directly to us, such as when you create an account, register for a tournament, or contact support. This includes your name, email address, phone number, and sporting interests."
                    />

                    <Section
                        title="2. How We Use Data"
                        content="We use your data to provide our services, process tournament registrations, send important notifications, and improve the user experience of Force Player."
                    />

                    <Section
                        title="3. Data Sharing"
                        content="We share your name and sporting profile with tournament organizers when you register for their events. We do not sell your personal data to third-party advertisers."
                    />

                    <Section
                        title="4. Location Data"
                        content="With your permission, we may collect your location to suggest tournaments happening near you. You can disable this feature in your device settings."
                    />

                    <Section
                        title="5. Data Security"
                        content="We implement robust security measures to protect your personal information from unauthorized access, loss, or disclosure. All sensitive data is encrypted."
                    />

                    <Section
                        title="6. Your Rights"
                        content="You have the right to access, correct, or delete your personal information. You can manage most of these settings directly within the app's Privacy & Security section."
                    />

                    <Section
                        title="7. Cookies & Tracking"
                        content="We use analytics tools to understand how users interact with our app. This helps us optimize performance and deliver better features."
                    />

                    <View style={styles.contactBox}>
                        <Text style={[styles.contactTitle, { color: theme.text }]}>Privacy Concerns?</Text>
                        <Text style={[styles.contactDesc, { color: theme.textSecondary }]}>Our data protection officer is here to help you with any privacy-related inquiries.</Text>
                        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: theme.primary }]}>
                            <Text style={styles.contactBtnText}>Email Privacy Team</Text>
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
