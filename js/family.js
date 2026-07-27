// ======================================
// WAC Family & Friends Directory
// Version 3.0
// ======================================

(async function () {

    try {

        //--------------------------------------------------
        // Load Database Information Once
        //--------------------------------------------------

        const [
            memberRows,
            adventures,
            logs
        ] = await Promise.all([

            Database.getMembers(),
            Database.getAdventures(),
            Database.getLogs()

        ]);

        //--------------------------------------------------
        // Active Members
        //--------------------------------------------------

        const activeMembers =
            memberRows.filter((member) => {

                const status =
                    String(
                        member["Status"] || ""
                    )
                        .trim()
                        .toLowerCase();

                return status === "active";

            });

        //--------------------------------------------------
        // Supporting Maps
        //--------------------------------------------------

        const activeMemberMap =
            new Map();

        activeMembers.forEach((member) => {

            const memberId =
                getMemberId(member);

            if (memberId) {

                activeMemberMap.set(
                    memberId,
                    member
                );

            }

        });

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
        // Unique Completed Badge Records
        //--------------------------------------------------

        const completionRecords =
            buildCompletionRecords(

                logs,
                activeMemberMap,
                adventureMap

            );

        //--------------------------------------------------
        // Member Statistics
        //--------------------------------------------------

        const memberStatistics =
            buildMemberStatistics(

                activeMembers,
                completionRecords

            );

        //--------------------------------------------------
        // Render Page
        //--------------------------------------------------

        renderCompoundSnapshot(

            activeMembers,
            adventures,
            completionRecords

        );

        renderMemberDirectory(
            memberStatistics
        );

        renderLatestBadge(
            completionRecords
        );

        renderCurrentLeader(
            memberStatistics
        );

        renderCompoundGoal(

            adventures,
            completionRecords

        );

    }

    catch (error) {

        console.error(
            "Unable to load Family & Friends page.",
            error
        );

        showFamilyPageError();

    }

})();

//--------------------------------------------------
// Build Unique Completion Records
//--------------------------------------------------

