// ======================================
// WAC Adventure Record
// Version 10.0
// ======================================

(async function () {

    try {

        //--------------------------------------------------
        // Resolve Selected Member
        //--------------------------------------------------

        const member =
            await resolveProfileMember();

        if (!member) {

            showProfileError(
                "No WAC member could be loaded."
            );

            return;

        }

        const memberId =
            String(
                member["Member ID"] || ""
            ).trim();

        if (!memberId) {

            showProfileError(
                "The selected member does not have a valid Member ID."
            );

            return;

        }

        //--------------------------------------------------
        // Load Profile Data Once
        //--------------------------------------------------

        const [
            adventures,
            logs
        ] = await Promise.all([

            Database.getAdventures(),
            Database.getLogs()

        ]);

        //--------------------------------------------------
        // Build Supporting Maps
        //--------------------------------------------------

        const adventureMap =
            new Map();

        adventures.forEach((adventure) => {

            const adventureId =
                String(
                    adventure["ID"] || ""
                ).trim();

            if (adventureId) {

                adventureMap.set(
                    adventureId,
                    adventure
                );

            }

        });

        //--------------------------------------------------
        // Unique Member Completions
        //--------------------------------------------------

        const completionRecords =
            buildProfileCompletionRecords(

                memberId,
                logs,
                adventureMap

            );

        //--------------------------------------------------
        // Member Statistics
        //--------------------------------------------------

        const stats =
            calculateProfileStats(

                completionRecords,
                adventures.length

            );

        const rankProgress =
            calculateProfileRankProgress(
                stats.badges
            );

        //--------------------------------------------------
        // Render Core Profile
        //--------------------------------------------------

        renderProfileIdentity(
            member,
            stats
        );

        renderProfileStatistics(
            stats
        );

        renderProfileRankProgress(
            stats,
            rankProgress
        );

        renderRecentAdventures(
            completionRecords
        );

        renderBadgeCollection(
            completionRecords
        );

        renderCategoryProgress(
            completionRecords
        );

        //--------------------------------------------------
        // Load Optional Achievements After Core Page
        //--------------------------------------------------
    }

    catch (error) {

        console.error(
            "Profile Error:",
            error
        );

        showProfileError(
            "The Adventure Record could not be loaded."
        );

    }

})();

//--------------------------------------------------
// Resolve Profile Member
//--------------------------------------------------

async function resolveProfileMember() {

    const selectedMember =
        window.WAC?.selectedMember;

    if (
        selectedMember &&
        selectedMember["Member ID"]
    ) {

        return selectedMember;

    }

    //--------------------------------------------------
    // Direct Profile Navigation Fallback
    //--------------------------------------------------

    const members =
        await Database.getMembers();

    if (
        !Array.isArray(members) ||
        members.length === 0
    ) {

        return null;

    }

    const activeMember =
        members.find((member) => {

            return String(
                member["Status"] || ""
            )
                .trim()
                .toLowerCase() === "active";

        });

    const fallbackMember =
        activeMember ||
        members[0];

    window.WAC.selectedMember =
        fallbackMember;

    return fallbackMember;

}

//--------------------------------------------------
// Unique Completion Records
//--------------------------------------------------

function buildProfileCompletionRecords(
    memberId,
    logs,
    adventureMap
) {

    const uniqueRecords =
        new Map();

    logs.forEach((log) => {

        const logMemberId =
            String(
                log["Member ID"] || ""
            ).trim();

        const badgeId =
            String(
                log["Badge ID"] || ""
            ).trim();

        const status =
            String(
                log["Status"] || ""
            )
                .trim()
                .toLowerCase();

        if (
            logMemberId !== memberId ||
            status !== "completed" ||
            !badgeId
        ) {

            return;

        }

        const completionDate =
            parseProfileDate(

                log["Completed DateTime"] ||
                log["Date"]

            );

        const record = {

            badgeId,

            log,

            adventure:
                adventureMap.get(badgeId) ||
                null,

            completionDate

        };

        const existingRecord =
            uniqueRecords.get(
                badgeId
            );

        if (!existingRecord) {

            uniqueRecords.set(
                badgeId,
                record
            );

            return;

        }

        const existingTime =
            existingRecord.completionDate
                ? existingRecord.completionDate.getTime()
                : 0;

        const newTime =
            completionDate
                ? completionDate.getTime()
                : 0;

        if (newTime > existingTime) {

            uniqueRecords.set(
                badgeId,
                record
            );

        }

    });

    return Array.from(
        uniqueRecords.values()
    )
        .sort((firstRecord, secondRecord) => {

            const firstTime =
                firstRecord.completionDate
                    ? firstRecord.completionDate.getTime()
                    : 0;

            const secondTime =
                secondRecord.completionDate
                    ? secondRecord.completionDate.getTime()
                    : 0;

            return secondTime - firstTime;

        });

}

