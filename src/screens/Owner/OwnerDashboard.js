import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    useWindowDimensions,
    Image,
    Linking,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../styles/spacing';

const StatCard = ({ label, value, icon, gradient, theme }) => (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statIconGradient}
        >
            <Ionicons name={icon} size={22} color="#FFF" />
        </LinearGradient>
        <View style={styles.statInfo}>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
        </View>
    </View>
);

const QuickAction = ({ icon, label, onPress, theme, gradient }) => (
    <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onPress}
    >
        <LinearGradient colors={gradient} style={styles.actionIcon}>
            <Ionicons name={icon} size={20} color="#FFF" />
        </LinearGradient>
        <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
);

export default function OwnerDashboard() {
    const { logout, createOrganizer } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    const isLargeScreen = windowWidth > 768;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [idCardDetails, setIdCardDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('organizers');
    const [showPassword, setShowPassword] = useState(false);

    const handleCreate = async () => {
        if (!email || !password || !orgName || !phoneNumber || !idCardDetails) {
            Alert.alert('Missing Info', 'Please fill all fields to create an organizer account.');
            return;
        }
        setLoading(true);
        try {
            await createOrganizer(email, password, orgName, phoneNumber, idCardDetails);

            const subject = "Welcome to Force - Organizer Account Credentials";
            const body = `Hello ${orgName},\n\nWelcome to Force! Your organizer account has been successfully created.\n\nHere are your login credentials:\n\nUsername: ${email}\nPassword: ${password}\n\nPlease login and change your password immediately for security.\n\nBest regards,\nForce Admin Team`;
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            Alert.alert(
                'Account Created',
                'Organizer account setup successfully. Redirecting to email client...',
                [
                    {
                        text: 'Send Credentials',
                        onPress: () => {
                            Linking.openURL(mailtoUrl).catch(err => console.error("Couldn't load page", err));
                            setEmail(''); setPassword(''); setOrgName(''); setPhoneNumber(''); setIdCardDetails('');
                        }
                    }
                ]
            );
        } catch (e) {
            Alert.alert('Setup Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to end this admin session?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", onPress: logout, style: 'destructive' }
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={isDarkMode ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#F1F5F9']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>Control Center</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Owner Dashboard</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="log-out-outline" size={22} color={theme.error} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Summary Stats */}
                        <View style={styles.statsGrid}>
                            <StatCard
                                label="Organizers"
                                value="24"
                                icon="business"
                                gradient={['#6366F1', '#4F46E5']}
                                theme={theme}
                            />
                            <StatCard
                                label="Tournaments"
                                value="156"
                                icon="trophy"
                                gradient={['#F59E0B', '#D97706']}
                                theme={theme}
                            />
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Organizer Management</Text>

                        {/* Creation Form Card */}
                        <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={styles.cardHeader}>
                                <LinearGradient colors={['#10B981', '#059669']} style={styles.headerIcon}>
                                    <Ionicons name="person-add" size={20} color="#FFF" />
                                </LinearGradient>
                                <View>
                                    <Text style={[styles.cardTitle, { color: theme.text }]}>Add New Host</Text>
                                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Onboard a new organization/manager</Text>
                                </View>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name / Organization</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}>
                                        <Ionicons name="business-outline" size={20} color={theme.primary} style={styles.fieldIcon} />
                                        <TextInput
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder="e.g. Mumbai Football Club"
                                            placeholderTextColor={theme.textLight}
                                            value={orgName}
                                            onChangeText={setOrgName}
                                        />
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}>
                                            <TextInput
                                                style={[styles.input, { color: theme.text }]}
                                                placeholder="email@host.com"
                                                placeholderTextColor={theme.textLight}
                                                value={email}
                                                onChangeText={setEmail}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Contact</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}>
                                            <TextInput
                                                style={[styles.input, { color: theme.text }]}
                                                placeholder="Mobile No."
                                                placeholderTextColor={theme.textLight}
                                                value={phoneNumber}
                                                onChangeText={setPhoneNumber}
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ID Verification Number</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder="Aadhaar / PAN / Organization ID"
                                            placeholderTextColor={theme.textLight}
                                            value={idCardDetails}
                                            onChangeText={setIdCardDetails}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Access Password</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder="Set strong password"
                                            placeholderTextColor={theme.textLight}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={theme.textLight} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                                    onPress={handleCreate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.primaryBtnText}>Provision Account</Text>
                                            <Ionicons name="shield-checkmark" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Quick Insights */}
                        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>Platform Quick Actions</Text>
                        <View style={styles.actionGrid}>
                            <QuickAction
                                icon="mail"
                                label="Broadcast"
                                gradient={['#EC4899', '#DB2777']}
                                theme={theme}
                                onPress={() => Alert.alert("Coming Soon", "Broadcast functionality is being improved.")}
                            />
                            <QuickAction
                                icon="list"
                                label="Audit Logs"
                                gradient={['#8B5CF6', '#7C3AED']}
                                theme={theme}
                                onPress={() => Alert.alert("Audit", "Viewing activity logs requires server elevation.")}
                            />
                            <QuickAction
                                icon="settings"
                                label="Maintain"
                                gradient={['#64748B', '#475569']}
                                theme={theme}
                                onPress={() => Alert.alert("System", "Platform maintenance mode is currently OFF.")}
                            />
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingVertical: spacing.m
    },
    welcomeText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
    title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
    logoutBtn: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    scrollContent: { paddingHorizontal: spacing.l, paddingBottom: 40 },
    statsGrid: { flexDirection: 'row', gap: 12, marginVertical: spacing.l },
    statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
    statIconGradient: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    statValue: { fontSize: 20, fontWeight: '900' },
    statLabel: { fontSize: 12, fontWeight: '700' },

    sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },

    mainCard: { borderRadius: 28, padding: 24, borderWidth: 1, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    headerIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardTitle: { fontSize: 18, fontWeight: '800' },
    cardSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 1 },

    formContainer: { gap: 16 },
    inputGroup: {},
    inputLabel: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16 },
    fieldIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 15, fontWeight: '700' },
    row: { flexDirection: 'row' },

    primaryBtn: {
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5
    },
    primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

    actionGrid: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, padding: 16, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    actionIcon: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    actionLabel: { fontSize: 12, fontWeight: '800' }
});
