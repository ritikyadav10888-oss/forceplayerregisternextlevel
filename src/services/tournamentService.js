import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getCountFromServer,
    getDocs,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    increment
} from 'firebase/firestore';

export const createTournament = async (tournamentData, organizerId) => {
    try {
        const docRef = await addDoc(collection(db, 'tournaments'), {
            ...tournamentData,
            organizerId,
            createdAt: serverTimestamp(),
            status: 'upcoming',
            teamsRegistered: 0
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating tournament: ", error);
        throw error;
    }
};

export const getTournamentById = async (tournamentId) => {
    try {
        const docRef = doc(db, 'tournaments', tournamentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching tournament:", error);
        throw error;
    }
};

export const updateTournament = async (tournamentId, updateData) => {
    try {
        const docRef = doc(db, 'tournaments', tournamentId);
        await updateDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating tournament:", error);
        throw error;
    }
};

export const deleteTournament = async (tournamentId) => {
    try {
        const docRef = doc(db, 'tournaments', tournamentId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting tournament:", error);
        throw error;
    }
};

export const getAllTournaments = async (sportFilter = 'All') => {
    try {
        let q;
        if (sportFilter === 'All') {
            q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            // Filter by sport but avoid orderBy in query to prevent index requirement
            q = query(
                collection(db, 'tournaments'),
                where('sport', '==', sportFilter)
            );
            const snapshot = await getDocs(q);
            const tournaments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort in-memory by createdAt descending
            return tournaments.sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
                const timeB = b.createdAt?.toMillis?.() || (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
                return timeB - timeA;
            });
        }
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        return [];
    }
};

export const checkTournamentStatus = (tournament) => {
    if (!tournament) return { open: false, reason: 'Invalid Tournament', status: 'unknown' };

    const now = new Date();
    // Assuming format is DD/MM/YYYY
    const [day, month, year] = tournament.registrationDeadline.split('/');
    const deadlineDate = new Date(year, month - 1, day, 23, 59, 59);

    const maxParticipants = parseInt(tournament.maxParticipants || tournament.maxTeams || 0);
    const registered = tournament.teamsRegistered || 0;

    if (now > deadlineDate) {
        if (registered === 0) {
            return { open: false, reason: 'Cancelled (No enrollments)', status: 'cancelled' };
        }
        return { open: false, reason: 'Registration Closed', status: 'closed' };
    }

    if (registered >= maxParticipants && maxParticipants > 0) {
        return { open: false, reason: 'Registration Full', status: 'full' };
    }

    return { open: true, reason: 'Open', status: tournament.status || 'upcoming' };
};

export const registerForTournament = async (tournamentId, userId, registrationData) => {
    try {
        // First check if tournament is still open
        const tournament = await getTournamentById(tournamentId);
        const status = checkTournamentStatus(tournament);

        if (!status.open) {
            throw new Error(status.reason);
        }

        const regId = `REG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Add registration document
        await addDoc(collection(db, 'registrations'), {
            tournamentId,
            userId,
            registrationId: regId,
            ...registrationData,
            status: 'pending',
            registeredAt: serverTimestamp()
        });

        // Update tournament counts
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        await updateDoc(tournamentRef, {
            teamsRegistered: increment(1)
        });

        return regId;
    } catch (error) {
        console.error("Error registering for tournament:", error);
        throw error;
    }
};

export const getOrganizerTournaments = async (organizerId) => {
    try {
        const q = query(
            collection(db, 'tournaments'),
            where('organizerId', '==', organizerId)
        );
        const snapshot = await getDocs(q);
        const tournaments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in-memory to avoid composite index requirement
        return tournaments.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA; // Descending
        });
    } catch (error) {
        console.error("Error fetching organizer tournaments:", error);
        return [];
    }
};

export const getTournamentRegistrations = async (tournamentId) => {
    try {
        const q = query(
            collection(db, 'registrations'),
            where('tournamentId', '==', tournamentId),
            where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching tournament registrations:", error);
        return [];
    }
};

export const scheduleMatch = async (matchData) => {
    try {
        const docRef = await addDoc(collection(db, 'matches'), {
            ...matchData,
            createdAt: serverTimestamp(),
            status: matchData.status || 'Scheduled'
        });
        return docRef.id;
    } catch (error) {
        console.error("Error scheduling match:", error);
        throw error;
    }
};

export const getTournamentMatches = async (tournamentId) => {
    try {
        const q = query(
            collection(db, 'matches'),
            where('tournamentId', '==', tournamentId)
        );
        const snapshot = await getDocs(q);
        const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in-memory to avoid composite index requirement
        return matches.sort((a, b) => {
            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }
            return a.time.localeCompare(b.time);
        });
    } catch (error) {
        console.error("Error fetching matches:", error);
        return [];
    }
};

export const updateMatchStatus = async (matchId, status) => {
    try {
        const matchRef = doc(db, 'matches', matchId);
        await updateDoc(matchRef, { status });
    } catch (error) {
        console.error("Error updating match status:", error);
        throw error;
    }
};

export const updateMatchResult = async (matchId, resultData) => {
    try {
        const matchRef = doc(db, 'matches', matchId);
        await updateDoc(matchRef, {
            ...resultData,
            status: 'Completed',
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating match result:", error);
        throw error;
    }
};

export const getOrganizerStats = async (organizerId) => {
    try {
        // Get all tournaments for this organizer
        const tourneyQ = query(collection(db, 'tournaments'), where('organizerId', '==', organizerId));
        const tourneySnap = await getDocs(tourneyQ);
        const tourneyIds = tourneySnap.docs.map(doc => doc.id);

        if (tourneyIds.length === 0) {
            return { activeTournaments: 0, totalTeams: 0, pendingRequests: 0 };
        }

        // Get registrations for these tournaments
        const regQ = query(collection(db, 'registrations'), where('tournamentId', 'in', tourneyIds));
        const regSnap = await getDocs(regQ);
        const allRegs = regSnap.docs.map(doc => doc.data());

        return {
            activeTournaments: tourneyIds.length,
            totalTeams: allRegs.filter(r => r.status === 'approved').length,
            pendingRequests: allRegs.filter(r => r.status === 'pending').length
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { activeTournaments: 0, totalTeams: 0, pendingRequests: 0 };
    }
};

export const getOrganizerActivities = async (organizerId) => {
    try {
        // 1. Fetch recent tournaments
        const tourneyQ = query(
            collection(db, 'tournaments'),
            where('organizerId', '==', organizerId)
        );
        const tourneySnap = await getDocs(tourneyQ);
        const tournaments = tourneySnap.docs.map(doc => ({
            id: doc.id,
            type: 'tournament_created',
            title: doc.data().title,
            timestamp: doc.data().createdAt?.toDate() || new Date(0)
        }));

        // 2. Fetch recent registrations
        const tourneyIds = tourneySnap.docs.map(doc => doc.id);
        let registrations = [];
        if (tourneyIds.length > 0) {
            const regQ = query(
                collection(db, 'registrations'),
                where('tournamentId', 'in', tourneyIds)
            );
            const regSnap = await getDocs(regQ);
            registrations = regSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'registration_received',
                    playerName: data.playerName,
                    tournamentTitle: data.tournamentTitle,
                    status: data.status,
                    timestamp: data.registeredAt?.toDate() || new Date(0)
                };
            });
        }

        // Merge and sort in-memory to avoid index issues
        return [...tournaments, ...registrations]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
    }
};

export const getOrganizerRegistrations = async (organizerId, status = 'pending') => {
    try {
        // First get all tournaments for this organizer
        const tourneyQ = query(collection(db, 'tournaments'), where('organizerId', '==', organizerId));
        const tourneySnap = await getDocs(tourneyQ);
        const tourneyIds = tourneySnap.docs.map(doc => doc.id);

        if (tourneyIds.length === 0) return [];

        // Fetch registrations for these tournaments
        // Note: Firestore 'in' query limited to 10 items. For more, we'd need multiple queries or a different schema.
        // For now, fetching all registrations and filtering in-memory if needed, or using chunks.
        const regQ = query(
            collection(db, 'registrations'),
            where('status', '==', status)
        );
        const regSnap = await getDocs(regQ);

        return regSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(reg => tourneyIds.includes(reg.tournamentId))
            .sort((a, b) => (b.registeredAt?.toDate?.() || 0) - (a.registeredAt?.toDate?.() || 0));
    } catch (error) {
        console.error("Error fetching organizer registrations:", error);
        return [];
    }
};

export const getUserRegistrations = async (userId) => {
    try {
        const q = query(
            collection(db, 'registrations'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching user registrations:", error);
        return [];
    }
};

export const schedulePractice = async (practiceData) => {
    try {
        const docRef = await addDoc(collection(db, 'practices'), {
            ...practiceData,
            createdAt: serverTimestamp(),
            status: 'Scheduled'
        });
        return docRef.id;
    } catch (error) {
        console.error("Error scheduling practice:", error);
        throw error;
    }
};

export const getTeamPractices = async (teamId) => {
    try {
        const q = query(
            collection(db, 'practices'),
            where('teamId', '==', teamId)
        );
        const snapshot = await getDocs(q);
        const practices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in-memory to avoid composite index requirement
        return practices.sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            return dateA.localeCompare(dateB);
        });
    } catch (error) {
        console.error("Error fetching practices:", error);
        return [];
    }
};

export const updateRegistrationStatus = async (registrationId, status) => {
    try {
        const regRef = doc(db, 'registrations', registrationId);
        await updateDoc(regRef, { status });
        return true;
    } catch (error) {
        console.error("Error updating registration:", error);
        throw error;
    }
};

export const deleteRegistration = async (registrationId) => {
    try {
        const regRef = doc(db, 'registrations', registrationId);
        await deleteDoc(regRef);
        return true;
    } catch (error) {
        console.error("Error deleting registration:", error);
        throw error;
    }
};

export const updateRegistration = async (registrationId, updateData) => {
    try {
        const regRef = doc(db, 'registrations', registrationId);
        await updateDoc(regRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating registration:", error);
        throw error;
    }
};

export const getPlayerStats = async (userId) => {
    try {
        // Fetch all registrations for the user
        const regQ = query(collection(db, 'registrations'), where('userId', '==', userId), where('status', '==', 'approved'));
        const regSnap = await getDocs(regQ);
        const registrations = regSnap.docs.map(doc => doc.data());

        // Fetch matches where the user participated (assuming players are matched by userId or teamId)
        // For simplicity, let's fetch matches for tournaments the player is in
        const tourneyIds = registrations.map(r => r.tournamentId);

        let matchesPlayed = 0;
        let wins = 0;
        let rating = 0;
        let recentResults = [];

        if (tourneyIds.length > 0) {
            // Fetch completed matches for these tournaments
            const matchQ = query(
                collection(db, 'matches'),
                where('tournamentId', 'in', tourneyIds.slice(0, 10)),
                where('status', '==', 'Completed')
            );
            const matchSnap = await getDocs(matchQ);
            const matches = matchSnap.docs.map(doc => doc.data());

            matchesPlayed = matches.length;

            // Calculate wins and form
            const form = [];
            // Sort by createdAt or updatedAt to get newest first
            const sortedMatches = [...matches].sort((a, b) =>
                (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0)
            );

            sortedMatches.slice(0, 5).forEach(match => {
                const userReg = registrations.find(r => r.tournamentId === match.tournamentId);
                const userTeam = userReg?.teamName;

                if (match.winnerTeam === userTeam && userTeam) {
                    wins++;
                    form.push('W');
                } else if (match.winnerTeam === 'Draw') {
                    form.push('D');
                } else if (match.winnerTeam) {
                    form.push('L');
                }
            });

            recentResults = form.reverse(); // Standard [Old -> New] display

            // Calculate a dynamic rating
            rating = 5.0 + (wins * 0.5) - ((matchesPlayed - wins) * 0.2);
            rating = Math.min(Math.max(rating, 0), 10).toFixed(1);
        }

        return {
            overallRating: rating || "0.0",
            matchesPlayed: matchesPlayed,
            tournamentsJoined: registrations.length,
            winRate: matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0,
            recentResults: recentResults.length > 0 ? recentResults : ['-', '-', '-', '-', '-'],
            sportStats: {
                cricket: { runs: 0, wickets: 0, strRate: 0, economy: 0 },
                football: { goals: 0, assists: 0 },
                badminton: { setsWon: 0, setsLost: 0 }
            }
        };
    } catch (error) {
        console.error("Error fetching player stats:", error);
        return null;
    }
};