//--------------------------------------------------
// Profile Statistics
//--------------------------------------------------

function calculateProfileStats(
    completionRecords,
    totalAdventures
) {

    const badges =
        completionRecords.length;

    const points =
        completionRecords.reduce(
            (total, record) => {

                const pointValue =
                    Number(
                        record.adventure?.["Points"] ||
                        100
                    );

                return (
                    total +
                    (
                        Number.isFinite(pointValue)
                            ? pointValue
                            : 100
                    )
                );

            },
            0
        );

    const percent =
        totalAdventures > 0
            ? Math.round(
                (
                    badges /
                    totalAdventures
                ) * 100
            )
            : 0;

    return {

        badges,

        points,

        percent,

        totalAdventures,

        rank:
            getProfileRank(badges),

        level:
            Math.floor(
                badges / 5
            ) + 1

    };

}

//--------------------------------------------------
// Profile Rank
//--------------------------------------------------

function getProfileRank(
    completedBadges
) {

    if (completedBadges >= 100) {

        return "Legend";

    }

    if (completedBadges >= 75) {

        return "Master Explorer";

    }

    if (completedBadges >= 50) {

        return "Trail Captain";

    }

    if (completedBadges >= 25) {

        return "Adventurer";

    }

    return "Explorer";

}

//--------------------------------------------------
// Rank Progress
//--------------------------------------------------

function calculateProfileRankProgress(
    completedBadges
) {

    let currentStart = 0;
    let nextTarget = 25;
    let nextRank = "Adventurer";

    if (completedBadges >= 100) {

        currentStart = 100;
        nextTarget = 100;
        nextRank = "Maximum Rank";

    } else if (completedBadges >= 75) {

        currentStart = 75;
        nextTarget = 100;
        nextRank = "Legend";

    } else if (completedBadges >= 50) {

        currentStart = 50;
        nextTarget = 75;
        nextRank = "Master Explorer";

    } else if (completedBadges >= 25) {

        currentStart = 25;
        nextTarget = 50;
        nextRank = "Trail Captain";

    }

    const maximumRank =
        nextRank === "Maximum Rank";

    const percent =
        maximumRank
            ? 100
            : Math.round(
                (
                    (
                        completedBadges -
                        currentStart
                    ) /
                    (
                        nextTarget -
                        currentStart
                    )
                ) * 100
            );

    return {

        currentStart,

        nextTarget,

        nextRank,

        maximumRank,

        percent:
            Math.max(
                0,
                Math.min(
                    percent,
                    100
                )
            ),

        remaining:
            maximumRank
                ? 0
                : Math.max(
                    0,
                    nextTarget -
                    completedBadges
                )

    };

}

//--------------------------------------------------
// Identity
//--------------------------------------------------

function renderProfileIdentity(
    member,
    stats
) {

    const memberName =
        getProfileMemberName(
            member
        );

    setProfileText(
        "profileName",
        memberName
    );

    setProfileText(
        "profileRole",
        member["Role"] ||
        "WAC Member"
    );

    setProfileText(
        "memberSince",
        formatProfileMemberSince(
            member["Join Date"]
        )
    );

    setProfileText(
        "profileLevel",
        stats.level
    );

    setProfileText(
        "profileRank",
        stats.rank
    );

    setProfileText(
        "statRank",
        stats.rank
    );

    loadProfilePhoto(
        member,
        memberName
    );

}

//--------------------------------------------------
// Profile Photo
//--------------------------------------------------