function buildCompletionRecords(
    logs,
    activeMemberMap,
    adventureMap
) {

    const uniqueCompletions =
        new Map();

    logs.forEach((log) => {

        const status =
            String(
                log["Status"] || ""
            )
                .trim()
                .toLowerCase();

        const memberId =
            String(
                log["Member ID"] || ""
            ).trim();

        const badgeId =
            String(
                log["Badge ID"] || ""
            ).trim();

        if (
            status !== "completed" ||
            !memberId ||
            !badgeId ||
            !activeMemberMap.has(memberId)
        ) {

            return;

        }

        const completionKey =
            `${memberId}::${badgeId}`;

        const completionDate =
            parseFamilyDate(

                log["Completed DateTime"] ||
                log["Date"]

            );

        const record = {

            memberId,

            badgeId,

            member:
                activeMemberMap.get(memberId),

            adventure:
                adventureMap.get(badgeId) || null,

            completionDate,

            log

        };

        //--------------------------------------------------
        // Preserve the Newest Duplicate Record
        //--------------------------------------------------

        const existingRecord =
            uniqueCompletions.get(
                completionKey
            );

        if (!existingRecord) {

            uniqueCompletions.set(
                completionKey,
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

            uniqueCompletions.set(
                completionKey,
                record
            );

        }

    });

    return Array.from(
        uniqueCompletions.values()
    );

}

//--------------------------------------------------
// Build Statistics for Every Member
//--------------------------------------------------

function buildMemberStatistics(
    members,
    completionRecords
) {

    const recordsByMember =
        new Map();

    completionRecords.forEach((record) => {

        if (
            !recordsByMember.has(
                record.memberId
            )
        ) {

            recordsByMember.set(
                record.memberId,
                []
            );

        }

        recordsByMember
            .get(record.memberId)
            .push(record);

    });

    return members
        .map((member) => {

            const memberId =
                getMemberId(member);

            const records =
                recordsByMember.get(
                    memberId
                ) || [];

            const badges =
                records.length;

            const points =
                records.reduce(
                    (total, record) => {

                        const adventurePoints =
                            Number(
                                record.adventure?.["Points"] ||
                                100
                            );

                        return (
                            total +
                            (
                                Number.isFinite(
                                    adventurePoints
                                )
                                    ? adventurePoints
                                    : 100
                            )
                        );

                    },
                    0
                );

            return {

                member,

                memberId,

                name:
                    getMemberName(member),

                badges,

                points,

                rank:
                    getFamilyRank(badges)

            };

        })
        .sort((firstMember, secondMember) => {

            return firstMember.name.localeCompare(
                secondMember.name
            );

        });

}

//--------------------------------------------------
// Compound Snapshot
//--------------------------------------------------

function renderCompoundSnapshot(
    members,
    adventures,
    completionRecords
) {

    setFamilyText(
        "familyMembers",
        members.length
    );

    setFamilyText(
        "familyAdventures",
        adventures.length
    );

    setFamilyText(
        "familyBadges",
        completionRecords.length
    );

    const totalPoints =
        completionRecords.reduce(
            (total, record) => {

                const points =
                    Number(
                        record.adventure?.["Points"] ||
                        100
                    );

                return (
                    total +
                    (
                        Number.isFinite(points)
                            ? points
                            : 100
                    )
                );

            },
            0
        );

    setFamilyText(
        "familyPoints",
        totalPoints.toLocaleString("en-US")
    );

}

//--------------------------------------------------
// Member Directory
//--------------------------------------------------

function renderMemberDirectory(
    memberStatistics
) {

    const grid =
        document.getElementById(
            "familyGrid"
        );

    const directoryCount =
        document.getElementById(
            "familyDirectoryCount"
        );

    if (!grid) return;

    grid.innerHTML = "";

    if (directoryCount) {

        directoryCount.textContent =
            memberStatistics.length === 1
                ? "1 Active Member"
                : `${memberStatistics.length} Active Members`;

    }

    if (memberStatistics.length === 0) {

        grid.appendChild(
            createFamilyEmptyState(

                "No Active Members",
                "Active WAC members will appear here after they are added to the Members sheet."

            )
        );

        return;

    }

    memberStatistics.forEach(
        (memberStats) => {

            grid.appendChild(
                createMemberCard(
                    memberStats
                )
            );

        }
    );

}

//--------------------------------------------------
// Create Member Card
//--------------------------------------------------

function createMemberCard(memberStats) {

    const {
        member,
        memberId,
        name,
        badges,
        points,
        rank
    } = memberStats;

    const card =
        document.createElement("article");

    card.className =
        "family-member-card";

    card.tabIndex = 0;

    card.setAttribute(
        "role",
        "button"
    );

    card.setAttribute(
        "aria-label",
        `Open ${name}'s Adventure Record`
    );

    //--------------------------------------------------
    // Member Photo
    //--------------------------------------------------

    const photoArea =
        createMemberPhoto(

            member,
            memberId,
            name

        );

    //--------------------------------------------------
    // Member Information
    //--------------------------------------------------

    const content =
        document.createElement("div");

    content.className =
        "family-member-content";

    const role =
        document.createElement("div");

    role.className =
        "family-member-role";

    role.textContent =
        member["Role"] ||
        "WAC Member";

    const title =
        document.createElement("h3");

    title.textContent =
        name;

    const rankText =
        document.createElement("div");

    rankText.className =
        "family-member-rank";

    rankText.textContent =
        rank;

    //--------------------------------------------------
    // Member Statistics
    //--------------------------------------------------

    const stats =
        document.createElement("div");

    stats.className =
        "family-member-stats";

    stats.append(

        createMemberStat(
            badges,
            badges === 1
                ? "Badge"
                : "Badges"
        ),

        createMemberStat(
            points.toLocaleString("en-US"),
            "Points"
        )

    );

    const action =
        document.createElement("div");

    action.className =
        "family-member-action";

    action.textContent =
        "View Adventure Record →";

    content.append(
        role,
        title,
        rankText,
        stats,
        action
    );

    card.append(
        photoArea,
        content
    );

    //--------------------------------------------------
    // Open Member Profile
    //--------------------------------------------------

    const openProfile =
        async () => {

            window.WAC.selectedMember =
                member;

            await WACRouter.loadPage(
                "profile"
            );

        };

    card.addEventListener(
        "click",
        openProfile
    );

    card.addEventListener(
        "keydown",
        async (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                await openProfile();

            }

        }
    );

    return card;

}

