import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const InputField = React.memo(({ icon, placeholder, value, onChangeText, style, multiline, onPress, ...props }) => {
    // If onPress is provided, we want the whole container to be touchable
    const ContainerComponent = onPress ? TouchableOpacity : View;

    return (
        <ContainerComponent
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.inputWrapper, props.half && { flex: 0.48 }, multiline && { alignItems: 'flex-start', paddingVertical: 12 }]}
        >
            <View style={[styles.iconContainer, multiline && { marginTop: 2 }]}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <TextInput
                style={[styles.input, style, multiline && { height: 80, textAlignVertical: 'top', paddingTop: 0 }]}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                editable={!onPress} // Disable text editing if it's a button
                pointerEvents={onPress ? 'none' : 'auto'} // Ensure touches go to container if it's a button
                {...props}
            />
            {onPress && <Ionicons name="chevron-down" size={18} color="#94A3B8" />}
        </ContainerComponent>
    );
});

export default function EditProfileScreen({ navigation }) {
    const { user, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    // Form State
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [aadharNumber, setAadhaarNumber] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoBase64, setPhotoBase64] = useState(null);
    const [additionalPhoto, setAdditionalPhoto] = useState(null);
    const [additionalPhotoBase64, setAdditionalPhotoBase64] = useState(null);

    const genderOptions = ['Male', 'Female', 'Other'];

    // Initialize form with existing data
    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || '');
            setPhoneNumber(userData.phoneNumber ? String(userData.phoneNumber) : '');
            setAddress(userData.address || '');
            setHeight(userData.height ? String(userData.height) : '');
            setWeight(userData.weight ? String(userData.weight) : '');
            setAge(userData.age ? String(userData.age) : '');
            setGender(userData.gender || '');
            setDob(userData.dob ? String(userData.dob) : '');
            setAadhaarNumber(userData.aadharNumber ? String(userData.aadharNumber) : '');
            setPhoto(userData.aadharPhotoURL || null);
            setAdditionalPhoto(userData.profilePhotoURL || null);
        }
    }, [userData]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2, // Low quality for Base64 storage
            base64: true,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
            setPhotoBase64(result.assets[0].base64);
        }
    };

    const pickAdditionalImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.2,
            base64: true,
        });

        if (!result.canceled) {
            setAdditionalPhoto(result.assets[0].uri);
            setAdditionalPhotoBase64(result.assets[0].base64);
        }
    };

    const handleSave = async () => {
        if (!user?.uid) {
            Alert.alert('Error', 'User ID is missing.');
            return;
        }

        const safeStr = (val) => String(val || '').trim();

        if (!safeStr(displayName) || !safeStr(phoneNumber)) {
            Alert.alert('Error', 'Name and Phone Number are required.');
            return;
        }

        setLoading(true);
        try {
            const updates = {
                displayName: safeStr(displayName),
                phoneNumber: safeStr(phoneNumber),
                address: safeStr(address),
                height: safeStr(height),
                weight: safeStr(weight),
                age: safeStr(age),
                gender: gender || '', // Gender is selected via picker, keep valid string
                dob: safeStr(dob),
                aadharNumber: safeStr(aadharNumber),
            };

            // Update main profile photo (circular avatar)
            if (photoBase64) {
                updates.aadharPhotoURL = `data:image/jpeg;base64,${photoBase64}`;
            }

            // Update additional identity photo
            if (additionalPhotoBase64) {
                updates.profilePhotoURL = `data:image/jpeg;base64,${additionalPhotoBase64}`;
            }

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, updates);

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FFF', '#F8F9FA']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Avatar Section */}
                        <View style={styles.avatarSection}>
                            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                                {photo ? (
                                    <Image source={{ uri: photo }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarText}>{userData?.displayName?.charAt(0) || 'P'}</Text>
                                    </View>
                                )}
                                <View style={styles.cameraButton}>
                                    <Ionicons name="camera" size={20} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Info</Text>
                            <InputField icon="person-outline" placeholder="Full Name" value={displayName} onChangeText={setDisplayName} />
                            <InputField icon="call-outline" placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
                            <InputField icon="location-outline" placeholder="Address" value={address} onChangeText={setAddress} multiline numberOfLines={3} />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Physical Stats</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <InputField icon="resize-outline" placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" half />
                                <InputField icon="speedometer-outline" placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" half />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <InputField icon="hourglass-outline" placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" half />
                                <InputField
                                    icon="male-female-outline"
                                    placeholder="Gender"
                                    value={gender}
                                    onPress={() => setShowGenderPicker(true)}
                                    half
                                />
                            </View>
                            <InputField icon="calendar-outline" placeholder="Date of Birth (DD/MM/YYYY)" value={dob} onChangeText={setDob} keyboardType="numeric" />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Identity</Text>
                            <InputField icon="card-outline" placeholder="Aadhaar Number" value={aadharNumber} onChangeText={setAadhaarNumber} keyboardType="numeric" maxLength={12} />

                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, marginTop: 4 }}>Aadhaar Card Photo</Text>
                            <TouchableOpacity style={styles.identityPhotoUpload} onPress={pickAdditionalImage}>
                                {additionalPhoto ? (
                                    <Image source={{ uri: additionalPhoto }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                                ) : (
                                    <View style={{ alignItems: 'center' }}>
                                        <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                                        <Text style={{ marginTop: 8, color: colors.primary, fontWeight: '600' }}>Upload Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                    </TouchableOpacity>
                </View>

                {/* Gender Picker Modal */}
                <Modal
                    visible={showGenderPicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowGenderPicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowGenderPicker(false)}
                    >
                        <View style={styles.genderModalContent}>
                            <Text style={styles.modalTitle}>Select Gender</Text>
                            {genderOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.genderOption}
                                    onPress={() => {
                                        setGender(option);
                                        setShowGenderPicker(false);
                                    }}
                                >
                                    <Text style={[styles.genderOptionText, gender === option && styles.genderOptionTextSelected]}>
                                        {option}
                                    </Text>
                                    {gender === option && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.l, paddingVertical: spacing.m },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },

    scrollContent: { paddingHorizontal: spacing.l, paddingBottom: 100 },

    avatarSection: { alignItems: 'center', marginVertical: spacing.xl },
    avatarContainer: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFF', backgroundColor: '#F1F5F9' },
    avatarPlaceholder: { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
    cameraButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
    changePhotoText: { marginTop: spacing.s, color: colors.primary, fontWeight: '700', fontSize: 14 },

    section: { marginBottom: spacing.l },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: spacing.m, textTransform: 'uppercase' },

    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: spacing.m, paddingHorizontal: spacing.m, borderWidth: 1, borderColor: '#E2E8F0' },
    input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.text, fontWeight: '600' },
    iconContainer: { marginRight: spacing.s },

    footer: { padding: spacing.l, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    saveButton: { backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    saveButtonText: { color: '#FFF', fontSize: 17, fontWeight: '900' },

    identityPhotoUpload: { height: 150, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginTop: 4 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    genderModalContent: { width: '80%', backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16, textAlign: 'center' },
    genderOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    genderOptionText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
    genderOptionTextSelected: { color: colors.primary, fontWeight: '800' }
});
