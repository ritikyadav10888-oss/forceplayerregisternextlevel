import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView,
    useWindowDimensions,
    KeyboardAvoidingView,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../styles/spacing';

export default function ForgotPasswordScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { width: windowWidth } = useWindowDimensions();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const isLargeScreen = windowWidth > 768;

    const handleResetPassword = useCallback(async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email to reset password.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email.toLowerCase().trim());
            Alert.alert('Success', 'Password reset link sent to your email.');
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }, [email, resetPassword, navigation]);

    const ui = useMemo(() => ({
        cardWidth: isLargeScreen ? 480 : '100%',
        cardRadius: 32,
        padding: isLargeScreen ? spacing.xxl : spacing.xl,
        logoSize: isLargeScreen ? 140 : 120,
    }), [isLargeScreen]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={[styles.content, { paddingHorizontal: spacing.l }]}>
                            <View style={[styles.card, {
                                maxWidth: ui.cardWidth,
                                borderRadius: ui.cardRadius,
                                padding: ui.padding,
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                                borderWidth: isDarkMode ? 1 : 0
                            }]}>
                                <View style={[styles.logoCircle, { backgroundColor: theme.primary + '15', width: ui.logoSize, height: ui.logoSize, borderRadius: ui.logoSize / 2 }]}>
                                    <Ionicons name="key-outline" size={ui.logoSize * 0.4} color={theme.primary} />
                                </View>

                                <Text style={[styles.title, { color: theme.text }]}>Forgot Password?</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                    Enter your registered email below to receive password reset instructions.
                                </Text>

                                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                <View style={[styles.inputWrapper, {
                                    backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC',
                                    borderColor: theme.border
                                }]}>
                                    <Ionicons name="mail-outline" size={20} color={theme.primary} style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { color: theme.text }]}
                                        placeholder="Email Address"
                                        placeholderTextColor={theme.textLight}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.resetButton, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.resetButtonText}>Send Reset Link</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <Ionicons name="arrow-back" size={18} color={theme.primary} />
                                    <Text style={[styles.backText, { color: theme.primary }]}>Back to Login</Text>
                                </TouchableOpacity>
                            </View>
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
    scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        alignItems: 'center',
    },
    logoCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: spacing.l,
    },
    divider: { width: '100%', height: 1.5, marginVertical: spacing.xl, opacity: 0.5 },
    inputWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.m,
        borderWidth: 1.5,
    },
    icon: { marginRight: spacing.m },
    input: { flex: 1, paddingVertical: 16, fontSize: 16, fontWeight: '600' },
    resetButton: {
        width: '100%',
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: spacing.l,
    },
    buttonDisabled: { opacity: 0.6 },
    resetButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.s },
    backText: { fontWeight: '800', fontSize: 14, marginLeft: 8, textDecorationLine: 'underline' }
});