function loadProfilePhoto(
    member,
    memberName
) {

    const image =
        document.getElementById(
            "profilePhoto"
        );

    const initials =
        document.getElementById(
            "profileInitials"
        );

    if (!image) return;

    const memberId =
        String(
            member["Member ID"] || ""
        ).trim();

    const candidates = [];

    const explicitPhoto =
        String(
            member["Profile Photo"] || ""
        ).trim();

    if (explicitPhoto) {

        candidates.push(
            explicitPhoto
        );

    }

    if (memberId) {

        candidates.push(

            `assets/images/members/${memberId}.webp`,
            `assets/images/members/${memberId}.jpg`,
            `assets/images/members/${memberId}.jpeg`,
            `assets/images/members/${memberId}.png`,

            `assets/members/${memberId}.webp`,
            `assets/members/${memberId}.jpg`,
            `assets/members/${memberId}.jpeg`,
            `assets/members/${memberId}.png`

        );

    }

    candidates.push(

        "assets/images/members/default-member.webp",
        "assets/images/members/default-member.jpg",
        "assets/images/members/default-member.png",

        "assets/members/default.webp",
        "assets/members/default.jpg",
        "assets/members/default.png",

        "assets/icons/wac-icon.png"

    );

    const uniqueCandidates =
        [...new Set(candidates)];

    let candidateIndex = 0;

    if (initials) {

        initials.textContent =
            getProfileInitials(
                memberName
            );

        initials.hidden = true;

    }

    const tryNextImage = () => {

        if (
            candidateIndex >=
            uniqueCandidates.length
        ) {

            image.hidden = true;

            if (initials) {

                initials.hidden = false;

            }

            return;

        }

        image.src =
            uniqueCandidates[
                candidateIndex
            ];

        candidateIndex += 1;

    };

    image.onload = () => {

        image.hidden = false;

        if (initials) {

            initials.hidden = true;

        }

    };

    image.onerror = () => {

        tryNextImage();

    };

    tryNextImage();

}

//--------------------------------------------------
// Primary Statistics
//--------------------------------------------------

function renderProfileStatistics(
    stats
) {

    setProfileText(
        "statBadges",
        stats.badges
    );

    setProfileText(
        "statPoints",
        stats.points.toLocaleString(
            "en-US"
        )
    );

    setProfileText(
        "statPercent",
        `${stats.percent}%`
    );

}

//--------------------------------------------------
// Rank Progress Display
//--------------------------------------------------

function renderProfileRankProgress(
    stats,
    progress
) {

    const title =
        progress.maximumRank
            ? "Maximum Rank Achieved"
            : `Progress to ${progress.nextRank}`;

    setProfileText(
        "nextRankTitle",
        title
    );

    setProfileText(
        "rankProgressPercent",
        `${progress.percent}%`
    );

    setProfileText(
        "rankProgressText",
        progress.maximumRank
            ? `${stats.badges} badges earned`
            : `${stats.badges} of ${progress.nextTarget} badges toward ${progress.nextRank}`
    );

    setProfileText(
        "rankProgressMessage",
        progress.maximumRank
            ? "This member has reached the highest WAC rank."
            : `Complete ${progress.remaining} more adventure${progress.remaining === 1 ? "" : "s"} to reach ${progress.nextRank}.`
    );

    const progressBar =
        document.getElementById(
            "rankProgressBar"
        );

    if (progressBar) {

        progressBar.style.width =
            `${progress.percent}%`;

        const progressContainer =
            progressBar.parentElement;

        if (progressContainer) {

            progressContainer.setAttribute(
                "aria-valuenow",
                String(
                    progress.percent
                )
            );

        }

    }

}

//--------------------------------------------------
// Recent Adventures
//--------------------------------------------------

function renderRecentAdventures(
    completionRecords
) {

    const container =
        document.getElementById(
            "recentActivity"
        );

    const count =
        document.getElementById(
            "recentAdventureCount"
        );

    if (!container) return;

    if (count) {

        count.textContent =
            completionRecords.length === 1
                ? "1 Completed"
                : `${completionRecords.length} Completed`;

    }

    if (
        completionRecords.length === 0
    ) {

        return;

    }

    container.innerHTML = "";

    completionRecords
        .slice(0, 5)
        .forEach((record) => {

            container.appendChild(
                createRecentAdventureCard(
                    record
                )
            );

        });

}

//--------------------------------------------------
// Recent Adventure Card
//--------------------------------------------------

function createRecentAdventureCard(
    record
) {

    const card =
        document.createElement("article");

    card.className =
        "profile-recent-card";

    const badge =
        createProfileBadgeImage(
            record
        );

    const content =
        document.createElement("div");

    content.className =
        "profile-recent-content";

    const category =
        document.createElement("div");

    category.className =
        "profile-recent-category";

    category.textContent =
        record.adventure?.["Category"] ||
        "WAC Adventure";

    const title =
        document.createElement("h3");

    title.textContent =
        record.adventure?.["Title"] ||
        record.badgeId;

    const meta =
        document.createElement("div");

    meta.className =
        "profile-recent-meta";

    const metaParts = [];

    if (record.completionDate) {

        metaParts.push(
            record.completionDate
                .toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                )
        );

    }

    const points =
        Number(
            record.adventure?.["Points"] ||
            100
        );

    metaParts.push(
        `${Number.isFinite(points) ? points : 100} Points`
    );

    meta.textContent =
        metaParts.join(" • ");

    content.append(
        category,
        title,
        meta
    );

    card.append(
        badge,
        content
    );

    return card;

}

