import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useFocusEffect } from '@react-navigation/native';
import { getAllTournaments, getUserRegistrations, checkTournamentStatus } from '../../services/tournamentService';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function PlayerTournamentsScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchTournaments();
        }, [activeTab])
    );

    const fetchTournaments = async () => {
        setLoading(true);
        const [allData, userRegs] = await Promise.all([
            getAllTournaments(activeTab),
            getUserRegistrations(user.uid)
        ]);

        const registeredTourneyIds = userRegs.map(reg => reg.tournamentId);

        // Filter: Hide closed tournaments unless user is registered
        const filteredData = allData.filter(tourney => {
            const status = checkTournamentStatus(tourney);
            const isRegistered = registeredTourneyIds.includes(tourney.id);
            return status.open || isRegistered;
        });

        setTournaments(filteredData);
        setLoading(false);
    };

    const filters = ['All', 'Cricket', 'Football', 'Badminton', 'Basketball', 'Tennis'];

    const getSportIcon = (sport) => {
        switch (sport?.toLowerCase()) {
            case 'cricket': return 'baseball-outline';
            case 'football': return 'football-outline';
            case 'basketball': return 'basketball-outline';
            case 'tennis': return 'tennisball-outline';
            default: return 'trophy-outline';
        }
    };

    const TournamentCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 0 }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('TournamentDetails', { tournament: item })}
        >
            {item.bannerImage && (
                <Image source={{ uri: item.bannerImage }} style={styles.cardBanner} />
            )}
            <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#FFF7ED' }]}>
                    <Text style={[styles.badgeText, { color: theme.warning }]}>
                        {item.type || 'Tournament'}
                    </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5', marginLeft: 8 }]}>
                    <Text style={[styles.badgeText, { color: theme.success }]}>
                        {item.status || 'Open'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}>
                    <Ionicons
                        name={getSportIcon(item.sport)}
                        size={28}
                        color={theme.primary}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.organizer, { color: theme.textSecondary }]}>{item.sport} • {item.format}</Text>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border, backgroundColor: isDarkMode ? theme.surfaceHighlight : '#FAFAFA' }]}>
                <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>{item.startDate}</Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="cash-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>₹{item.entryFee}</Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="trophy-outline" size={14} color={theme.warning} />
                    <Text style={[styles.footerText, { color: theme.warning, fontWeight: '700' }]}>₹{item.prizePool}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const filteredTournaments = tournaments.filter(t =>
    (t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sport?.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Find {t('tournaments')}</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="options-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Search by name or sport..."
                            placeholderTextColor={theme.textLight}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Filters */}
                <View style={styles.filterScrollContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.l }}>
                        {filters.map(filter => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: theme.card, borderColor: theme.border },
                                    activeTab === filter && { backgroundColor: theme.text, borderColor: theme.text }
                                ]}
                                onPress={() => setActiveTab(filter)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    { color: theme.textSecondary },
                                    activeTab === filter && { color: theme.background }
                                ]}>{filter}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* List */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                        {filteredTournaments.length > 0 ? (
                            filteredTournaments.map(item => (
                                <TournamentCard key={item.id} item={item} />
                            ))
                        ) : (
                            <View style={{ alignItems: 'center', marginTop: 40 }}>
                                <Ionicons name="search-outline" size={48} color={theme.textLight} />
                                <Text style={{ color: theme.textSecondary, marginTop: 12 }}>No tournaments found</Text>
                            </View>
                        )}
                    </ScrollView>
                )}

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    filterButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

    searchContainer: { paddingHorizontal: spacing.l, marginBottom: spacing.m },
    searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 15, height: '100%' },

    filterScrollContainer: { marginBottom: spacing.l },
    filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 12, borderWidth: 1 },
    filterText: { fontSize: 14, fontWeight: '600' },

    listContent: { padding: spacing.l, paddingTop: 0, paddingBottom: 100 },

    card: { borderRadius: 24, padding: 0, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, overflow: 'hidden' },
    cardBanner: { width: '100%', height: 140, backgroundColor: 'rgba(0,0,0,0.05)' },
    cardHeader: { flexDirection: 'row', padding: 16, paddingBottom: 0 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: '800' },

    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 12 },
    iconContainer: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    organizer: { fontSize: 13, fontWeight: '500' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1 },
    footerItem: { flexDirection: 'row', alignItems: 'center' },
    footerText: { fontSize: 12, marginLeft: 6, fontWeight: '600' }
});
