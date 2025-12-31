import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// HelpCenterScreen.js: LayoutAnimation is handled automatically in modern React Native New Architecture.

export default function HelpCenterScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const faqs = [
        {
            id: 1,
            category: 'Tournament',
            question: 'How do I register for a tournament?',
            answer: 'To register, go to the "Tournaments" tab, select a tournament that is "Open", and tap the "Register Now" button. Follow the multi-step form to provide your details and confirm registration.'
        },
        {
            id: 2,
            category: 'Tournament',
            question: 'Can I cancel my registration?',
            answer: 'Yes, but it depends on the tournament organizer\'s policy. Generally, you can cancel before the registration deadline by contacting the organizer or via the tournament details page.'
        },
        {
            id: 3,
            category: 'Account',
            question: 'How do I change my profile photo?',
            answer: 'Go to Settings > Edit Profile. Tap on the camera icon over your profile picture to upload a new one from your gallery or take a new photo.'
        },
        {
            id: 4,
            category: 'Payments',
            question: 'Is the entry fee refundable?',
            answer: 'Refund policies are set by individual organizers. Usually, refunds are processed if the tournament is cancelled. Check the "Rules" section of the specific tournament.'
        },
        {
            id: 5,
            category: 'Technical',
            question: 'App is crashing on the registration page.',
            answer: 'Please ensure you have a stable internet connection. If the issue persists, try clear app cache or reinstall the app. You can also report this via the "Contact Support" button below.'
        }
    ];

    const categories = [
        { id: 'gen', name: 'General', icon: 'apps-outline', color: '#6366F1' },
        { id: 'tour', name: 'Tournaments', icon: 'trophy-outline', color: '#F57C00' },
        { id: 'pay', name: 'Payments', icon: 'card-outline', color: '#10B981' },
        { id: 'tech', name: 'Technical', icon: 'shield-outline', color: '#3B82F6' }
    ];

    const toggleExpand = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const FaqItem = ({ faq }) => (
        <TouchableOpacity
            style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => toggleExpand(faq.id)}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>{faq.question}</Text>
                <Ionicons
                    name={expandedId === faq.id ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.textSecondary}
                />
            </View>
            {expandedId === faq.id && (
                <View style={styles.faqAnswerContainer}>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{faq.answer}</Text>
                </View>
            )}
        </TouchableOpacity>
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('helpCenter')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Search Section */}
                    <View style={styles.searchSection}>
                        <Text style={[styles.searchTitle, { color: theme.text }]}>How can we help you?</Text>
                        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Search help articles..."
                                placeholderTextColor={theme.textLight}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Quick Categories */}
                    <View style={styles.categoryGrid}>
                        {categories.map(cat => (
                            <TouchableOpacity key={cat.id} style={[styles.categoryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}15` }]}>
                                    <Ionicons name={cat.icon} size={24} color={cat.color} />
                                </View>
                                <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* FAQ Section */}
                    <View style={styles.faqSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map(faq => (
                                <FaqItem key={faq.id} faq={faq} />
                            ))
                        ) : (
                            <View style={styles.emptySearch}>
                                <Ionicons name="help-circle-outline" size={48} color={theme.textLight} />
                                <Text style={{ color: theme.textSecondary, marginTop: 12 }}>No articles found for your search.</Text>
                            </View>
                        )}
                    </View>

                    {/* Contact Support Card */}
                    <LinearGradient
                        colors={['#1E293B', '#0F172A']}
                        style={styles.contactCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.contactIcon}>
                            <Ionicons name="headset-outline" size={32} color="#FFF" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.contactTitle}>Still need help?</Text>
                            <Text style={styles.contactSubtitle}>Our support team is available 24/7 to assist you.</Text>
                        </View>
                        <TouchableOpacity style={styles.contactButton}>
                            <Text style={styles.contactButtonText}>Contact Us</Text>
                        </TouchableOpacity>
                    </LinearGradient>

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

    searchSection: { marginBottom: 24 },
    searchTitle: { fontSize: 24, fontWeight: '900', marginBottom: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderRadius: 16, borderWidth: 1, elevation: 1 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },

    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
    categoryCard: { width: '48%', padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center', elevation: 1 },
    categoryIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    categoryName: { fontSize: 14, fontWeight: '700' },

    faqSection: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
    faqCard: { borderRadius: 20, borderWidth: 1, marginBottom: 12, overflow: 'hidden', elevation: 1 },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    faqQuestion: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 16 },
    faqAnswerContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    divider: { height: 1, marginBottom: 16 },
    faqAnswer: { fontSize: 14, lineHeight: 22 },
    emptySearch: { alignItems: 'center', paddingVertical: 40 },

    contactCard: { borderRadius: 28, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 20, elevation: 4 },
    contactIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    contactTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    contactSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginRight: 10 },
    contactButton: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    contactButtonText: { color: '#0F172A', fontSize: 13, fontWeight: '800' }
});
