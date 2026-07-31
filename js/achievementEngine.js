// ======================================
// WAC Achievement Engine
// Version 2.0
// Secure Trophy Room Service
// ======================================

const AchievementEngine = {

    //--------------------------------------------------
    // Load Signed-In Member Trophy Room
    //--------------------------------------------------

    async getMemberAchievements(memberId) {

        const requestedMemberId =
            String(
                memberId || ""
            ).trim();

        if (!requestedMemberId) {

            throw new Error(
                "A valid Member ID is required."
            );

        }

        if (
            typeof AuthService === "undefined" ||
            !AuthService.isSignedIn()
        ) {

            return null;

        }

        const currentMember =
            AuthService.getCurrentMember();

        const currentMemberId =
            String(
                currentMember?.["Member ID"] || ""
            ).trim();

        //--------------------------------------------------
        // Achievement records are private to each member.
        //--------------------------------------------------

        if (
            !currentMemberId ||
            currentMemberId !== requestedMemberId
        ) {

            return null;

        }

        if (
            typeof API === "undefined" ||
            typeof API.getMemberAchievements !== "function"
        ) {

            throw new Error(
                "The achievement service is unavailable."
            );

        }

        const result =
            await API.getMemberAchievements();

        return {

            summary:
                result?.summary || {

                    earned: 0,
                    available: 0,
                    locked: 0,
                    achievementPoints: 0

                },

            achievements:
                Array.isArray(
                    result?.achievements
                )
                    ? result.achievements
                    : []

        };

    }

};