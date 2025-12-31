import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function RateUsScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleRate = (value) => {
        setRating(value);
    };

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert("Error", "Please select a star rating");
            return;
        }
        // Simulate API call
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconContainer}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.successIconGradient}>
                            <Ionicons name="checkmark-done" size={60} color="#FFF" />
                        </LinearGradient>
                    </View>
                    <Text style={[styles.successTitle, { color: theme.text }]}>Thank You!</Text>
                    <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                        Your feedback helps us make Force Player even better for everyone.
                    </Text>
                    <TouchableOpacity
                        style={[styles.doneButton, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.doneButtonText}>Back to Settings</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('rateUs')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.contentCard}>
                        <View style={[styles.emojiContainer, { backgroundColor: `${theme.primary}10` }]}>
                            <Text style={styles.emojiText}>
                                {rating >= 5 ? '🤩' : rating >= 4 ? '😊' : rating >= 3 ? '😐' : rating >= 2 ? '☹️' : rating >= 1 ? '😡' : '⭐'}
                            </Text>
                        </View>

                        <Text style={[styles.title, { color: theme.text }]}>How was your experience?</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Give us a rating and tell us what you love or what we can improve.
                        </Text>

                        {/* Star Rating */}
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => handleRate(star)}
                                    activeOpacity={0.7}
                                    style={styles.starTouch}
                                >
                                    <Ionicons
                                        name={rating >= star ? "star" : "star-outline"}
                                        size={45}
                                        color={rating >= star ? "#F59E0B" : theme.border}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Feedback Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Additional Comments (Optional)</Text>
                            <TextInput
                                style={[styles.textInput, {
                                    backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC',
                                    borderColor: theme.border,
                                    color: theme.text
                                }]}
                                placeholder="Your thoughts..."
                                placeholderTextColor={theme.textLight}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={feedback}
                                onChangeText={setFeedback}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: rating > 0 ? theme.primary : theme.border }
                            ]}
                            disabled={rating === 0}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit Review</Text>
                        </TouchableOpacity>

                        <Text style={[styles.disclaimer, { color: theme.textLight }]}>
                            Your feedback is private and helps us improve our internal services.
                        </Text>
                    </View>

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

    scrollContent: { padding: spacing.l, alignItems: 'center' },
    contentCard: { width: '100%', alignItems: 'center' },

    emojiContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 20 },
    emojiText: { fontSize: 50 },

    title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 24, paddingHorizontal: 20 },

    starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 40 },
    starTouch: { padding: 4 },

    inputContainer: { width: '100%', marginBottom: 32 },
    inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
    textInput: { borderRadius: 20, padding: 20, fontSize: 16, borderWidth: 1, minHeight: 120 },

    submitButton: { width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    disclaimer: { marginTop: 20, fontSize: 12, textAlign: 'center' },

    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    successIconContainer: { width: 120, height: 120, borderRadius: 60, marginBottom: 32, ...Platform.select({ ios: { shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 20 }, android: { elevation: 12 } }) },
    successIconGradient: { flex: 1, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
    successTitle: { fontSize: 32, fontWeight: '900', marginBottom: 16 },
    successSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 26, marginBottom: 40 },
    doneButton: { width: '100%', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    doneButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
