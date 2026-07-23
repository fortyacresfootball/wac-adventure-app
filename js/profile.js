// ======================================
// WAC Adventure Record
// Version 9.0
// ======================================

(async function () {

    try {

        //--------------------------------------------------
        // Helper Functions
        //--------------------------------------------------

        const setText = (id, value) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value ?? "";

            }

        };

        //--------------------------------------------------
        // Load Members
        //--------------------------------------------------

        const members =
            await Database.getMembers();

        if (!members || members.length === 0) {

            console.error("No members found.");

            return;

        }

        //--------------------------------------------------
        // Selected Member
        //--------------------------------------------------

        const member =
            window.WAC?.selectedMember ||
            members[0];

        const memberId =
            member["Member ID"];

        //--------------------------------------------------
        // Load Member State
        //--------------------------------------------------

        await MemberState.load(memberId);

        const stats =
            MemberState.stats;

        //--------------------------------------------------
        // Load Adventures and Logs
        //--------------------------------------------------

        const adventures =
            await Database.getAdventures();

        const logs =
            await Database.getLogs();

        const completedLogs =
            logs
                .filter(log =>

                    log["Member ID"] === memberId &&
                    log["Status"] === "Completed"

                )
                .sort((a, b) =>

                    new Date(b["Completed DateTime"]) -
                    new Date(a["Completed DateTime"])

                );

        //--------------------------------------------------
        // Member Information
        //--------------------------------------------------

        const displayName =
            member["Display Name"] ||
            `${member["First Name"] || ""} ${member["Last Name"] || ""}`.trim() ||
            "WAC Member";

        setText(
            "profileName",
            displayName
        );

        setText(
            "profileRole",
            member["Role"] || "Member"
        );

        setText(
            "memberSince",
            member["Join Date"]
                ? `Member Since ${member["Join Date"]}`
                : ""
        );

        setText(
            "legacyMemberSince",
            member["Join Date"] || ""
        );

        const profilePhoto =
            document.getElementById("profilePhoto");

        if (
            profilePhoto &&
            member["Profile Photo"] &&
            member["Profile Photo"].trim() !== ""
        ) {

            profilePhoto.src =
                member["Profile Photo"];

        }

        //--------------------------------------------------
        // Main Statistics
        //--------------------------------------------------

        setText(
            "statCompleted",
            stats.completed
        );

        setText(
            "statBadges",
            stats.badges
        );

        setText(
            "statPoints",
            stats.points
        );

        setText(
            "statPercent",
            `${stats.percent}%`
        );

        setText(
            "profileRank",
            stats.rank
        );

        //--------------------------------------------------
        // Level
        //--------------------------------------------------

        const level =
            Math.floor(stats.completed / 5) + 1;

        setText(
            "profileLevel",
            level
        );

        //--------------------------------------------------
        // Rank Progress
        //--------------------------------------------------

        let currentStart = 0;
        let nextLevel = 25;
        let nextRank = "Adventurer";

        switch (stats.rank) {

            case "Adventurer":

                currentStart = 25;
                nextLevel = 50;
                nextRank = "Trail Captain";

                break;

            case "Trail Captain":

                currentStart = 50;
                nextLevel = 75;
                nextRank = "Master Explorer";

                break;

            case "Master Explorer":

                currentStart = 75;
                nextLevel = 100;
                nextRank = "Legend";

                break;

            case "Legend":

                currentStart = 100;
                nextLevel = 100;
                nextRank = "Maximum Rank";

                break;

            default:

                currentStart = 0;
                nextLevel = 25;
                nextRank = "Adventurer";

        }

        const rankPercent =
            nextLevel === currentStart
                ? 100
                : Math.round(
                    (
                        (stats.completed - currentStart) /
                        (nextLevel - currentStart)
                    ) * 100
                );

        const rankProgressBar =
            document.getElementById("rankProgressBar");

        if (rankProgressBar) {

            rankProgressBar.style.width =
                `${Math.max(
                    0,
                    Math.min(rankPercent, 100)
                )}%`;

        }

        setText(
            "rankProgressText",
            nextRank === "Maximum Rank"
                ? "Maximum WAC rank achieved."
                : `${stats.completed} of ${nextLevel} adventures toward ${nextRank}`
        );

        //--------------------------------------------------
        // Next Milestone
        //--------------------------------------------------

        setText(
            "nextMilestone",
            nextRank
        );

        setText(
            "nextMilestoneText",
            nextRank === "Maximum Rank"
                ? "You have reached the highest WAC rank."
                : `Complete ${nextLevel} adventures to reach ${nextRank}.`
        );

        //--------------------------------------------------
        // Current Objective
        //--------------------------------------------------

        setText(
            "currentObjectiveTitle",
            "Continue Your Adventure"
        );

        setText(
            "currentObjectiveText",
            nextRank === "Maximum Rank"
                ? "Keep building your WAC legacy."
                : `Complete ${Math.max(
                    0,
                    nextLevel - stats.completed
                )} more adventure(s) to reach ${nextRank}.`
        );

        //--------------------------------------------------
        // Recent Adventures
        //--------------------------------------------------

        const recentContainer =
            document.getElementById("recentActivity");

        if (recentContainer && completedLogs.length > 0) {

            recentContainer.innerHTML = "";

            completedLogs
                .slice(0, 10)
                .forEach(log => {

                    const adventure =
                        adventures.find(item =>

                            item["ID"] ===
                            log["Badge ID"]

                        );

                    if (!adventure) return;

                    recentContainer.innerHTML +=
                        UI.timelineItem(
                            log,
                            adventure
                        );

                });

        }

        //--------------------------------------------------
        // Category Totals
        //--------------------------------------------------

        const categoryTotals = {};

        completedLogs.forEach(log => {

            const adventure =
                adventures.find(item =>

                    item["ID"] ===
                    log["Badge ID"]

                );

            if (!adventure) return;

            const categoryName =
                adventure["Category"] || "Other";

            categoryTotals[categoryName] =
                (categoryTotals[categoryName] || 0) + 1;

        });
               //--------------------------------------------------
        // Category Progress
        //--------------------------------------------------

        const categoryContainer =
            document.getElementById("categoryProgress");

        if (
            categoryContainer &&
            Object.keys(categoryTotals).length > 0
        ) {

            categoryContainer.innerHTML = "";

            Object.entries(categoryTotals)
                .sort((a,b)=>b[1]-a[1])
                .forEach(([category,count])=>{

                    categoryContainer.innerHTML += `

                        <div class="category-progress-row">

                            <div class="category-name">

                                ${category}

                            </div>

                            <div class="category-bar">

                                <div
                                    class="category-fill"
                                    style="width:${Math.min(count*20,100)}%">

                                </div>

                            </div>

                            <div class="category-count">

                                ${count}

                            </div>

                        </div>

                    `;

                });

        }

        //--------------------------------------------------
        // Favorite Category
        //--------------------------------------------------

        if (Object.keys(categoryTotals).length) {

            const favorite =
                Object.entries(categoryTotals)
                    .sort((a,b)=>b[1]-a[1])[0];

            setText(
                "favoriteCategory",
                favorite[0]
            );

            setText(
                "favoriteCategoryText",
                `${favorite[1]} completed adventure${favorite[1]===1?"":"s"} in this category.`
            );

        }

        //--------------------------------------------------
        // Featured Badges
        //--------------------------------------------------

        const badgeContainer =
            document.getElementById("earnedBadges");

        if (badgeContainer && completedLogs.length) {

            badgeContainer.innerHTML = "";

            completedLogs.forEach(log => {

                const adventure =
                    adventures.find(a=>

                        a["ID"]===log["Badge ID"]

                    );

                if(!adventure) return;

                badgeContainer.innerHTML +=
                    UI.badgeCard(
                        adventure
                    );

            });

        }

        //--------------------------------------------------
        // Achievements
        //--------------------------------------------------

        const achievementList =
            document.getElementById("achievementList");

        if (achievementList) {

            const achievements =
                await AchievementEngine
                    .getMemberAchievements(
                        memberId
                    );

            if (achievements.length) {

                achievementList.innerHTML = "";

                achievements.forEach(item=>{

                    achievementList.innerHTML +=
                        UI.achievementCard(
                            item
                        );

                });

            }

        }

        //--------------------------------------------------
        // Legacy
        //--------------------------------------------------

        setText(
            "legacyCampfires",
            "0"
        );

        setText(
            "legacyFish",
            "0"
        );

        setText(
            "legacyDeer",
            "0"
        );

        //--------------------------------------------------
        // Current Challenges
        //--------------------------------------------------

        const challengeContainer =
            document.getElementById(
                "currentChallenges"
            );

        if (
            challengeContainer &&
            nextRank !== "Maximum Rank"
        ) {

            challengeContainer.innerHTML = `

                <div class="activity-row">

                    Complete
                    <strong>

                        ${
                            Math.max(
                                0,
                                nextLevel -
                                stats.completed
                            )
                        }

                    </strong>

                    more adventure(s)
                    to reach

                    <strong>

                        ${nextRank}

                    </strong>

                </div>

            `;

        }

        //--------------------------------------------------
        // Journal
        //--------------------------------------------------

        const journal =
            document.getElementById(
                "journalEntries"
            );

        if (
            journal &&
            completedLogs.length
        ) {

            journal.innerHTML = `

                <div class="activity-row">

                    Your adventure story has begun.

                    You have completed

                    <strong>

                        ${stats.completed}

                    </strong>

                    adventure${stats.completed===1?"":"s"}.

                </div>

            `;

        }

        //--------------------------------------------------
        // Recommendation
        //--------------------------------------------------

        if (
            typeof RecommendationEngine !==
            "undefined"
        ) {

            const recommendation =
                await RecommendationEngine
                    .getRecommendation(
                        memberId
                    );

            if (
                recommendation &&
                document.getElementById(
                    "recommendedTitle"
                )
            ) {

                setText(
                    "recommendedTitle",
                    recommendation.Title
                );

                setText(
                    "recommendedDescription",
                    recommendation["Mission"]
                );

                setText(
                    "recommendedCategory",
                    recommendation.Category
                );

                const button =
                    document.getElementById(
                        "recommendedButton"
                    );

                if (button) {

                    button.onclick = () =>

                        Drawer.open(
                            recommendation
                        );

                }

            }

        }

        console.log(
            "Adventure Record Loaded",
            member,
            stats
        );

    }

    catch (err) {

        console.error(
            "Profile Error:",
            err
        );

    }

})(); 