//--------------------------------------------------
// Badge Collection
//--------------------------------------------------

function renderBadgeCollection(
    completionRecords
) {

    const container =
        document.getElementById(
            "earnedBadges"
        );

    const count =
        document.getElementById(
            "earnedBadgeCount"
        );

    if (!container) return;

    if (count) {

        count.textContent =
            completionRecords.length === 1
                ? "1 Badge"
                : `${completionRecords.length} Badges`;

    }

    if (
        completionRecords.length === 0
    ) {

        return;

    }

    container.innerHTML = "";

    completionRecords.forEach(
        (record) => {

            container.appendChild(
                createEarnedBadgeCard(
                    record
                )
            );

        }
    );

}

//--------------------------------------------------
// Earned Badge Card
//--------------------------------------------------

function createEarnedBadgeCard(
    record
) {

    const card =
        document.createElement("article");

    card.className =
        "profile-badge-card";

    const image =
        createProfileBadgeImage(
            record
        );

    const title =
        document.createElement("h3");

    title.textContent =
        record.adventure?.["Title"] ||
        record.badgeId;

    const category =
        document.createElement("p");

    category.textContent =
        record.adventure?.["Category"] ||
        "WAC Adventure";

    card.append(
        image,
        title,
        category
    );

    return card;

}

//--------------------------------------------------
// Badge Image
//--------------------------------------------------

function createProfileBadgeImage(
    record
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "profile-badge-image";

    const image =
        document.createElement("img");

    image.alt =
        `${record.adventure?.["Title"] || record.badgeId} badge`;

    image.loading =
        "lazy";

    const badgeId =
        String(
            record.badgeId || ""
        ).trim();

    const candidates = [

        `assets/badges/${badgeId}.webp`,
        `assets/badges/${badgeId}.png`,
        `assets/badges/${badgeId}.jpg`,
        "assets/icons/wac-icon.png"

    ];

    let candidateIndex = 0;

    const tryNextBadge = () => {

        if (
            candidateIndex >=
            candidates.length
        ) {

            return;

        }

        image.src =
            candidates[
                candidateIndex
            ];

        candidateIndex += 1;

    };

    image.onerror =
        tryNextBadge;

    wrapper.appendChild(
        image
    );

    tryNextBadge();

    return wrapper;

}

//--------------------------------------------------
// Category Progress
//--------------------------------------------------

function renderCategoryProgress(
    completionRecords
) {

    const section =
        document.getElementById(
            "categoryProgressSection"
        );

    const container =
        document.getElementById(
            "categoryProgress"
        );

    if (
        !section ||
        !container
    ) {

        return;

    }

    const categoryTotals = {};

    completionRecords.forEach(
        (record) => {

            const category =
                String(
                    record.adventure?.["Category"] ||
                    "Other"
                ).trim();

            categoryTotals[category] =
                (
                    categoryTotals[category] ||
                    0
                ) + 1;

        }
    );

    const categoryEntries =
        Object.entries(
            categoryTotals
        )
            .sort(
                (firstCategory, secondCategory) =>
                    secondCategory[1] -
                    firstCategory[1]
            );

    if (
        categoryEntries.length === 0
    ) {

        section.hidden = true;
        return;

    }

    const highestCount =
        categoryEntries[0][1];

    container.innerHTML = "";

    categoryEntries.forEach(
        ([category, categoryCount]) => {

            const row =
                document.createElement("div");

            row.className =
                "profile-category-row";

            const heading =
                document.createElement("div");

            heading.className =
                "profile-category-heading";

            const name =
                document.createElement("strong");

            name.textContent =
                category;

            const count =
                document.createElement("span");

            count.textContent =
                categoryCount === 1
                    ? "1 Badge"
                    : `${categoryCount} Badges`;

            heading.append(
                name,
                count
            );

            const bar =
                document.createElement("div");

            bar.className =
                "profile-category-bar";

            const fill =
                document.createElement("div");

            fill.className =
                "profile-category-fill";

            fill.style.width =
                `${
                    Math.round(
                        (
                            categoryCount /
                            highestCount
                        ) * 100
                    )
                }%`;

            bar.appendChild(
                fill
            );

            row.append(
                heading,
                bar
            );

            container.appendChild(
                row
            );

        }
    );

    section.hidden = false;

}

