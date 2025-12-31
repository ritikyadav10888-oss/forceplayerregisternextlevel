import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

import PlayerDashboard from '../screens/Player/PlayerDashboard';
import EditProfileScreen from '../screens/Player/EditProfileScreen';
import PlayerTournamentsScreen from '../screens/Player/PlayerTournamentsScreen';
import TournamentDetailsScreen from '../screens/Player/TournamentDetailsScreen';
import TournamentRegistrationScreen from '../screens/Player/TournamentRegistrationScreen';
import PlayerSettingsScreen from '../screens/Player/PlayerSettingsScreen';
import MyTeamScreen from '../screens/Player/MyTeamScreen';
import StatisticsScreen from '../screens/Player/StatisticsScreen';
import HelpCenterScreen from '../screens/Player/HelpCenterScreen';
import RateUsScreen from '../screens/Player/RateUsScreen';
import PrivacySecurityScreen from '../screens/Player/PrivacySecurityScreen';
import ChangePasswordScreen from '../screens/Player/ChangePasswordScreen';
import AboutScreen from '../screens/Player/AboutScreen';
import AnnouncementsScreen from '../screens/Player/AnnouncementsScreen';
import TermsScreen from '../screens/Player/TermsScreen';
import PrivacyPolicyScreen from '../screens/Player/PrivacyPolicyScreen';
import OrganizerDashboard from '../screens/Organizer/OrganizerDashboard';
import CreateTournamentScreen from '../screens/Organizer/CreateTournamentScreen';
import EditTournamentScreen from '../screens/Organizer/EditTournamentScreen';
import ManageTeamsScreen from '../screens/Organizer/ManageTeamsScreen';
import ScheduleMatchesScreen from '../screens/Organizer/ScheduleMatchesScreen';
import OrganizerSettingsScreen from '../screens/Organizer/OrganizerSettingsScreen';
import OwnerDashboard from '../screens/Owner/OwnerDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { user, userData, loading } = useAuth();

    // Show loading while checking auth state
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // Show loading while userData is being fetched for authenticated users
    if (user && !userData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    <>
                        {userData?.role === 'player' && (
                            <>
                                <Stack.Screen name="PlayerDashboard" component={PlayerDashboard} />
                                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                                <Stack.Screen name="PlayerTournaments" component={PlayerTournamentsScreen} />
                                <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} />
                                <Stack.Screen name="TournamentRegistration" component={TournamentRegistrationScreen} />
                                <Stack.Screen name="PlayerSettings" component={PlayerSettingsScreen} />
                                <Stack.Screen name="MyTeam" component={MyTeamScreen} />
                                <Stack.Screen name="Statistics" component={StatisticsScreen} />
                                <Stack.Screen name="RateUs" component={RateUsScreen} />
                                <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                            </>
                        )}

                        {userData?.role === 'organizer' && (
                            <>
                                <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboard} />
                                <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
                                <Stack.Screen name="EditTournament" component={EditTournamentScreen} />
                                <Stack.Screen name="ManageTeams" component={ManageTeamsScreen} />
                                <Stack.Screen name="ScheduleMatches" component={ScheduleMatchesScreen} />
                                <Stack.Screen name="OrganizerSettings" component={OrganizerSettingsScreen} />
                            </>
                        )}

                        {userData?.role === 'owner' && (
                            <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} />
                        )}

                        {/* Common Support & Legal Screens shared by all roles */}
                        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
                        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                        <Stack.Screen name="Terms" component={TermsScreen} />
                        <Stack.Screen name="About" component={AboutScreen} />
                        <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