//--------------------------------------------------
// Create Member Photo with Fallback
//--------------------------------------------------

function createMemberPhoto(
    member,
    memberId,
    memberName
) {

    const photoWrapper =
        document.createElement("div");

    photoWrapper.className =
        "family-member-photo";

    const initials =
        document.createElement("div");

    initials.className =
        "family-member-initials";

    initials.textContent =
        getMemberInitials(
            memberName
        );

    const image =
        document.createElement("img");

    image.alt =
        `${memberName} profile`;

    image.loading =
        "lazy";

    const photoCandidates =
        getMemberPhotoCandidates(

            member,
            memberId

        );

    let candidateIndex = 0;

    const tryNextPhoto = () => {

        if (
            candidateIndex >=
            photoCandidates.length
        ) {

            image.remove();

            initials.hidden = false;

            return;

        }

        image.src =
            photoCandidates[
                candidateIndex
            ];

        candidateIndex += 1;

    };

    image.onload = () => {

        initials.hidden = true;

    };

    image.onerror = () => {

        tryNextPhoto();

    };

    initials.hidden = false;

    photoWrapper.append(
        initials,
        image
    );

    tryNextPhoto();

    return photoWrapper;

}

//--------------------------------------------------
// Member Photo Candidate Paths
//--------------------------------------------------

function getMemberPhotoCandidates(
    member,
    memberId
) {

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
        "assets/members/default.png"

    );

    return [
        ...new Set(candidates)
    ];

}

//--------------------------------------------------
// Member Stat
//--------------------------------------------------

function createMemberStat(
    value,
    label
) {

    const stat =
        document.createElement("div");

    stat.className =
        "family-member-stat";

    const number =
        document.createElement("strong");

    number.textContent =
        value;

    const text =
        document.createElement("span");

    text.textContent =
        label;

    stat.append(
        number,
        text
    );

    return stat;

}

//--------------------------------------------------
// Latest Badge Earned
//--------------------------------------------------

function renderLatestBadge(
    completionRecords
) {

    const title =
        document.getElementById(
            "familyLatestTitle"
        );

    const description =
        document.getElementById(
            "familyLatestDescription"
        );

    const meta =
        document.getElementById(
            "familyLatestMeta"
        );

    if (
        !title ||
        !description
    ) {

        return;

    }

    const datedRecords =
        completionRecords
            .filter(
                (record) =>
                    record.completionDate
            )
            .sort(
                (firstRecord, secondRecord) =>
                    secondRecord.completionDate -
                    firstRecord.completionDate
            );

    const latestRecord =
        datedRecords[0] || null;

    if (!latestRecord) {

        title.textContent =
            "Waiting for the next adventure...";

        description.textContent =
            "Completed adventures from all active members will appear here.";

        if (meta) {

            meta.hidden = true;

        }

        return;

    }

    const memberName =
        getMemberName(
            latestRecord.member
        );

    const adventureTitle =
        latestRecord.adventure?.["Title"] ||
        latestRecord.badgeId;

    title.textContent =
        adventureTitle;

    description.textContent =
        `${memberName} earned this badge most recently.`;

    if (meta) {

        meta.textContent =
            latestRecord.completionDate
                .toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    }
                );

        meta.hidden = false;

    }

}

//--------------------------------------------------
// Current Points Leader
//--------------------------------------------------