//--------------------------------------------------
// Optional Achievements
//--------------------------------------------------

async function loadProfileAchievements(
    memberId
) {

    if (
        typeof AchievementEngine ===
        "undefined"
    ) {

        return;

    }

    try {

        const achievements =
            await AchievementEngine
                .getMemberAchievements(
                    memberId
                );

        if (
            !Array.isArray(achievements) ||
            achievements.length === 0
        ) {

            return;

        }

        const section =
            document.getElementById(
                "achievementSection"
            );

        const container =
            document.getElementById(
                "achievementList"
            );

        const count =
            document.getElementById(
                "achievementCount"
            );

        if (
            !section ||
            !container
        ) {

            return;

        }

        container.innerHTML = "";

        achievements.forEach(
            (achievement) => {

                const card =
                    document.createElement("article");

                card.className =
                    "profile-achievement-card";

                const icon =
                    document.createElement("div");

                icon.className =
                    "profile-achievement-icon";

                icon.textContent =
                    achievement.Icon ||
                    achievement["Icon"] ||
                    "🏆";

                const title =
                    document.createElement("h3");

                title.textContent =
                    achievement.Title ||
                    achievement["Title"] ||
                    achievement.Name ||
                    achievement["Name"] ||
                    "WAC Achievement";

                const description =
                    document.createElement("p");

                description.textContent =
                    achievement.Description ||
                    achievement["Description"] ||
                    "Achievement unlocked.";

                card.append(
                    icon,
                    title,
                    description
                );

                container.appendChild(
                    card
                );

            }
        );

        if (count) {

            count.textContent =
                achievements.length === 1
                    ? "1 Achievement"
                    : `${achievements.length} Achievements`;

        }

        section.hidden = false;

    }

    catch (error) {

        console.error(
            "Unable to load profile achievements.",
            error
        );

    }

}

//--------------------------------------------------
// Member Helpers
//--------------------------------------------------

function getProfileMemberName(
    member
) {

    const displayName =
        String(
            member["Display Name"] || ""
        ).trim();

    if (displayName) {

        return displayName;

    }

    const firstName =
        String(
            member["First Name"] || ""
        ).trim();

    const lastName =
        String(
            member["Last Name"] || ""
        ).trim();

    return (
        `${firstName} ${lastName}`.trim() ||
        "WAC Member"
    );

}

function getProfileInitials(
    memberName
) {

    const initials =
        String(memberName || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (namePart) =>
                    namePart
                        .charAt(0)
                        .toUpperCase()
            )
            .join("");

    return initials || "W";

}

function formatProfileMemberSince(
    value
) {

    const joinDate =
        parseProfileDate(
            value
        );

    if (!joinDate) {

        return "WAC Member";

    }

    return `Member Since ${joinDate.toLocaleDateString(
        "en-US",
        {
            month: "short",
            year: "numeric"
        }
    )}`;

}

//--------------------------------------------------
// Date Parser
//--------------------------------------------------

function parseProfileDate(
    value
) {

    const dateText =
        String(value || "").trim();

    if (!dateText) {

        return null;

    }

    const slashDate =
        dateText.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

    if (slashDate) {

        return new Date(

            Number(slashDate[3]),
            Number(slashDate[1]) - 1,
            Number(slashDate[2])

        );

    }

    const dashDate =
        dateText.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

    if (dashDate) {

        return new Date(

            Number(dashDate[1]),
            Number(dashDate[2]) - 1,
            Number(dashDate[3])

        );

    }

    const parsedDate =
        new Date(dateText);

    return Number.isNaN(
        parsedDate.getTime()
    )
        ? null
        : parsedDate;

}

//--------------------------------------------------
// Text Helper
//--------------------------------------------------

function setProfileText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            String(
                value ?? ""
            );

    }

}

//--------------------------------------------------
// Page Error
//--------------------------------------------------

function showProfileError(
    message
) {

    const page =
        document.querySelector(
            ".profile-page .container"
        );

    if (!page) return;

    page.innerHTML = `

        <div class="profile-empty-state">

            <div class="profile-empty-icon">
                ⚠️
            </div>

            <h3>
                Adventure Record Unavailable
            </h3>

            <p>
                ${message}
            </p>

            <a
                href="#"
                class="small-button"
                data-page="family"
            >
                Back to Family &amp; Friends
            </a>

        </div>

    `;

}