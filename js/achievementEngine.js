// ======================================
// WAC Achievement Engine
// Version 1.1
// ======================================

const AchievementEngine = {

    async getMemberAchievements(memberId) {

        const logs =
            await Database.getLogs();

        const adventures =
            await Database.getAdventures();

        const completed =
            logs
                .filter(log =>
                    log["Member ID"] === memberId &&
                    log["Status"] === "Completed"
                )
                .sort((a,b)=>
                    new Date(a["Completed DateTime"]) -
                    new Date(b["Completed DateTime"])
                );

        const achievements = [];

        //--------------------------------------------------
        // Helper
        //--------------------------------------------------

        function award(id,title,description,icon,date){

            achievements.push({

                id,
                title,
                description,
                icon,
                earned:date

            });

        }

        //--------------------------------------------------
        // Adventure Count
        //--------------------------------------------------

        if (completed.length >= 1)

            award(
                "FIRST",
                "First Adventure",
                "Completed your first WAC adventure.",
                "⭐",
                completed[0]["Completed DateTime"]
            );

        if (completed.length >= 5)

            award(
                "FIVE",
                "Getting Started",
                "Completed five adventures.",
                "🏕️",
                completed[4]["Completed DateTime"]
            );

        if (completed.length >= 10)

            award(
                "TEN",
                "Seasoned Explorer",
                "Completed ten adventures.",
                "🥾",
                completed[9]["Completed DateTime"]
            );

        //--------------------------------------------------
        // Categories
        //--------------------------------------------------

        const totals = {};

        completed.forEach(log=>{

            const adventure =
                adventures.find(a=>

                    a["ID"]===log["Badge ID"]

                );

            if(!adventure) return;

            totals[adventure.Category] =
                (totals[adventure.Category]||0)+1;

        });

        Object.entries(totals).forEach(([category,count])=>{

            if(count>=5){

                award(

                    category,

                    `${category} Specialist`,

                    `Completed ${count} adventures in ${category}.`,

                    "🏆",

                    ""

                );

            }

        });

        return achievements;

    }

};