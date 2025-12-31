import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

import { useAuth } from '../../context/AuthContext';
import { createTournament } from '../../services/tournamentService';

const InputField = ({ label, placeholder, value, onChangeText, icon, multiline, keyboardType, onPress }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={[styles.inputWrapper, multiline && { height: 120, alignItems: 'flex-start' }]}
        >
            <Ionicons name={icon} size={20} color={colors.textSecondary} style={{ marginTop: multiline ? 12 : 0 }} />
            <TextInput
                style={[styles.input, multiline && { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                keyboardType={keyboardType}
                editable={!onPress}
                pointerEvents={onPress ? 'none' : 'auto'}
            />
        </TouchableOpacity>
    </View>
);

export default function CreateTournamentScreen({ navigation }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerField, setPickerField] = useState(null);
    const [pickerMode, setPickerMode] = useState('date'); // 'date' | 'time'
    const [showSchedulePicker, setShowSchedulePicker] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        bannerImage: null,
        sport: '',
        format: 'singles', // 'singles' | 'doubles' | 'team'
        description: '',
        rules: '',
        registrationDeadline: '',
        startDate: '',
        startTime: '',
        endDate: '',
        location: '',
        matchDuration: '60',
        daysOfWeek: ['Sat', 'Sun'],
        scheduleType: 'Single Elimination',
        scoringMetric: 'Points'
    });

    const handlePublish = async () => {
        if (!formData.title || !formData.sport || !formData.startDate || !formData.location) {
            Alert.alert("Missing Fields", "Please fill in all required fields (Title, Sport, Start Date, Location).");
            return;
        }

        setLoading(true);
        try {
            await createTournament({
                ...formData,
                type: 'tournament',
            }, user.uid);

            Alert.alert("Success", "Tournament published successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to publish tournament. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const rulesPresets = {
        Cricket: {
            basic: "• 8-10 overs per inning.\n• Tennis ball match.\n• No LBW.\n• Continuous bowling limit: 2 overs.",
            standard: "• T20 Format (20 overs).\n• Leather ball.\n• ICC Powerplay rules.\n• LBW applicable.\n• Max 4 overs per bowler."
        },
        Football: {
            basic: "• 5v5 or 7v7 format.\n• 20 mins per half.\n• Rolling substitutions.\n• No offside rule.",
            standard: "• 11v11 FIFA rules.\n• 45 mins per half.\n• Offside rule enforced.\n• 5 substitutions max."
        },
        Basketball: {
            basic: "• 3x3 half court.\n• 15 mins game time.\n• 1 point inside arc, 2 points outside.",
            standard: "• 5v5 full court.\n• 4 quarters of 10 mins.\n• NBA/FIBA foul rules apply."
        },
        Badminton: {
            basic: "• 1 set of 21 points.\n• Golden point at 20-20.\n• Service rotation applies.",
            standard: "• Best of 3 sets.\n• 21 points per set.\n• Deuce rules apply (max 30)."
        },
        Hockey: {
            basic: "• 20 mins per half.\n• No lifting the ball above knee.\n• Rolling substitutions.",
            standard: "• 4 quarters of 15 mins.\n• FIH rules apply.\n• Penalty corners and strokes enforced."
        },
        Athletics: {
            basic: "• Standard track events (100m, 200m).\n• Best of 2 heats.",
            standard: "• IAAF rules.\n• Electronic timing.\n• Field events with 3 attempts."
        },
        Swimming: {
            basic: "• 25m/50m freestyle.\n• One false start allowance.",
            standard: "• FINA rules.\n• Touchpads for timing.\n• All strokes as per regulation."
        },
        Boxing: {
            basic: "• 3 rounds of 2 mins.\n• Headgear mandatory.\n• 16oz gloves.",
            standard: "• 3 rounds of 3 mins.\n• Scoring on 10-point must system.\n• AIBA rules."
        },
        Wrestling: {
            basic: "• 1 round of 5 mins.\n• No dangerous throws.",
            standard: "• 2 periods of 3 mins.\n• UWW rules.\n• Tech fall at 10 points diff."
        },
        Carrom: {
            basic: "• 4 boards match.\n• Black: 10, White: 20, Queen: 50.",
            standard: "• Best of 3 boards.\n• ICF rules.\n• Professional board and striker."
        },
        Pickleball: {
            basic: "• Match to 11 points (win by 2).\n• Underhand serve only.\n• Non-volley zone (Kitchen) rules apply.",
            standard: "• Best of 3 sets to 11.\n• Double bounce rule enforced.\n• Professional refereeing."
        },
        default: {
            basic: "• Follow basic fair play guidelines.\n• Respect referee decisions.\n• Standard scoring system.",
            standard: "• Official tournament regulations apply.\n• Professional refereeing.\n• Detailed scoring and dispute resolution."
        }
    };

    const schedulerPresets = {
        'Cricket': { category: 'Field Teams', schedule: 'Single Elimination', metric: 'Most Runs' },
        'Football': { category: 'Field Teams', schedule: 'Single Elimination', metric: 'Most Goals' },
        'Hockey': { category: 'Field Teams', schedule: 'Single Elimination', metric: 'Most Goals' },
        'Kabaddi': { category: 'Field Teams', schedule: 'Single Elimination', metric: 'Most Points' },
        'Basketball': { category: 'Court Teams', schedule: 'Group Stage (Pools)', metric: 'Points Per Set' },
        'Volleyball': { category: 'Court Teams', schedule: 'Group Stage (Pools)', metric: 'Points Per Set' },
        'Badminton': { category: 'Racket/Table', schedule: 'Double Elimination', metric: 'Best of 3 Sets' },
        'Tennis': { category: 'Racket/Table', schedule: 'Double Elimination', metric: 'Best of 3 Sets' },
        'Table Tennis': { category: 'Racket/Table', schedule: 'Double Elimination', metric: 'Best of 3 Sets' },
        'Carrom': { category: 'Racket/Table', schedule: 'Double Elimination', metric: 'Best of 3 Sets' },
        'Pickleball': { category: 'Racket/Table', schedule: 'Double Elimination', metric: 'Best of 3 Sets' },
        'Athletics': { category: 'Racing', schedule: 'Timed Heats', metric: 'Clock Time' },
        'Swimming': { category: 'Racing', schedule: 'Timed Heats', metric: 'Clock Time' },
        'Chess': { category: 'Strategy', schedule: 'Swiss System', metric: '1, 0.5, 0 pts' },
        'Boxing': { category: 'Combat', schedule: 'Single Elimination', metric: 'Judge/Ref Decision' },
        'Wrestling': { category: 'Combat', schedule: 'Single Elimination', metric: 'Judge/Ref Decision' },
    };

    const categories = [
        { id: 'cricket', name: 'Cricket', icon: 'baseball-outline', defaultFormat: 'team', allowed: ['team'] },
        { id: 'football', name: 'Football', icon: 'football-outline', defaultFormat: 'team', allowed: ['team'] },
        { id: 'basketball', name: 'Basketball', icon: 'basketball-outline', defaultFormat: 'team', allowed: ['team'] },
        { id: 'badminton', name: 'Badminton', icon: 'tennisball-outline', defaultFormat: 'singles', allowed: ['singles', 'doubles'] },
        { id: 'tennis', name: 'Tennis', icon: 'tennisball-outline', defaultFormat: 'singles', allowed: ['singles', 'doubles'] },
        { id: 'tabletennis', name: 'Table Tennis', icon: 'hardware-chip-outline', defaultFormat: 'singles', allowed: ['singles', 'doubles'] },
        { id: 'volleyball', name: 'Volleyball', icon: 'american-football-outline', defaultFormat: 'team', allowed: ['team'] },
        { id: 'kabaddi', name: 'Kabaddi', icon: 'body-outline', defaultFormat: 'team', allowed: ['team'] },
        { id: 'hockey', name: 'Hockey', icon: 'ellipse-outline', defaultFormat: 'team', allowed: ['team'] }, // Custom icon needed or general
        { id: 'athletics', name: 'Athletics', icon: 'walk-outline', defaultFormat: 'singles', allowed: ['singles'] },
        { id: 'swimming', name: 'Swimming', icon: 'water-outline', defaultFormat: 'singles', allowed: ['singles'] },
        { id: 'boxing', name: 'Boxing', icon: 'hand-left-outline', defaultFormat: 'singles', allowed: ['singles'] },
        { id: 'wrestling', name: 'Wrestling', icon: 'fitness-outline', defaultFormat: 'singles', allowed: ['singles'] },
        { id: 'carrom', name: 'Carrom', icon: 'apps-outline', defaultFormat: 'singles', allowed: ['singles', 'doubles'] },
        { id: 'pickleball', name: 'Pickleball', icon: 'tennisball-outline', defaultFormat: 'singles', allowed: ['singles', 'doubles'] },
        { id: 'chess', name: 'Chess', icon: 'grid-outline', defaultFormat: 'singles', allowed: ['singles'] },
    ];

    const getRules = (sportName, type = 'standard') => {
        const sportRules = rulesPresets[sportName] || rulesPresets.default;
        return sportRules[type];
    };

    const handleSportSelect = (sport) => {
        const scheduler = schedulerPresets[sport.name] || { schedule: 'Single Elimination', metric: 'Points' };
        setFormData({
            ...formData,
            sport: sport.name,
            format: sport.defaultFormat,
            rules: getRules(sport.name, 'standard'),
            scheduleType: scheduler.schedule,
            scoringMetric: scheduler.metric
        });
    };

    const isFormatAllowed = (formatType) => {
        if (!formData.sport) return true;
        const currentSport = categories.find(c => c.name === formData.sport);
        return currentSport ? currentSport.allowed.includes(formatType) : true;
    };



    const handlePickerPress = (field, mode = 'date') => {
        setPickerField(field);
        setPickerMode(mode);
        setShowPicker(true);
    };

    const onDateChange = (event, selectedValue) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedValue) {
            if (pickerMode === 'date') {
                const day = String(selectedValue.getDate()).padStart(2, '0');
                const month = String(selectedValue.getMonth() + 1).padStart(2, '0');
                const year = selectedValue.getFullYear();
                setFormData({ ...formData, [pickerField]: `${day}/${month}/${year}` });
            } else {
                const hours = String(selectedValue.getHours()).padStart(2, '0');
                const minutes = String(selectedValue.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const formattedHours = hours % 12 || 12;
                setFormData({ ...formData, [pickerField]: `${formattedHours}:${minutes} ${ampm}` });
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setFormData({ ...formData, bannerImage: result.assets[0].uri });
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FFF', '#F8F9FA', '#F1F5F9']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create New Tournament</Text>
                    <View style={{ width: 40 }} />
                </View>



                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Banner Upload */}
                        <TouchableOpacity style={styles.bannerUpload} onPress={pickImage}>
                            {formData.bannerImage ? (
                                <>
                                    <Image source={{ uri: formData.bannerImage }} style={styles.bannerImage} />
                                    <View style={styles.editBannerBadge}>
                                        <Ionicons name="camera" size={20} color="#FFF" />
                                    </View>
                                </>
                            ) : (
                                <View style={styles.bannerPlaceholder}>
                                    <View style={styles.uploadIconCircle}>
                                        <Ionicons name="image-outline" size={32} color={colors.primary} />
                                    </View>
                                    <Text style={styles.uploadText}>Upload Tournament Banner</Text>
                                    <Text style={styles.uploadSubtext}>Recommended: 16:9 ratio</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Tournament Details</Text>
                        <Text style={styles.sectionSubtitle}>Fill in the essential information to launch your event.</Text>

                        {/* Sport Selection */}
                        <Text style={styles.inputLabel}>Select Sport</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        formData.sport === cat.name && styles.categoryCardSelected
                                    ]}
                                    onPress={() => handleSportSelect(cat)}
                                >
                                    <View style={[
                                        styles.categoryIcon,
                                        formData.sport === cat.name && { backgroundColor: 'rgba(255,255,255,0.2)' }
                                    ]}>
                                        <Ionicons
                                            name={cat.icon}
                                            size={24}
                                            color={formData.sport === cat.name ? '#FFF' : colors.primary}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.categoryName,
                                        formData.sport === cat.name && { color: '#FFF' }
                                    ]}>{cat.name}</Text>
                                    {formData.sport === cat.name && (
                                        <View style={styles.checkIcon}>
                                            <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Format Selection */}
                        <Text style={styles.inputLabel}>Participation Format</Text>
                        <View style={styles.formatContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.formatBtn,
                                    formData.format === 'singles' && styles.formatBtnActive,
                                    !isFormatAllowed('singles') && styles.formatBtnDisabled
                                ]}
                                onPress={() => isFormatAllowed('singles') && setFormData({ ...formData, format: 'singles' })}
                                disabled={!isFormatAllowed('singles')}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={18}
                                    color={!isFormatAllowed('singles') ? '#CBD5E1' : formData.format === 'singles' ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.formatText,
                                    formData.format === 'singles' && styles.formatTextActive,
                                    !isFormatAllowed('singles') && { color: '#CBD5E1' }
                                ]}>Singles</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.formatBtn,
                                    formData.format === 'doubles' && styles.formatBtnActive,
                                    !isFormatAllowed('doubles') && styles.formatBtnDisabled
                                ]}
                                onPress={() => isFormatAllowed('doubles') && setFormData({ ...formData, format: 'doubles' })}
                                disabled={!isFormatAllowed('doubles')}
                            >
                                <Ionicons
                                    name="people-outline"
                                    size={18}
                                    color={!isFormatAllowed('doubles') ? '#CBD5E1' : formData.format === 'doubles' ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.formatText,
                                    formData.format === 'doubles' && styles.formatTextActive,
                                    !isFormatAllowed('doubles') && { color: '#CBD5E1' }
                                ]}>Doubles</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.formatBtn,
                                    formData.format === 'team' && styles.formatBtnActive,
                                    !isFormatAllowed('team') && styles.formatBtnDisabled
                                ]}
                                onPress={() => isFormatAllowed('team') && setFormData({ ...formData, format: 'team' })}
                                disabled={!isFormatAllowed('team')}
                            >
                                <Ionicons
                                    name="shirt-outline"
                                    size={18}
                                    color={!isFormatAllowed('team') ? '#CBD5E1' : formData.format === 'team' ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.formatText,
                                    formData.format === 'team' && styles.formatTextActive,
                                    !isFormatAllowed('team') && { color: '#CBD5E1' }
                                ]}>Team</Text>
                            </TouchableOpacity>
                        </View>

                        <InputField
                            label="Tournament Name"
                            placeholder="e.g. Summer Premier League 2024"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            icon="trophy-outline"
                        />

                        <InputField
                            label="Description"
                            placeholder="Tell teams about the format, rules, etc..."
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            icon="document-text-outline"
                            multiline
                        />

                        {/* Smart Scheduler Section */}
                        {formData.sport && schedulerPresets[formData.sport] && (
                            <View style={styles.smartSchedulerContainer}>
                                <View style={styles.smartHeader}>
                                    <Ionicons name="flash" size={16} color="#F59E0B" />
                                    <Text style={styles.smartTitle}>Smart Scheduler Suggestions</Text>
                                </View>
                                <View style={styles.smartGrid}>
                                    <View style={styles.smartItem}>
                                        <Text style={styles.smartLabel}>Category</Text>
                                        <Text style={styles.smartValue}>{schedulerPresets[formData.sport].category}</Text>
                                    </View>
                                    <View style={styles.smartItem}>
                                        <Text style={styles.smartLabel}>Best Schedule</Text>
                                        <Text style={styles.smartValue}>{formData.scheduleType}</Text>
                                    </View>
                                    <View style={styles.smartItem}>
                                        <Text style={styles.smartLabel}>Metric</Text>
                                        <Text style={styles.smartValue}>{formData.scoringMetric}</Text>
                                    </View>
                                </View>
                                <View style={styles.smartFooter}>
                                    <Text style={styles.smartHint}>Recommended settings applied automatically for {formData.sport}.</Text>
                                </View>
                            </View>
                        )}

                        {/* Match Schedule Planner */}
                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Match Schedule Planner</Text>
                        <View style={styles.schedulerCard}>
                            <Text style={styles.inputLabel}>Select Match Days</Text>
                            <View style={styles.daysContainer}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[
                                            styles.dayChip,
                                            formData.daysOfWeek.includes(day) && styles.dayChipActive
                                        ]}
                                        onPress={() => {
                                            const newDays = formData.daysOfWeek.includes(day)
                                                ? formData.daysOfWeek.filter(d => d !== day)
                                                : [...formData.daysOfWeek, day];
                                            setFormData({ ...formData, daysOfWeek: newDays });
                                        }}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            formData.daysOfWeek.includes(day) && styles.dayTextActive
                                        ]}>{day}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={[styles.row, { marginTop: 16 }]}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.inputLabel}>Match Duration</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Mins"
                                            value={formData.matchDuration}
                                            onChangeText={(text) => setFormData({ ...formData, matchDuration: text })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.inputLabel}>Schedule Type</Text>
                                    <TouchableOpacity
                                        style={styles.inputWrapper}
                                        onPress={() => setShowSchedulePicker(true)}
                                    >
                                        <Ionicons name="git-branch-outline" size={20} color={colors.primary} />
                                        <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 16 }]}>
                                            {formData.scheduleType}
                                        </Text>
                                        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Format Selection</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                                {[
                                    { id: 'se', name: 'Single Elimination', icon: 'list-outline' },
                                    { id: 'de', name: 'Double Elimination', icon: 'copy-outline' },
                                    { id: 'rr', name: 'Round Robin / Groups', icon: 'grid-outline' },
                                    { id: 'swiss', name: 'Swiss System', icon: 'shuffle-outline' },
                                    { id: 'timed', name: 'Timed Heats', icon: 'stopwatch-outline' }
                                ].map(type => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeChip,
                                            formData.scheduleType === type.name && styles.typeChipActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, scheduleType: type.name })}
                                    >
                                        <Ionicons
                                            name={type.icon}
                                            size={14}
                                            color={formData.scheduleType === type.name ? '#FFF' : colors.primary}
                                        />
                                        <Text style={[
                                            styles.typeText,
                                            formData.scheduleType === type.name && styles.typeTextActive
                                        ]}>{type.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Rules Section */}
                        <View style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={styles.inputLabel}>Rules & Regulations</Text>
                                {formData.sport && (
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            onPress={() => setFormData({ ...formData, rules: getRules(formData.sport, 'basic') })}
                                            style={[styles.smallBtn, { backgroundColor: '#EEF2FF', borderColor: colors.primary }]}
                                        >
                                            <Text style={[styles.smallBtnText, { color: colors.primary }]}>Basic</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setFormData({ ...formData, rules: getRules(formData.sport, 'standard') })}
                                            style={[styles.smallBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                        >
                                            <Text style={[styles.smallBtnText, { color: '#FFF' }]}>Standard</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            <View style={[styles.inputWrapper, { height: 120, alignItems: 'flex-start' }]}>
                                <Ionicons name="book-outline" size={20} color={colors.textSecondary} style={{ marginTop: 12 }} />
                                <TextInput
                                    style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                                    placeholder="Define the rules for your tournament..."
                                    placeholderTextColor="#94A3B8"
                                    value={formData.rules}
                                    onChangeText={(text) => setFormData({ ...formData, rules: text })}
                                    multiline
                                />
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { fontSize: 16, marginTop: 8 }]}>Important Dates</Text>

                        <InputField
                            label="Registration Deadline"
                            placeholder="Last date to apply (DD/MM/YYYY)"
                            value={formData.registrationDeadline}
                            icon="timer-outline"
                            onPress={() => handlePickerPress('registrationDeadline', 'date')}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <InputField
                                    label="Tournament Start"
                                    placeholder="DD/MM/YYYY"
                                    value={formData.startDate}
                                    icon="calendar-outline"
                                    onPress={() => handlePickerPress('startDate', 'date')}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <InputField
                                    label="Start Time"
                                    placeholder="HH:MM AM/PM"
                                    value={formData.startTime}
                                    icon="time-outline"
                                    onPress={() => handlePickerPress('startTime', 'time')}
                                />
                            </View>
                        </View>

                        <InputField
                            label="Tournament End (Estimated)"
                            placeholder="DD/MM/YYYY"
                            value={formData.endDate}
                            icon="flag-outline"
                            onPress={() => handlePickerPress('endDate', 'date')}
                        />

                        {showPicker && (
                            <DateTimePicker
                                value={new Date()}
                                mode={pickerMode}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                is24Hour={false}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        <InputField
                            label="Location / Venue"
                            placeholder="e.g. City Sports Complex, Mumbai"
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                            icon="location-outline"
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Prize & Entry Details</Text>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <InputField
                                    label="Entry Fee (₹)"
                                    placeholder="0"
                                    value={formData.entryFee}
                                    onChangeText={(text) => setFormData({ ...formData, entryFee: text })}
                                    icon="cash-outline"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <InputField
                                    label="Prize Pool (₹)"
                                    placeholder="0"
                                    value={formData.prizePool}
                                    onChangeText={(text) => setFormData({ ...formData, prizePool: text })}
                                    icon="gift-outline"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <InputField
                            label={formData.format === 'team' ? "Max Teams" : "Max Participants"}
                            placeholder={formData.format === 'team' ? "e.g. 16" : "e.g. 32"}
                            value={formData.maxTeams}
                            onChangeText={(text) => setFormData({ ...formData, maxTeams: text })}
                            icon="people-outline"
                            keyboardType="numeric"
                        />

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.createButton} onPress={handlePublish} disabled={loading}>
                            <LinearGradient
                                colors={[colors.primary, '#4F46E5']}
                                style={styles.createButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.createButtonText}>Publish Tournament</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Schedule Type Modal */}
            <Modal
                visible={showSchedulePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSchedulePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSchedulePicker(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Schedule Type</Text>
                            <TouchableOpacity onPress={() => setShowSchedulePicker(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {[
                            { name: 'Single Elimination', desc: 'Classic knockout format' },
                            { name: 'Double Elimination', desc: 'Two losses before elimination' },
                            { name: 'Round Robin / Groups', desc: 'League style - everyone plays everyone' },
                            { name: 'Swiss System', desc: 'Performance-based matching' },
                            { name: 'Timed Heats', desc: 'Best time wins (Racing/Athletics)' }
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.name}
                                style={[
                                    styles.modalOption,
                                    formData.scheduleType === item.name && styles.modalOptionActive
                                ]}
                                onPress={() => {
                                    setFormData({ ...formData, scheduleType: item.name });
                                    setShowSchedulePicker(false);
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[
                                        styles.modalOptionTitle,
                                        formData.scheduleType === item.name && { color: colors.primary }
                                    ]}>{item.name}</Text>
                                    <Text style={styles.modalOptionDesc}>{item.desc}</Text>
                                </View>
                                {formData.scheduleType === item.name && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },

    toggleContainer: { flexDirection: 'row', marginHorizontal: spacing.l, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: spacing.m },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    toggleBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    toggleText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    toggleTextActive: { color: colors.primary, fontWeight: '800' },

    bannerUpload: { height: 180, marginBottom: 24, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' },
    bannerImage: { width: '100%', height: '100%' },
    bannerPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    uploadIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    uploadText: { fontSize: 16, fontWeight: '700', color: colors.text },
    uploadSubtext: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    editBannerBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },

    scrollContent: { padding: spacing.l, paddingBottom: 100, paddingTop: 0 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 },
    sectionSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },

    categoriesScroll: { marginBottom: 24, marginHorizontal: -spacing.l, paddingHorizontal: spacing.l },
    categoryCard: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingRight: 20, backgroundColor: '#FFF', borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    categoryCardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    categoryIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    categoryName: { fontSize: 14, fontWeight: '700', color: colors.text },
    checkIcon: { marginLeft: 8 },

    inputContainer: { marginBottom: 20 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 56 },
    input: { flex: 1, marginLeft: 12, fontSize: 15, color: colors.text, height: '100%' },

    formatContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    formatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12 },
    formatBtnActive: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
    formatBtnDisabled: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' },
    formatText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginLeft: 6 },
    formatTextActive: { color: colors.primary, fontWeight: '700' },

    smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    smallBtnText: { fontSize: 11, fontWeight: '700' },

    row: { flexDirection: 'row' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.l, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    createButton: { borderRadius: 20, overflow: 'hidden', shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    createButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
    createButtonText: { fontSize: 16, fontWeight: '800', color: '#FFF', marginRight: 8 },

    // Smart Scheduler Styles
    smartSchedulerContainer: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    smartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    smartTitle: { fontSize: 13, fontWeight: '800', color: '#B45309', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    smartGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    smartItem: { flex: 1 },
    smartLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
    smartValue: { fontSize: 14, fontWeight: '700', color: colors.text },
    smartFooter: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12 },
    smartHint: { fontSize: 11, color: colors.textSecondary, fontStyle: 'italic' },

    // Scheduler Card Styles
    schedulerCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    daysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    dayChip: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    dayText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    dayTextActive: { color: '#FFF' },

    // Type Chip Styles
    typeChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F8FAFC', marginRight: 10, borderWidth: 1, borderColor: '#F1F5F9', gap: 6 },
    typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    typeText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    typeTextActive: { color: '#FFF' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    modalOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    modalOptionActive: { borderColor: colors.primary, backgroundColor: '#EEF2FF' },
    modalOptionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    modalOptionDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 }
});
