import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../styles/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getPlayerStats } from '../../services/tournamentService';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function StatisticsScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchStats();
        }, [])
    );

    const fetchStats = async () => {
        setLoading(true);
        const data = await getPlayerStats(user.uid);
        if (data) setStats(data);
        setLoading(false);
    };

    const PerformanceMetric = ({ label, value, progress, color }) => (
        <View style={styles.metricContainer}>
            <View style={styles.metricHeader}>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: theme.surfaceHighlight }]}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
            </View>
        </View>
    );

    const StatGridItem = ({ label, value, icon, color }) => (
        <View style={[styles.statGridItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statGridIcon, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.statGridValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.statGridLabel, { color: theme.textSecondary }]}>{label}</Text>
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('statistics')}</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="share-outline" size={24} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        {/* Overall Score Card */}
                        <LinearGradient
                            colors={['#1E293B', '#0F172A']}
                            style={styles.scoreCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.scoreInfo}>
                                <Text style={styles.scoreLabel}>Overall Player Rating</Text>
                                <Text style={styles.scoreValue}>{stats?.overallRating || '0.0'}</Text>
                                <View style={styles.trendContainer}>
                                    <Ionicons name="trending-up" size={16} color="#10B981" />
                                    <Text style={styles.trendText}>Ranked Top 10%</Text>
                                </View>
                            </View>
                            <View style={styles.rankContainer}>
                                <Text style={styles.rankLabel}>Total Tournaments</Text>
                                <Text style={styles.rankValue}>{stats?.tournamentsJoined || 0}</Text>
                            </View>
                        </LinearGradient>

                        {/* Key Metrics */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Indicators</Text>
                            <View style={[styles.metricsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <PerformanceMetric label="Match Win Rate" value={`${stats?.winRate || 0}%`} progress={stats?.winRate || 0} color="#F57C00" />
                                <PerformanceMetric label="Matches Played" value={stats?.matchesPlayed || 0} progress={stats?.matchesPlayed > 0 ? 100 : 0} color="#10B981" />
                                <PerformanceMetric label="Recent Win Ratio" value="High" progress={80} color="#3B82F6" />
                            </View>
                        </View>

                        {/* Sport Specific Stats */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cricket Analytics</Text>
                            <View style={styles.statsGrid}>
                                <StatGridItem label="Total Runs" value={stats?.sportStats?.cricket?.runs || '0'} icon="baseball-outline" color="#F57C00" />
                                <StatGridItem label="Wickets" value={stats?.sportStats?.cricket?.wickets || '0'} icon="trophy-outline" color="#3B82F6" />
                                <StatGridItem label="Str. Rate" value={stats?.sportStats?.cricket?.strRate || '0'} icon="flash-outline" color="#F59E0B" />
                                <StatGridItem label="Matches" value={stats?.matchesPlayed || '0'} icon="speedometer-outline" color="#10B981" />
                            </View>
                        </View>

                        {/* Recent Form */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Form</Text>
                            <View style={[styles.formContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                {(stats?.recentResults || ['-', '-', '-', '-', '-']).map((result, index) => (
                                    <View key={index} style={styles.formItem}>
                                        <View style={[styles.formBadge, { backgroundColor: result === 'W' ? theme.success : result === 'L' ? theme.error : theme.textLight }]}>
                                            <Text style={styles.formBadgeText}>{result}</Text>
                                        </View>
                                        <Text style={[styles.formDate, { color: theme.textSecondary }]}>Match {index + 1}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Download Report */}
                        <TouchableOpacity style={[styles.reportButton, { backgroundColor: theme.primary }]}>
                            <Ionicons name="download-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.reportButtonText}>Download Full Performance Report</Text>
                        </TouchableOpacity>

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
    iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

    scrollContent: { padding: spacing.l },

    scoreCard: { borderRadius: 28, padding: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15 },
    scoreLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    scoreValue: { fontSize: 48, fontWeight: '900', color: '#FFF', marginVertical: 4 },
    trendContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    trendText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginLeft: 4 },
    rankContainer: { alignItems: 'flex-end' },
    rankLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    rankValue: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 4 },

    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, marginLeft: 4 },
    metricsCard: { padding: 20, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },

    metricContainer: { marginBottom: 20 },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    metricLabel: { fontSize: 14, fontWeight: '600' },
    metricValue: { fontSize: 16, fontWeight: '800' },
    progressBarContainer: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 4 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statGridItem: { width: (width - 60) / 2, padding: 20, borderRadius: 22, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 },
    statGridIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statGridValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
    statGridLabel: { fontSize: 12, fontWeight: '600' },

    formContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderRadius: 24, borderWidth: 1 },
    formItem: { alignItems: 'center' },
    formBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    formBadgeText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
    formDate: { fontSize: 10, fontWeight: '700' },

    reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, marginBottom: 40, shadowColor: '#F57C00', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
    reportButtonText: { color: '#FFF', fontSize: 15, fontWeight: '800' }
});
