// ======================================
// WAC Member State
// Version 3.0
// Authenticated Member or Guest Mode
// ======================================

const MemberState = {

    currentMember: null,
    stats: null,
    completed: [],

    //--------------------------------------------------
    // Load One Member's Progress
    //--------------------------------------------------

    async load(memberId) {

        const cleanMemberId =
            String(
                memberId || ""
            ).trim();

        //--------------------------------------------------
        // No Member = Guest Mode
        //--------------------------------------------------

        if (!cleanMemberId) {

            this.clear();

            return;

        }

        this.currentMember =
            cleanMemberId;

        this.stats =
            await ProgressEngine.getMemberStats(
                cleanMemberId
            );

        const logs =
            await Database.getLogs();

        this.completed =
            logs
                .filter((log) => {

                    return (

                        String(
                            log["Member ID"] || ""
                        ).trim() ===
                            cleanMemberId &&

                        String(
                            log.Status || ""
                        ).trim().toLowerCase() ===
                            "completed"

                    );

                })
                .map((log) => {

                    return String(
                        log["Badge ID"] || ""
                    ).trim();

                })
                .filter(Boolean);

    },

    //--------------------------------------------------
    // Clear All Personal Progress
    //--------------------------------------------------

    clear() {

        this.currentMember =
            null;

        this.stats =
            null;

        this.completed =
            [];

    },

    //--------------------------------------------------
    // Completion Status
    //--------------------------------------------------

    isCompleted(adventureId) {

        const cleanAdventureId =
            String(
                adventureId || ""
            ).trim();

        if (
            !this.currentMember ||
            !cleanAdventureId
        ) {

            return false;

        }

        return this.completed.includes(
            cleanAdventureId
        );

    }

};