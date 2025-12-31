import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Image,
    Alert,
    useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../styles/spacing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const InputField = React.memo(({ icon, placeholder, value, onChangeText, style, rightIcon, onRightIconPress, theme, isDarkMode, ...props }) => (
    <View style={[
        styles.inputWrapper,
        props.half && { flex: 0.48 },
        props.multiline && { alignItems: 'flex-start', paddingVertical: 12 },
        { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }
    ]}>
        <View style={[styles.iconContainer, props.multiline && { marginTop: 2 }]}>
            <Ionicons name={icon} size={18} color={theme.primary} />
        </View>
        <TextInput
            style={[styles.input, { color: theme.text }, style, props.multiline && { height: 80, textAlignVertical: 'top', paddingTop: 0 }]}
            placeholder={placeholder}
            placeholderTextColor={theme.textLight}
            value={value}
            onChangeText={onChangeText}
            {...props}
        />
        {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress} style={{ padding: 4 }}>
                <Ionicons name={rightIcon} size={20} color={theme.primary} />
            </TouchableOpacity>
        )}
    </View>
));

export default function RegisterScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const { width: windowWidth } = useWindowDimensions();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [aadharNumber, setAadharNumber] = useState('');
    const [aadharImage, setAadharImage] = useState(null);
    const [aadharBase64, setAadharBase64] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { register } = useAuth();

    const onBack = useCallback(() => navigation.navigate('Login'), [navigation]);

    const onDateChange = useCallback((event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            setDob(selectedDate.toLocaleDateString('en-GB'));
            const ageVal = new Date().getFullYear() - selectedDate.getFullYear();
            setAge(ageVal.toString());
        }
    }, []);

    const pickImage = useCallback(async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.2,
            base64: true,
        });
        if (!result.canceled) {
            setAadharImage(result.assets[0].uri);
            setAadharBase64(result.assets[0].base64);
        }
    }, []);

    const getLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to autofill your address.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const place = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (place && place.length > 0) {
                const p = place[0];
                const formattedAddress = `${p.street || ''} ${p.name || ''}, ${p.city || ''}, ${p.region || ''} ${p.postalCode || ''}, ${p.country || ''}`;
                const cleanAddress = formattedAddress.replace(/ ,/g, '').replace(/  +/g, ' ').trim();
                setAddress(cleanAddress);
            }
        } catch (error) {
            Alert.alert('Location Error', 'Could not fetch location.');
        }
    }, []);

    const validateForm = () => {
        if (!fullName.trim()) return "Full Name is required.";
        if (!email.trim()) return "Email is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return "Valid email is required.";
        if (!password) return "Password is required.";
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) return "Password must be at least 8 chars and include Uppercase, Lowercase, Number & Special Character.";
        if (!phoneNumber.trim() || phoneNumber.length !== 10) return "Valid Phone Number (10 digits) is required.";
        if (!address.trim()) return "Address is required.";
        if (!dob) return "Date of Birth is required.";
        if (!gender) return "Gender is required.";
        if (!height.trim()) return "Height is required.";
        if (!weight.trim()) return "Weight is required.";
        if (!aadharNumber.trim() || aadharNumber.length !== 12) return "Valid Aadhaar (12 digits) is required.";
        if (!aadharImage) return "Aadhaar Photo is required.";
        return null;
    };

    const handleRegister = useCallback(async () => {
        const error = validateForm();
        if (error) {
            Alert.alert('Missing Details', error);
            return;
        }

        setLoading(true);
        try {
            let photoData = '';
            if (aadharBase64) {
                photoData = `data:image/jpeg;base64,${aadharBase64}`;
            }

            await register(email.toLowerCase().trim(), password, 'player', {
                displayName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                address: address.trim(),
                dob,
                gender,
                age,
                height: height.trim(),
                weight: weight.trim(),
                aadharNumber: aadharNumber.trim(),
                aadharPhotoURL: photoData
            });

            Alert.alert('Success', 'Account created successfully!');
            navigation.navigate('Login');
        } catch (e) {
            Alert.alert('Registration Failed', e.message);
        } finally {
            setLoading(false);
        }
    }, [fullName, email, password, phoneNumber, address, dob, gender, age, height, weight, aadharNumber, aadharImage, aadharBase64, register, navigation]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradients.primary} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: theme.card }]}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={styles.branding}>
                            <Text style={[styles.brandingTitle, { color: theme.text }]}>Join Force Player</Text>
                            <Text style={[styles.brandingSubtitle, { color: theme.textSecondary }]}>Complete your player profile</Text>
                        </View>

                        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 0 }]}>
                            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Account Details</Text>
                            <InputField icon="person-outline" placeholder="Full Name" value={fullName} onChangeText={setFullName} theme={theme} isDarkMode={isDarkMode} />
                            <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" theme={theme} isDarkMode={isDarkMode} />
                            <InputField
                                icon="lock-closed-outline"
                                placeholder="Strong Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                theme={theme}
                                isDarkMode={isDarkMode}
                                rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                            />
                            <InputField icon="call-outline" placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" maxLength={10} theme={theme} isDarkMode={isDarkMode} />
                            <InputField
                                icon="location-outline"
                                placeholder="Address"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={3}
                                rightIcon="locate"
                                onRightIconPress={getLocation}
                                theme={theme}
                                isDarkMode={isDarkMode}
                            />
                        </View>

                        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 0 }]}>
                            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Personal Stats & ID</Text>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    style={[styles.inputWrapper, { flex: 0.48, height: 50, backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC', borderColor: theme.border }]}
                                >
                                    <Ionicons name="calendar-outline" size={18} color={theme.primary} style={{ marginRight: 8 }} />
                                    <Text style={{ color: dob ? theme.text : theme.textLight, fontWeight: '600' }}>{dob || "Birthday"}</Text>
                                </TouchableOpacity>
                                <InputField icon="hourglass-outline" placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" half theme={theme} isDarkMode={isDarkMode} />
                            </View>

                            <View style={styles.genderContainer}>
                                {['Male', 'Female', 'Other'].map(opt => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[
                                            styles.genderOption,
                                            { backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC' },
                                            gender === opt && { backgroundColor: theme.primary }
                                        ]}
                                        onPress={() => setGender(opt)}
                                    >
                                        <Text style={[styles.genderText, { color: gender === opt ? '#FFF' : theme.textSecondary }]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.row}>
                                <InputField icon="resize-outline" placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" half theme={theme} isDarkMode={isDarkMode} />
                                <InputField icon="speedometer-outline" placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" half theme={theme} isDarkMode={isDarkMode} />
                            </View>

                            <InputField icon="card-outline" placeholder="Aadhaar (12 digits)" value={aadharNumber} onChangeText={setAadharNumber} keyboardType="numeric" maxLength={12} theme={theme} isDarkMode={isDarkMode} />

                            <TouchableOpacity style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: isDarkMode ? theme.surfaceHighlight : '#F8FAFC' }]} onPress={pickImage}>
                                {aadharImage ? (
                                    <Image source={{ uri: aadharImage }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <View style={{ alignItems: 'center' }}>
                                        <Ionicons name="camera-outline" size={32} color={theme.primary} />
                                        <Text style={{ color: theme.primary, fontWeight: '700', marginTop: 8 }}>Aadhaar Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerButtonText}>Create Account</Text>}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already registered? </Text>
                            <TouchableOpacity onPress={onBack}>
                                <Text style={[styles.loginLink, { color: theme.primary }]}>Login Here</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
                {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.s },
    backButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    logo: { width: 100, height: 50 },

    branding: { alignItems: 'center', marginVertical: spacing.l },
    brandingTitle: { fontSize: 28, fontWeight: '900' },
    brandingSubtitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

    scrollContent: { flexGrow: 1, paddingHorizontal: spacing.l, paddingBottom: spacing.xxl },
    section: { borderRadius: 28, padding: spacing.l, marginBottom: spacing.l, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    sectionHeader: { fontSize: 11, fontWeight: '800', marginBottom: spacing.m, textTransform: 'uppercase', letterSpacing: 1 },

    row: { flexDirection: 'row', justifyContent: 'space-between' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, marginBottom: spacing.s, paddingHorizontal: spacing.m, borderWidth: 1.5 },
    input: { flex: 1, paddingVertical: 12, fontSize: 15, fontWeight: '700' },
    iconContainer: { marginRight: spacing.s },

    genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.s },
    genderOption: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: 'transparent' },
    genderText: { fontWeight: '800', fontSize: 13 },

    uploadBox: { height: 160, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: spacing.s, overflow: 'hidden' },

    registerButton: { borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: spacing.l, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    registerButtonText: { fontSize: 16, fontWeight: '900', color: '#FFF', textTransform: 'uppercase', letterSpacing: 1 },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    footerText: { fontSize: 14, fontWeight: '600' },
    loginLink: { fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' }
});