function renderCurrentLeader(
    memberStatistics
) {

    const name =
        document.getElementById(
            "familyLeaderName"
        );

    const description =
        document.getElementById(
            "familyLeaderDescription"
        );

    const meta =
        document.getElementById(
            "familyLeaderMeta"
        );

    if (
        !name ||
        !description
    ) {

        return;

    }

    const rankedMembers =
        [...memberStatistics]
            .sort(
                (firstMember, secondMember) => {

                    if (
                        secondMember.points !==
                        firstMember.points
                    ) {

                        return (
                            secondMember.points -
                            firstMember.points
                        );

                    }

                    if (
                        secondMember.badges !==
                        firstMember.badges
                    ) {

                        return (
                            secondMember.badges -
                            firstMember.badges
                        );

                    }

                    return firstMember.name.localeCompare(
                        secondMember.name
                    );

                }
            );

    const leader =
        rankedMembers[0] || null;

    if (
        !leader ||
        (
            leader.points === 0 &&
            leader.badges === 0
        )
    ) {

        name.textContent =
            "No Leader Yet";

        description.textContent =
            "The points leader will appear after adventures are completed.";

        if (meta) {

            meta.hidden = true;

        }

        return;

    }

    name.textContent =
        leader.name;

    description.textContent =
        `${leader.rank} with ${leader.points.toLocaleString("en-US")} WAC points.`;

    if (meta) {

        meta.textContent =
            leader.badges === 1
                ? "1 badge earned"
                : `${leader.badges} badges earned`;

        meta.hidden = false;

    }

}

//--------------------------------------------------
// Compound Goal
//--------------------------------------------------

function renderCompoundGoal(
    adventures,
    completionRecords
) {

    const description =
        document.getElementById(
            "familyGoalDescription"
        );

    const meta =
        document.getElementById(
            "familyGoalMeta"
        );

    const progressFill =
        document.getElementById(
            "familyGoalProgressFill"
        );

    const uniqueCompletedAdventures =
        new Set(

            completionRecords.map(
                (record) =>
                    record.badgeId
            )

        );

    const completed =
        uniqueCompletedAdventures.size;

    const total =
        adventures.length;

    const percent =
        total > 0
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;

    if (description) {

        description.textContent =
            completed === 0
                ? "The community is ready to begin completing the full WAC adventure catalog."
                : `${percent}% of all WAC adventures have been completed by at least one active member.`;

    }

    if (meta) {

        meta.textContent =
            `${completed} of ${total} adventures completed`;

    }

    if (progressFill) {

        progressFill.style.width =
            `${percent}%`;

    }

}

//--------------------------------------------------
// Rank Rules
//--------------------------------------------------

function getFamilyRank(
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
// Member Helpers
//--------------------------------------------------

function getMemberId(member) {

    return String(
        member["Member ID"] || ""
    ).trim();

}

function getMemberName(member) {

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

function getMemberInitials(name) {

    const initials =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0).toUpperCase()
            )
            .join("");

    return initials || "W";

}

//--------------------------------------------------
// Date Parser
//--------------------------------------------------

function parseFamilyDate(value) {

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

    const dateWithTime =
        new Date(dateText);

    return Number.isNaN(
        dateWithTime.getTime()
    )
        ? null
        : dateWithTime;

}

//--------------------------------------------------
// Text Helper
//--------------------------------------------------

function setFamilyText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (element) {

        element.textContent =
            String(value);

    }

}

//--------------------------------------------------
// Empty State
//--------------------------------------------------

function createFamilyEmptyState(
    titleText,
    messageText
) {

    const emptyState =
        document.createElement("div");

    emptyState.className =
        "family-empty-state";

    const icon =
        document.createElement("div");

    icon.className =
        "family-empty-icon";

    icon.textContent =
        "👥";

    const title =
        document.createElement("h3");

    title.textContent =
        titleText;

    const message =
        document.createElement("p");

    message.textContent =
        messageText;

    emptyState.append(
        icon,
        title,
        message
    );

    return emptyState;

}

//--------------------------------------------------
// Page Error
//--------------------------------------------------

function showFamilyPageError() {

    const grid =
        document.getElementById(
            "familyGrid"
        );

    if (grid) {

        grid.innerHTML = "";

        grid.appendChild(
            createFamilyEmptyState(

                "Community Unavailable",
                "The Family & Friends directory could not be loaded. Please try again later."

            )
        );

    }

}