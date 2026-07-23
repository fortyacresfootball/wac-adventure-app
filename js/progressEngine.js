// ======================================
// WAC Progress Engine
// Version 3.0
// ======================================

const ProgressEngine = {

    async getMemberStats(memberId) {

        //--------------------------------------------------
        // Load Data
        //--------------------------------------------------

        const adventures =
            await Database.getAdventures();

        const logs =
            await Database.getLogs();

        //--------------------------------------------------
        // Completed Adventures
        //--------------------------------------------------

        const completedLogs = logs.filter(log =>

            log["Member ID"] === memberId &&
            log["Status"] === "Completed"

        );

        const completed = completedLogs.length;

        //--------------------------------------------------
        // Total Adventures
        //--------------------------------------------------

        const total = adventures.length;

        //--------------------------------------------------
        // Completion %
        //--------------------------------------------------

        const percent =
            total === 0
                ? 0
                : Math.round((completed / total) * 100);

        //--------------------------------------------------
        // Points
        //--------------------------------------------------

        let points = 0;

        completedLogs.forEach(log => {

            const adventure = adventures.find(a =>

                a["ID"] === log["Badge ID"]

            );

            if (!adventure) return;

            points += Number(

                adventure["Points"] || 100

            );

        });

        //--------------------------------------------------
        // Rank
        //--------------------------------------------------

        let rank = "Explorer";

        if (completed >= 100)
            rank = "Legend";

        else if (completed >= 75)
            rank = "Master Explorer";

        else if (completed >= 50)
            rank = "Trail Captain";

        else if (completed >= 25)
            rank = "Adventurer";

        //--------------------------------------------------
        // Return
        //--------------------------------------------------

        return {

            completed,
            badges: completed,
            total,
            percent,
            points,
            rank

        };

    }

};