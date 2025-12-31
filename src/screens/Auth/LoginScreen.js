import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    useWindowDimensions,
    KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../styles/spacing';

const BrandHeader = React.memo(({ size, theme }) => (
    <View style={styles.brandContainer}>
        <View style={[styles.logoCircle, { backgroundColor: theme.primary + '15', width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 }]}>
            <Image
                source={require('../../../assets/logo.png')}
                style={{ width: size * 0.5, height: size * 0.3 }}
                resizeMode="contain"
            />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Force Player</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Unleash the Pride</Text>
    </View>
));

const CustomInput = React.memo(({ icon, theme, isDarkMode, rightIcon, onRightIconPress, ...props }) => (
    <View style={[styles.inputWrapper, {
        backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC',
        borderColor: theme.border
    }]}>
        <Ionicons name={icon} size={20} color={theme.primary} style={styles.icon} />
        <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholderTextColor={theme.textLight}
            {...props}
        />
        {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress} style={{ padding: 4 }}>
                <Ionicons name={rightIcon} size={20} color={theme.textLight} />
            </TouchableOpacity>
        )}
    </View>
));

export default function LoginScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { width: windowWidth } = useWindowDimensions();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const isLargeScreen = windowWidth > 768;

    const handleLogin = useCallback(async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(email.toLowerCase().trim(), password);
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    }, [email, password, login]);

    const ui = useMemo(() => ({
        cardWidth: isLargeScreen ? 480 : '100%',
        cardRadius: 32,
        padding: isLargeScreen ? spacing.xxl : spacing.xl,
        logoSize: isLargeScreen ? 180 : 140,
    }), [isLargeScreen]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                                <BrandHeader size={ui.logoSize} theme={theme} />

                                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                <Text style={[styles.welcomeTitle, { color: theme.text }]}>Login</Text>
                                <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>Enter your credentials to continue</Text>

                                <CustomInput
                                    icon="mail-outline"
                                    placeholder="Email Address"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    theme={theme}
                                    isDarkMode={isDarkMode}
                                />

                                <CustomInput
                                    icon="lock-closed-outline"
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    theme={theme}
                                    isDarkMode={isDarkMode}
                                    rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
                                    onRightIconPress={() => setShowPassword(!showPassword)}
                                />

                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPassContainer}>
                                    <Text style={[styles.forgotPassword, { color: theme.primary }]}>Forgot Password?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.loginButton, { backgroundColor: theme.primary }]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
                                </TouchableOpacity>

                                <View style={styles.footer}>
                                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={[styles.registerLink, { color: theme.primary }]}>Register Now</Text>
                                    </TouchableOpacity>
                                </View>
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
    content: { alignItems: 'center', justifyContent: 'center' },
    card: {
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        alignItems: 'center'
    },
    brandContainer: { alignItems: 'center', marginBottom: spacing.m },
    logoCircle: { justifyContent: 'center', alignItems: 'center', marginBottom: spacing.m },
    title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },

    welcomeTitle: { fontSize: 28, fontWeight: '800', alignSelf: 'flex-start', marginBottom: 4 },
    welcomeSubtitle: { fontSize: 14, fontWeight: '500', alignSelf: 'flex-start', marginBottom: spacing.xl },

    divider: { width: '100%', height: 1.5, marginVertical: spacing.xl, opacity: 0.5 },

    inputWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        marginBottom: spacing.m,
        paddingHorizontal: spacing.m,
        borderWidth: 1.5
    },
    icon: { marginRight: spacing.m },
    input: { flex: 1, paddingVertical: 14, fontSize: 16, fontWeight: '600' },

    forgotPassContainer: { alignSelf: 'flex-end', marginBottom: spacing.xl },
    forgotPassword: { fontWeight: '800', fontSize: 14 },

    loginButton: {
        width: '100%',
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5
    },
    loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

    footer: { flexDirection: 'row', alignItems: 'center' },
    footerText: { fontWeight: '600', fontSize: 14 },
    registerLink: { fontWeight: '800', fontSize: 14, textDecorationLine: 'underline' }
});
