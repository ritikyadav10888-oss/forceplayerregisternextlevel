import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const PasswordInput = ({ label, value, onChangeText, showPassword, setShowPassword, placeholder, theme, isDarkMode }) => (
    <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
        <View style={[styles.passwordField, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}>
            <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder={placeholder}
                placeholderTextColor={theme.textLight}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChangeText}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textLight} />
            </TouchableOpacity>
        </View>
    </View>
);

export default function ChangePasswordScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { userData, resetPassword, changePassword } = useAuth();
    const [isResetting, setIsResetting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        try {
            setIsLoading(true);
            await changePassword(currentPassword, newPassword);

            Alert.alert(
                "Success",
                "Your password has been updated across all systems!",
                [{ text: "Great", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            let message = "Could not update password. Please try again.";
            if (error.code === 'auth/wrong-password') {
                message = "The current password you entered is incorrect.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many failed attempts. Please try again later.";
            }
            Alert.alert("Error", message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Change Password</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.infoBox}>
                        <View style={[styles.infoIcon, { backgroundColor: '#F59E0B20' }]}>
                            <Ionicons name="shield-outline" size={24} color="#F59E0B" />
                        </View>
                        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                            For your security, please do not share your password with anyone. Use a combination of letters, numbers, and symbols.
                        </Text>
                    </View>

                    <PasswordInput
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        showPassword={showCurrent}
                        setShowPassword={setShowCurrent}
                        placeholder="Enter current password"
                        theme={theme}
                        isDarkMode={isDarkMode}
                    />

                    <TouchableOpacity
                        style={styles.forgotBtnSmall}
                        onPress={async () => {
                            try {
                                setIsResetting(true);
                                await resetPassword(userData.email);
                                Alert.alert(
                                    "Link Sent",
                                    `A password reset link has been sent to ${userData.email}. Please check your inbox.`,
                                    [{ text: "OK" }]
                                );
                            } catch (error) {
                                Alert.alert("Error", error.message);
                            } finally {
                                setIsResetting(false);
                            }
                        }}
                        disabled={isResetting}
                    >
                        <Text style={[styles.forgotTextSmall, { color: theme.primary, opacity: isResetting ? 0.5 : 1 }]}>
                            {isResetting ? "Sending Link..." : "Forgot current password?"}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <PasswordInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        showPassword={showNew}
                        setShowPassword={setShowNew}
                        placeholder="Enter new password"
                        theme={theme}
                        isDarkMode={isDarkMode}
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        showPassword={showConfirm}
                        setShowPassword={setShowConfirm}
                        placeholder="Confirm new password"
                        theme={theme}
                        isDarkMode={isDarkMode}
                    />

                    <TouchableOpacity
                        style={[styles.updateButton, { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 }]}
                        onPress={handleUpdatePassword}
                        disabled={isLoading}
                    >
                        <Text style={styles.updateButtonText}>
                            {isLoading ? "Updating..." : "Update Password"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    scrollContent: { padding: spacing.l },

    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.03)', marginBottom: 32, gap: 16 },
    infoIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

    inputContainer: { marginBottom: 24 },
    inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
    passwordField: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, height: 60, paddingHorizontal: 16 },
    textInput: { flex: 1, height: '100%', fontSize: 16, fontWeight: '500' },
    eyeIcon: { padding: 4 },

    divider: { height: 1, width: '100%', marginBottom: 32, marginTop: 8 },

    updateButton: { width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    updateButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    forgotBtnSmall: { alignSelf: 'flex-end', marginTop: -20, marginBottom: 20, padding: 4 },
    forgotTextSmall: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }
});
