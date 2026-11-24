// ======================================
// WAC Administrator Approval Queue
// Version 1.0
// ======================================

(async function () {

    "use strict";

    //--------------------------------------------------
    // Administrator Access Check
    //--------------------------------------------------

    if (
        typeof AuthService === "undefined" ||
        !AuthService.isSignedIn() ||
        !AuthService.isAdmin()
    ) {

        if (
            typeof WACRouter !== "undefined"
        ) {

            await WACRouter.loadPage(
                "home"
            );

        }

        return;

    }

    //--------------------------------------------------
// Page Elements
//--------------------------------------------------

const queueContainer =
    document.getElementById(
        "adminApprovalQueue"
    );

const galleryQueueContainer =
    document.getElementById(
        "adminGalleryApprovalQueue"
    );

const pendingCount =
    document.getElementById(
        "adminPendingCount"
    );

const adventureCount =
    document.getElementById(
        "adminAdventureCount"
    );

const galleryCount =
    document.getElementById(
        "adminGalleryCount"
    );

const refreshButton =
    document.getElementById(
        "refreshAdminQueue"
    );

const messageBox =
    document.getElementById(
        "adminQueueMessage"
    );

    const pollNewButton =
    document.getElementById(
        "wacPollNewButton"
    );

const pollFormPanel =
    document.getElementById(
        "wacPollFormPanel"
    );

const pollForm =
    document.getElementById(
        "wacPollForm"
    );

const pollCancelButton =
    document.getElementById(
        "wacPollCancelButton"
    );

    //--------------------------------------------------
// Ultimate Challenges — Admin View Controls
//--------------------------------------------------

const adminChallengesByChallenge =
    document.getElementById(
        "adminChallengesByChallenge"
    );

const adminChallengesByMember =
    document.getElementById(
        "adminChallengesByMember"
    );

const adminChallengesContent =
    document.getElementById(
        "adminChallengesContent"
    );

async function showAdminChallengeView(view) {

    if (!adminChallengesContent) {
        return;
    }

    adminChallengesContent.innerHTML = `
        <div class="profile-empty-state">
            <h3>Loading Challenge Data</h3>
            <p>Retrieving WAC member progress...</p>
        </div>
    `;

    try {

        const result =
            await Database.authenticatedPost(
                "getAdminUltimateChallenges"
            );

        if (!result || result.success !== true) {
            throw new Error(
                result?.error ||
                "Unable to retrieve challenge data."
            );
        }

        const challenges =
            Array.isArray(result.challenges)
                ? result.challenges
                : [];

        const tasks =
            Array.isArray(result.tasks)
                ? result.tasks
                : [];

        const members =
            Array.isArray(result.members)
                ? result.members
                : [];

        const progress =
            Array.isArray(result.progress)
                ? result.progress
                : [];

        adminChallengesContent.innerHTML = "";

        const heading =
            document.createElement("h3");

        heading.textContent =
            view === "challenge"
                ? "All Ultimate Challenges"
                : "WAC Member Challenge Progress";

        const summary =
            document.createElement("p");

        summary.textContent =
            `${challenges.length} Challenges | ` +
            `${tasks.length} Tasks | ` +
            `${members.length} Members | ` +
            `${progress.filter(p => p.completed === true).length} Completed Task Records`;

        adminChallengesContent.append(
            heading,
            summary
        );

        const list =
    document.createElement("div");

list.style.display = "grid";
list.style.gridTemplateColumns = "1fr";
list.style.gap = "12px";
list.style.marginTop = "20px";

function createAdminSummaryRow(
    titleText,
    detailText
) {

    const row =
        document.createElement("div");

    row.className =
        "profile-recent-card";

    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.gap = "16px";
    row.style.padding = "20px 24px";

    const left =
        document.createElement("div");

    left.style.flex = "1";

    const title =
        document.createElement("h3");

    title.textContent = titleText;
    title.style.margin = "0";
    title.style.lineHeight = "1.3";

    const right =
        document.createElement("div");

    right.className = "chip";
    right.textContent = detailText;
    right.style.whiteSpace = "nowrap";

    left.appendChild(title);
    row.append(left, right);

    return row;

}

        function showAdminChallengeTasks(
            challengeName,
            challengeId,
            challengeTasks,
            member,
            originRow
        ) {

            const previousContent =
                Array.from(adminChallengesContent.childNodes);

            const memberId =
                String(member.memberId || "").trim();

            const memberName =
                member.displayName || memberId;

            const back = document.createElement("button");
            back.type = "button";
            back.className = "small-button";
            back.textContent = "Back to Member Progress";

            back.onclick = () => {
                adminChallengesContent.replaceChildren(...previousContent);
                originRow.focus();
            };

            const heading = document.createElement("h3");
            heading.textContent = `${memberName} — ${challengeName}`;

            const explanation = document.createElement("p");
            explanation.textContent =
                "Read-only task status. Completion dates are shown where recorded.";

            const taskList = document.createElement("div");

            Object.assign(taskList.style, {
                display: "grid",
                gap: "12px",
                marginTop: "20px"
            });

            const memberProgress = progress.filter(record =>
                String(record.memberId || "").trim() === memberId &&
                String(record.challengeId || "").trim() === challengeId
            );

            const sortedTasks = [...challengeTasks].sort((a, b) =>
                (Number(a["Sort Order"]) || 0) -
                (Number(b["Sort Order"]) || 0)
            );

            sortedTasks.forEach(task => {

                const taskId =
                    String(task["Task ID"] || "").trim();

                const completedRecord = memberProgress.find(record =>
                    String(record.taskId || "").trim() === taskId &&
                    record.completed === true
                );

                const card = document.createElement("article");
                card.className = "profile-recent-card";

                Object.assign(card.style, {
                    display: "block",
                    padding: "16px 20px",
                    overflowWrap: "anywhere"
                });

                const title = document.createElement("h4");
                title.textContent = task["Task Name"] || taskId;
                title.style.margin = "0 0 8px";

                const details = document.createElement("p");

                details.textContent = [
                    task["Category"],
                    task["Task Description"]
                ].filter(Boolean).join(" · ");

                const status = document.createElement("p");

                status.textContent = completedRecord
                    ? "Completed — Date: " +
                        (completedRecord.completedDate || "Not recorded")
                    : "Outstanding";

                status.style.fontWeight = "700";

                card.append(title, details, status);
                taskList.appendChild(card);

            });

            if (!sortedTasks.length) {
                const empty = document.createElement("p");
                empty.textContent = "No tasks were returned for this challenge.";
                taskList.appendChild(empty);
            }

            adminChallengesContent.replaceChildren(
                back,
                heading,
                explanation,
                taskList
            );

            back.focus();

        }

        if (view === "challenge") {

            challenges.forEach(challenge => {

                const challengeId =
                    String(challenge["Challenge ID"] || "").trim();

                const challengeName =
                    challenge["Challenge Name"] || "Unnamed Challenge";

                const challengeTasks = tasks.filter(task =>
                    String(task["Challenge ID"] || "").trim() === challengeId
                );

                const taskIds = new Set(
                    challengeTasks
                        .map(task => String(task["Task ID"] || "").trim())
                        .filter(Boolean)
                );

                const row = createAdminSummaryRow(
                    challengeName,
                    `${taskIds.size} Tasks`
                );

                row.setAttribute("role", "button");
                row.tabIndex = 0;
                row.style.cursor = "pointer";
                row.setAttribute(
                    "aria-label",
                    `View member progress for ${challengeName}`
                );

                function openChallengeMembers() {

                    const previousContent =
                        Array.from(adminChallengesContent.childNodes);

                    const backButton = document.createElement("button");
                    backButton.type = "button";
                    backButton.className = "small-button";
                    backButton.textContent = "Back to Challenges";

                    backButton.onclick = () => {
                        adminChallengesContent.replaceChildren(
                            ...previousContent
                        );
                        row.focus();
                    };

                    const title = document.createElement("h3");
                    title.textContent = challengeName;

                    const explanation = document.createElement("p");
                    explanation.textContent =
                        "Tasks marked complete by each member. " +
                        "These totals do not determine whether all " +
                        "challenge requirements have been met.";

                    const memberList = document.createElement("div");

                    Object.assign(memberList.style, {
                        display: "grid",
                        gap: "12px",
                        marginTop: "20px"
                    });

                    members.forEach(member => {

                        const memberId =
                            String(member.memberId || "").trim();

                        const memberName =
                            member.displayName || memberId;

                        const completedTaskIds = new Set(
                            progress
                                .filter(record =>
                                    String(record.memberId || "").trim() === memberId &&
                                    String(record.challengeId || "").trim() === challengeId &&
                                    record.completed === true &&
                                    taskIds.has(
                                        String(record.taskId || "").trim()
                                    )
                                )
                                .map(record =>
                                    String(record.taskId || "").trim()
                                )
                        );

                        const completed = completedTaskIds.size;
                        const total = taskIds.size;

                        const memberRow = createAdminSummaryRow(
                            memberName,
                            `${completed} / ${total} Tasks`
                        );

                        memberRow.style.flexWrap = "wrap";

                        const bar = document.createElement("progress");
                        bar.max = total || 1;
                        bar.value = completed;

                        bar.setAttribute(
                            "aria-label",
                            `${memberName}: ${completed} of ${total} tasks marked complete`
                        );

                        Object.assign(bar.style, {
                            width: "100%",
                            height: "16px",
                            accentColor: "#245c38"
                        });

                        memberRow.appendChild(bar);

                        memberRow.setAttribute("role", "button");
                        memberRow.tabIndex = 0;
                        memberRow.style.cursor = "pointer";

                        memberRow.setAttribute(
                            "aria-label",
                            `View ${memberName}'s tasks for ${challengeName}`
                        );

                        const openTasks = () => {
                            showAdminChallengeTasks(
                                challengeName,
                                challengeId,
                                challengeTasks,
                                member,
                                memberRow
                            );
                        };

                        memberRow.addEventListener("click", openTasks);

                        memberRow.addEventListener("keydown", event => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openTasks();
                            }
                        });

                        memberList.appendChild(memberRow);

                    });

                    if (!members.length) {
                        const empty = document.createElement("p");
                        empty.textContent = "No members were returned.";
                        memberList.appendChild(empty);
                    }

                    adminChallengesContent.replaceChildren(
                        backButton,
                        title,
                        explanation,
                        memberList
                    );

                    backButton.focus();

                }

                row.addEventListener("click", openChallengeMembers);

                row.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openChallengeMembers();
                    }
                });

                list.appendChild(row);

            });

        } else {

            members.forEach(member => {

                const memberId =
                    String(member.memberId || "").trim();

                const memberName =
                    member.displayName || memberId;

                const memberProgress = progress.filter(record =>
                    String(record.memberId || "").trim() === memberId
                );

                const completed = memberProgress.filter(record =>
                    record.completed === true
                ).length;

                const row = createAdminSummaryRow(
                    memberName,
                    `${completed} Completed`
                );

                row.setAttribute("role", "button");
                row.tabIndex = 0;
                row.style.cursor = "pointer";

                row.setAttribute(
                    "aria-label",
                    `View challenge progress for ${memberName}`
                );

                function openMemberChallenges() {

                    const previousContent =
                        Array.from(adminChallengesContent.childNodes);

                    const back = document.createElement("button");
                    back.type = "button";
                    back.className = "small-button";
                    back.textContent = "Back to Members";

                    back.onclick = () => {
                        adminChallengesContent.replaceChildren(
                            ...previousContent
                        );
                        row.focus();
                    };

                    const heading = document.createElement("h3");
                    heading.textContent = `${memberName}'s Challenge Progress`;

                    const explanation = document.createElement("p");
                    explanation.textContent =
                        "Select a challenge to review task status and dates. " +
                        "Task totals do not determine whether all " +
                        "challenge requirements have been met.";

                    const challengeList = document.createElement("div");

                    Object.assign(challengeList.style, {
                        display: "grid",
                        gap: "12px",
                        marginTop: "20px"
                    });

                    challenges.forEach(challenge => {

                        const challengeId =
                            String(challenge["Challenge ID"] || "").trim();

                        const challengeName =
                            challenge["Challenge Name"] || "Unnamed Challenge";

                        const challengeTasks = tasks.filter(task =>
                            String(task["Challenge ID"] || "").trim() === challengeId
                        );

                        const taskIds = new Set(
                            challengeTasks
                                .map(task => String(task["Task ID"] || "").trim())
                                .filter(Boolean)
                        );

                        const completedTaskIds = new Set(
                            memberProgress
                                .filter(record =>
                                    String(record.challengeId || "").trim() === challengeId &&
                                    record.completed === true &&
                                    taskIds.has(
                                        String(record.taskId || "").trim()
                                    )
                                )
                                .map(record =>
                                    String(record.taskId || "").trim()
                                )
                        );

                        const count = completedTaskIds.size;
                        const total = taskIds.size;

                        const challengeRow = createAdminSummaryRow(
                            challengeName,
                            `${count} / ${total} Tasks`
                        );

                        challengeRow.style.flexWrap = "wrap";
                        challengeRow.style.cursor = "pointer";
                        challengeRow.tabIndex = 0;
                        challengeRow.setAttribute("role", "button");

                        challengeRow.setAttribute(
                            "aria-label",
                            `View ${memberName}'s tasks for ${challengeName}`
                        );

                        const bar = document.createElement("progress");
                        bar.max = total || 1;
                        bar.value = count;

                        bar.setAttribute(
                            "aria-label",
                            `${count} of ${total} tasks marked complete`
                        );

                        Object.assign(bar.style, {
                            width: "100%",
                            height: "16px",
                            accentColor: "#245c38"
                        });

                        challengeRow.appendChild(bar);

                        const openTasks = () => {
                            showAdminChallengeTasks(
                                challengeName,
                                challengeId,
                                challengeTasks,
                                member,
                                challengeRow
                            );
                        };

                        challengeRow.addEventListener("click", openTasks);

                        challengeRow.addEventListener("keydown", event => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openTasks();
                            }
                        });

                        challengeList.appendChild(challengeRow);

                    });

                    if (!challenges.length) {
                        const empty = document.createElement("p");
                        empty.textContent = "No challenges were returned.";
                        challengeList.appendChild(empty);
                    }

                    adminChallengesContent.replaceChildren(
                        back,
                        heading,
                        explanation,
                        challengeList
                    );

                    back.focus();

                }

                row.addEventListener("click", openMemberChallenges);

                row.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openMemberChallenges();
                    }
                });

                list.appendChild(row);

            });

        }

        adminChallengesContent.appendChild(
            list
        );

    } catch (error) {

        console.error(
            "Unable to load admin challenges:",
            error
        );

        adminChallengesContent.textContent =
            error?.message ||
            "Challenge data could not be loaded.";

    }

}

if (adminChallengesByChallenge) {

    adminChallengesByChallenge.addEventListener(
        "click",
        () => showAdminChallengeView("challenge")
    );

}

if (adminChallengesByMember) {

    adminChallengesByMember.addEventListener(
        "click",
        () => showAdminChallengeView("member")
    );

}

//--------------------------------------------------
// Bind Refresh Button
//--------------------------------------------------

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async () => {

            await Promise.all([
    loadPendingQueue(),
    loadWacPollAdmin()
]);

        }
    );

}

//--------------------------------------------------
// Bind WAC Quick Poll Controls
//--------------------------------------------------

if (
    pollNewButton &&
    pollFormPanel &&
    pollForm
) {

    pollNewButton.addEventListener(
        "click",
        function () {

            pollForm.reset();

            const pollId =
                document.getElementById(
                    "wacPollId"
                );

            const active =
                document.getElementById(
                    "wacPollActive"
                );

            if (pollId) {

                pollId.value =
                    "";

            }

            if (active) {

                active.checked =
                    true;

            }

            pollFormPanel.hidden =
                false;

        }
    );

}

if (
    pollCancelButton &&
    pollFormPanel &&
    pollForm
) {

    pollCancelButton.addEventListener(
        "click",
        function () {

            pollForm.reset();

            pollFormPanel.hidden =
                true;

        }
    );

}

if (
    pollForm
) {

    pollForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const saveButton =
                document.getElementById(
                    "wacPollSaveButton"
                );

            const poll = {

                pollId:
                    document.getElementById(
                        "wacPollId"
                    )?.value || "",

                question:
                    document.getElementById(
                        "wacPollQuestion"
                    )?.value || "",

                option1:
                    document.getElementById(
                        "wacPollOption1"
                    )?.value || "",

                option2:
                    document.getElementById(
                        "wacPollOption2"
                    )?.value || "",

                option3:
                    document.getElementById(
                        "wacPollOption3"
                    )?.value || "",

                option4:
                    document.getElementById(
                        "wacPollOption4"
                    )?.value || "",

                allowWriteIn:
                    document.getElementById(
                        "wacPollAllowWriteIn"
                    )?.checked === true,

                autoRotate:
                    document.getElementById(
                        "wacPollAutoRotate"
                    )?.checked === true,

                rotationOrder:
                    document.getElementById(
                        "wacPollRotationOrder"
                    )?.value || "",

                active:
                    document.getElementById(
                        "wacPollActive"
                    )?.checked === true,

                startDate:
                    document.getElementById(
                        "wacPollStartDate"
                    )?.value || "",

                endDate:
                    document.getElementById(
                        "wacPollEndDate"
                    )?.value || ""

            };

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";

            }

            try {

                const response =
                    await Database
                        .saveWacPoll(
                            poll
                        );

                if (
                    !response ||
                    response.success !== true
                ) {

                    throw new Error(
                        response?.error ||
                        "The poll could not be saved."
                    );

                }

                pollForm.reset();

                if (pollFormPanel) {

                    pollFormPanel.hidden =
                        true;

                }

                await loadWacPollAdmin();

            }

            catch (error) {

                console.error(
                    "Unable to save WAC poll.",
                    error
                );

                alert(
                    error?.message ||
                    "The poll could not be saved."
                );

            }

            finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save Poll";

                }

            }

        }
    );

}

//--------------------------------------------------
// Initial Load
//--------------------------------------------------

await Promise.all([
    loadPendingQueue(),
    loadWacPollAdmin()
]);

//--------------------------------------------------
// Load WAC Quick Poll Administration
//--------------------------------------------------

async function loadWacPollAdmin() {

    const list =
        document.getElementById(
            "wacPollAdminList"
        );

    if (!list) {

        return;

    }

    try {

       const idToken =
    await AuthService.getIdToken(
        true
    );

const response =
    await fetch(
        API_URL,
        {
            method:
                "POST",

            headers: {

                "Content-Type":
                    "text/plain;charset=utf-8"

            },

            body:
                JSON.stringify({

                    action:
                        "getWacPollAdmin",

                    idToken

                })

        }
    );

if (!response.ok) {

    throw new Error(
        "The poll administration service could not be reached."
    );

}

const result =
    await response.json();

if (
    !result ||
    result.success !== true
) {

    throw new Error(
        result?.error ||
        "WAC polls could not be loaded."
    );

        }

        const polls =
    Array.isArray(
        result.polls
    )
        ? result.polls
        : [];

        list.innerHTML =
            "";

        if (!polls.length) {

            list.textContent =
                "No WAC polls have been created.";

            return;

        }

        polls
    .slice(
        0,
        10
    )
    .forEach(

    function (poll) {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "admin-poll-item";

        const title =
            document.createElement(
                "strong"
            );

        title.textContent =
            poll.question ||
            "Untitled Poll";

        const details =
            document.createElement(
                "div"
            );

        details.className =
            "admin-poll-meta";

        const mode =
            poll.autoRotate
                ? "Auto Rotate"
                : "Manual";

        const status =
            poll.active
                ? "Active"
                : "Inactive";

        details.textContent =
            `${poll.pollId} • ${mode} • ${status} • ${poll.voteCount} vote${poll.voteCount === 1 ? "" : "s"}`;

        const editButton =
            document.createElement(
                "button"
            );

        editButton.type =
            "button";

        editButton.className =
            "small-button";

        editButton.textContent =
            "Edit Poll";

        editButton.addEventListener(
            "click",
            function () {

                const formatDateInput =
                    function (value) {

                        const text =
                            String(
                                value || ""
                            ).trim();

                        if (!text) {

                            return "";

                        }

                        const slashDate =
                            text.match(
                                /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
                            );

                        if (slashDate) {

                            return (
                                slashDate[3] +
                                "-" +
                                slashDate[1].padStart(
                                    2,
                                    "0"
                                ) +
                                "-" +
                                slashDate[2].padStart(
                                    2,
                                    "0"
                                )
                            );

                        }

                        const dashDate =
                            text.match(
                                /^(\d{4})-(\d{1,2})-(\d{1,2})$/
                            );

                        if (dashDate) {

                            return (
                                dashDate[1] +
                                "-" +
                                dashDate[2].padStart(
                                    2,
                                    "0"
                                ) +
                                "-" +
                                dashDate[3].padStart(
                                    2,
                                    "0"
                                )
                            );

                        }

                        return "";

                    };

                document.getElementById(
                    "wacPollId"
                ).value =
                    poll.pollId || "";

                document.getElementById(
                    "wacPollQuestion"
                ).value =
                    poll.question || "";

                document.getElementById(
                    "wacPollOption1"
                ).value =
                    poll.option1 || "";

                document.getElementById(
                    "wacPollOption2"
                ).value =
                    poll.option2 || "";

                document.getElementById(
                    "wacPollOption3"
                ).value =
                    poll.option3 || "";

                document.getElementById(
                    "wacPollOption4"
                ).value =
                    poll.option4 || "";

                document.getElementById(
                    "wacPollAllowWriteIn"
                ).checked =
                    poll.allowWriteIn === true;

                document.getElementById(
                    "wacPollAutoRotate"
                ).checked =
                    poll.autoRotate === true;

                document.getElementById(
                    "wacPollRotationOrder"
                ).value =
                    poll.rotationOrder || "";

                document.getElementById(
                    "wacPollActive"
                ).checked =
                    poll.active === true;

                document.getElementById(
                    "wacPollStartDate"
                ).value =
                    formatDateInput(
                        poll.startDate
                    );

                document.getElementById(
                    "wacPollEndDate"
                ).value =
                    formatDateInput(
                        poll.endDate
                    );

                if (pollFormPanel) {

                    pollFormPanel.hidden =
                        false;

                }

            }
        );

        item.appendChild(
            title
        );

        item.appendChild(
            details
        );

        item.appendChild(
            editButton
        );

        list.appendChild(
            item
        );

    }
);

    }

    catch (error) {

        console.error(
            "Unable to load WAC Quick Poll administration.",
            error
        );

        list.textContent =
            error?.message ||
            "WAC polls could not be loaded.";

    }

}

//--------------------------------------------------
// Load Pending Queue
//--------------------------------------------------

async function loadPendingQueue() {

    clearAdminMessage();

    setRefreshLoading(
        true
    );

    showLoadingState();

    try {

        const queue =
            await getPendingSubmissions();

        renderPendingSubmissions(
            queue.submissions,
            queue.galleryPhotos
        );

    }

    catch (error) {

        console.error(
            "Unable to load administrator queue.",
            error
        );

        showQueueError(
            error?.message ||
            "The pending approval queue could not be loaded."
        );

    }

    finally {

        setRefreshLoading(
            false
        );

    }

}

//--------------------------------------------------
// Secure Queue Request
//--------------------------------------------------

async function getPendingSubmissions() {

    const idToken =
        await AuthService.getIdToken(
            true
        );

    const response =
        await fetch(
            API_URL,
            {
                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify({

                        action:
                            "getPendingSubmissions",

                        idToken

                    })
            }
        );

    if (!response.ok) {

        throw new Error(
            "The administrator service could not be reached."
        );

    }

    const result =
        await response.json();

    if (!result.success) {

        throw new Error(
            result.error ||
            "The pending queue could not be loaded."
        );

    }

    return {

        submissions:
            Array.isArray(
                result.submissions
            )
                ? result.submissions
                : [],

        galleryPhotos:
            Array.isArray(
                result.galleryPhotos
            )
                ? result.galleryPhotos
                : []

    };

}

///--------------------------------------------------
// Render Separate Administrator Queues
//--------------------------------------------------

function renderPendingSubmissions(
    submissions,
    galleryPhotos
) {

    const safeSubmissions =
        Array.isArray(
            submissions
        )
            ? submissions
            : [];

    const safeGalleryPhotos =
        Array.isArray(
            galleryPhotos
        )
            ? galleryPhotos
            : [];

    const totalPending =
        safeSubmissions.length +
        safeGalleryPhotos.length;

    //--------------------------------------------------
    // Update Counts
    //--------------------------------------------------

    if (pendingCount) {

        pendingCount.textContent =
            String(
                totalPending
            );

    }

    if (adventureCount) {

        adventureCount.textContent =
            String(
                safeSubmissions.length
            );

    }

    if (galleryCount) {

        galleryCount.textContent =
            String(
                safeGalleryPhotos.length
            );

    }

    //--------------------------------------------------
    // Render Adventure Completion Queue
    //--------------------------------------------------

    if (queueContainer) {

        queueContainer.innerHTML =
            "";

        if (
            safeSubmissions.length ===
            0
        ) {

            queueContainer.innerHTML = `

                <div class="profile-empty-state">

                    <div class="profile-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No Pending Adventure Completions
                    </h3>

                    <p>
                        Every submitted adventure completion has been reviewed.
                    </p>

                </div>

            `;

        } else {

            safeSubmissions.forEach(
                (submission) => {

                    queueContainer.appendChild(
                        createSubmissionCard(
                            submission
                        )
                    );

                }
            );

        }

    }

    //--------------------------------------------------
    // Render Gallery Approval Queue
    //--------------------------------------------------

    if (galleryQueueContainer) {

        galleryQueueContainer.innerHTML =
            "";

        if (
            safeGalleryPhotos.length ===
            0
        ) {

            galleryQueueContainer.innerHTML = `

                <div class="profile-empty-state">

                    <div class="profile-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No Pending Gallery Photos
                    </h3>

                    <p>
                        Every submitted gallery photo has been reviewed.
                    </p>

                </div>

            `;

        } else {

            safeGalleryPhotos.forEach(
                (photo) => {

                    galleryQueueContainer.appendChild(
                        createGalleryPhotoCard(
                            photo
                        )
                    );

                }
            );

        }

    }

}

//--------------------------------------------------
// Gallery Photo Card
//--------------------------------------------------

function createGalleryPhotoCard(
    photo
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "profile-recent-card admin-submission-card admin-gallery-card";

    //--------------------------------------------------
    // Photo Preview
    //--------------------------------------------------

    const photoWrap =
        document.createElement(
            "div"
        );

    photoWrap.className =
        "admin-gallery-photo-wrap";

    const image =
        document.createElement(
            "img"
        );

    image.className =
        "admin-gallery-photo";

    image.loading =
        "lazy";

    image.alt =
        photo.caption ||
        "Pending WAC gallery photo";

    image.src =
        photo.thumbnailUrl ||
        photo.imageUrl ||
        "";

    image.addEventListener(
        "click",
        () => {

            window.open(
                photo.imageUrl ||
                photo.thumbnailUrl,
                "_blank",
                "noopener"
            );

        }
    );

    photoWrap.appendChild(
        image
    );

    //--------------------------------------------------
    // Main Content
    //--------------------------------------------------

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "profile-recent-content";

    const category =
        document.createElement(
            "div"
        );

    category.className =
        "profile-recent-category";

    category.textContent =
        "Gallery Photo";

    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        photo.memberName
            ? `${photo.memberName}'s Photo`
            : "Pending Gallery Photo";

    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "profile-recent-meta";

    const metaParts =
        [];

    if (photo.memberId) {

        metaParts.push(
            photo.memberId
        );

    }

    if (photo.uploadDateTime) {

        metaParts.push(
            `Uploaded ${photo.uploadDateTime}`
        );

    }

    if (photo.dateTaken) {

        metaParts.push(
            `Taken ${photo.dateTaken}`
        );

    }

    meta.textContent =
        metaParts.join(
            " • "
        );

    //--------------------------------------------------
    // Caption
    //--------------------------------------------------

    const captionSection =
        document.createElement(
            "section"
        );

    captionSection.className =
        "admin-review-section";

    const captionLabel =
        document.createElement(
            "div"
        );

    captionLabel.className =
        "admin-review-label";

    captionLabel.textContent =
        "Photo Caption";

    const captionText =
        document.createElement(
            "p"
        );

    captionText.className =
        "admin-review-text";

    captionText.textContent =
        String(
            photo.caption ||
            ""
        ).trim() ||
        "No caption was provided.";

    captionSection.append(
        captionLabel,
        captionText
    );

    //--------------------------------------------------
    // Related Item
    //--------------------------------------------------

    const relatedSection =
        document.createElement(
            "section"
        );

    relatedSection.className =
        "admin-review-section";

    const relatedLabel =
        document.createElement(
            "div"
        );

    relatedLabel.className =
        "admin-review-label";

    relatedLabel.textContent =
        "Related To";

    const relatedText =
        document.createElement(
            "p"
        );

    relatedText.className =
        "admin-review-text";

    if (
        photo.relatedType &&
        photo.relatedId
    ) {

        relatedText.textContent =
            `${photo.relatedType}: ${photo.relatedId}`;

    } else {

        relatedText.textContent =
            "General WAC Photo";

    }

    relatedSection.append(
        relatedLabel,
        relatedText
    );

    //--------------------------------------------------
    // Administrator Comment
    //--------------------------------------------------

    const commentSection =
        document.createElement(
            "section"
        );

    commentSection.className =
        "admin-review-section admin-comment-section";

    const commentLabel =
        document.createElement(
            "label"
        );

    commentLabel.className =
        "admin-review-label";

    commentLabel.textContent =
        "Administrator Comment";

    const commentInput =
        document.createElement(
            "textarea"
        );

    commentInput.className =
        "admin-comment-input";

    commentInput.rows =
        4;

    commentInput.maxLength =
        1500;

    commentInput.placeholder =
        "Leave an optional approval or denial comment. A comment is required when returning a photo.";

    commentSection.append(
        commentLabel,
        commentInput
    );

    //--------------------------------------------------
    // Administrator Actions
    //--------------------------------------------------

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "admin-submission-actions";

    const approveButton =
        document.createElement(
            "button"
        );

    approveButton.type =
        "button";

    approveButton.className =
        "small-button";

    approveButton.textContent =
        "Approve";

    const returnButton =
        document.createElement(
            "button"
        );

    returnButton.type =
        "button";

    returnButton.className =
        "small-button admin-return-button";

    returnButton.textContent =
        "Return for More Information";

    const denyButton =
        document.createElement(
            "button"
        );

    denyButton.type =
        "button";

    denyButton.className =
        "small-button admin-reject-button";

    denyButton.textContent =
        "Deny";

    approveButton.addEventListener(
        "click",
        async () => {

            await processGalleryDecision(
                photo,
                "approved",
                approveButton,
                returnButton,
                denyButton,
                commentInput.value
            );

        }
    );

    returnButton.addEventListener(
        "click",
        async () => {

            const note =
                String(
                    commentInput.value ||
                    ""
                ).trim();

            if (!note) {

                alert(
                    "Please explain what additional information the member must provide."
                );

                commentInput.focus();

                return;

            }

            await processGalleryDecision(
                photo,
                "returned",
                approveButton,
                returnButton,
                denyButton,
                note
            );

        }
    );

    denyButton.addEventListener(
        "click",
        async () => {

            await processGalleryDecision(
                photo,
                "denied",
                approveButton,
                returnButton,
                denyButton,
                commentInput.value
            );

        }
    );

    actions.append(
        approveButton,
        returnButton,
        denyButton
    );

    content.append(
        category,
        title,
        meta,
        captionSection,
        relatedSection,
        commentSection,
        actions
    );

    card.append(
        photoWrap,
        content
    );

    return card;

}

//--------------------------------------------------
// Process Gallery Administrator Decision
//--------------------------------------------------

async function processGalleryDecision(
    photo,
    decision,
    approveButton,
    returnButton,
    denyButton,
    note = ""
) {

    const cleanNote =
        String(
            note || ""
        ).trim();

    let confirmationMessage =
        "";

    if (
        decision ===
        "approved"
    ) {

        confirmationMessage =
            `Approve ${photo.memberName || "this member"}'s gallery photo?`;

    } else if (
        decision ===
        "returned"
    ) {

        confirmationMessage =
            `Return ${photo.memberName || "this member"}'s gallery photo for more information?`;

    } else {

        confirmationMessage =
            `Deny ${photo.memberName || "this member"}'s gallery photo?`;

    }

    if (
        !window.confirm(
            confirmationMessage
        )
    ) {

        return;

    }

    setGalleryDecisionLoading(
        approveButton,
        returnButton,
        denyButton,
        decision
    );

    clearAdminMessage();

    try {

        const result =
            await API.galleryAdminDecision(
                photo.photoId,
                decision,
                cleanNote
            );

        let successMessage =
            "";

        if (
            decision ===
            "approved"
        ) {

            successMessage =
                `${photo.memberName || "The member"}'s gallery photo was approved.`;

        } else if (
            decision ===
            "returned"
        ) {

            successMessage =
                `${photo.memberName || "The member"}'s gallery photo was returned for more information.`;

        } else {

            successMessage =
                `${photo.memberName || "The member"}'s gallery photo was denied.`;

        }

        showAdminMessage(
            successMessage,
            "success"
        );

        await loadPendingQueue();

        return result;

    }

    catch (error) {

        console.error(
            "Unable to process gallery decision.",
            error
        );

        showAdminMessage(
            error?.message ||
            "The gallery decision could not be saved.",
            "error"
        );

        approveButton.disabled =
            false;

        returnButton.disabled =
            false;

        denyButton.disabled =
            false;

        approveButton.textContent =
            "Approve";

        returnButton.textContent =
            "Return for More Information";

        denyButton.textContent =
            "Deny";

    }

}

//--------------------------------------------------
// Gallery Decision Loading State
//--------------------------------------------------

function setGalleryDecisionLoading(
    approveButton,
    returnButton,
    denyButton,
    decision
) {

    approveButton.disabled =
        true;

    returnButton.disabled =
        true;

    denyButton.disabled =
        true;

    approveButton.textContent =
        decision ===
            "approved"
            ? "Approving..."
            : "Approve";

    returnButton.textContent =
        decision ===
            "returned"
            ? "Returning..."
            : "Return for More Information";

    denyButton.textContent =
        decision ===
            "denied"
            ? "Denying..."
            : "Deny";

}

    //--------------------------------------------------
    // Submission Card
    //--------------------------------------------------

    function createSubmissionCard(
    submission
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "profile-recent-card admin-submission-card";

    //--------------------------------------------------
    // Badge
    //--------------------------------------------------

    const badge =
        document.createElement(
            "div"
        );

    badge.className =
        "profile-badge-image";

    const image =
        document.createElement(
            "img"
        );

    image.loading =
        "lazy";

    image.alt =
        `${submission.adventureTitle || submission.adventureId} badge`;

    image.src =
        `assets/badges/${submission.adventureId}.webp`;

    image.onerror = () => {

        image.onerror =
            null;

        image.src =
            `assets/badges/${submission.adventureId}.png`;

    };

    badge.appendChild(
        image
    );

    //--------------------------------------------------
    // Main Content
    //--------------------------------------------------

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "profile-recent-content";

    const category =
        document.createElement(
            "div"
        );

    category.className =
        "profile-recent-category";

    category.textContent =
        submission.category ||
        "WAC Adventure";

    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        submission.adventureTitle ||
        submission.adventureId;

    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "profile-recent-meta";

    meta.textContent =
        buildSubmissionMeta(
            submission
        );

    //--------------------------------------------------
// Adventure Requirements
//--------------------------------------------------

const requirementsSection =
    document.createElement(
        "section"
    );

requirementsSection.className =
    "admin-review-section admin-adventure-requirements";

const requirementsLabel =
    document.createElement(
        "div"
    );

requirementsLabel.className =
    "admin-review-label";

requirementsLabel.textContent =
    "Patch Requirements";

const requirementsText =
    document.createElement(
        "p"
    );

requirementsText.className =
    "admin-review-text";

requirementsText.textContent =
    String(
        submission.requirements ||
        ""
    ).trim() ||
    "No adventure requirements were provided.";

requirementsSection.append(
    requirementsLabel,
    requirementsText
);

//--------------------------------------------------
// Member Submission Story
//--------------------------------------------------

const storySection =
    document.createElement(
        "section"
    );

storySection.className =
    "admin-review-section admin-submission-story";

const storyLabel =
    document.createElement(
        "div"
    );

storyLabel.className =
    "admin-review-label";

storyLabel.textContent =
    "Member Submission Story";

const storyText =
    document.createElement(
        "p"
    );

storyText.className =
    "admin-review-text";

storyText.textContent =
    String(
        submission.submissionStory ||
        ""
    ).trim() ||
    "No submission story was provided.";

storySection.append(
    storyLabel,
    storyText
);

    //--------------------------------------------------
// Administrator Comment
//--------------------------------------------------

const commentSection =
    document.createElement(
        "section"
    );

commentSection.className =
    "admin-review-section admin-comment-section";

const commentLabel =
    document.createElement(
        "label"
    );

commentLabel.className =
    "admin-review-label";

commentLabel.textContent =
    "Administrator Comment";

const commentInput =
    document.createElement(
        "textarea"
    );

commentInput.className =
    "admin-comment-input";

commentInput.rows =
    4;

commentInput.maxLength =
    1500;

commentInput.placeholder =
    "Leave an optional approval or denial comment. A comment is required when returning a submission for more information.";

commentSection.append(
    commentLabel,
    commentInput
);

//--------------------------------------------------
// Administrator Actions
//--------------------------------------------------

const actions =
    document.createElement(
        "div"
    );

actions.className =
    "admin-submission-actions";

const approveButton =
    document.createElement(
        "button"
    );

approveButton.type =
    "button";

approveButton.className =
    "small-button";

approveButton.textContent =
    "Approve";

const returnButton =
    document.createElement(
        "button"
    );

returnButton.type =
    "button";

returnButton.className =
    "small-button admin-return-button";

returnButton.textContent =
    "Return for More Information";

const rejectButton =
    document.createElement(
        "button"
    );

rejectButton.type =
    "button";

rejectButton.className =
    "small-button admin-reject-button";

rejectButton.textContent =
    "Deny";

//--------------------------------------------------
// Approve Submission
//--------------------------------------------------

approveButton.addEventListener(
    "click",
    async () => {

        await processDecision(
            submission,
            "completed",
            approveButton,
            returnButton,
            rejectButton,
            commentInput.value
        );

    }
);

//--------------------------------------------------
// Return Submission
//--------------------------------------------------

returnButton.addEventListener(
    "click",
    async () => {

        const note =
            String(
                commentInput.value || ""
            ).trim();

        if (!note) {

            alert(
                "Please explain what additional information the member must provide."
            );

            commentInput.focus();

            return;

        }

        await processDecision(
            submission,
            "returned",
            approveButton,
            returnButton,
            rejectButton,
            note
        );

    }
);

//--------------------------------------------------
// Deny Submission
//--------------------------------------------------

rejectButton.addEventListener(
    "click",
    async () => {

        await processDecision(
            submission,
            "rejected",
            approveButton,
            returnButton,
            rejectButton,
            commentInput.value
        );

    }
);

actions.append(
    approveButton,
    returnButton,
    rejectButton
);

content.append(
    category,
    title,
    meta,
    requirementsSection,
    storySection,
    commentSection,
    actions
);

card.append(
    badge,
    content
);

return card;

}

//--------------------------------------------------
// Submission Metadata
//--------------------------------------------------

function buildSubmissionMeta(
    submission
) {

    const parts = [];

    if (submission.memberName) {

        parts.push(
            submission.memberName
        );

    }

    if (submission.memberId) {

        parts.push(
            submission.memberId
        );

    }

    if (submission.submittedDate) {

        parts.push(
            `Submitted ${submission.submittedDate}`
        );

    }

    if (submission.points) {

        parts.push(
            `${submission.points} Points`
        );

    }

    return parts.join(
        " • "
    );

}

//--------------------------------------------------
// Process Administrator Decision
//--------------------------------------------------

async function processDecision(
    submission,
    decision,
    approveButton,
    returnButton,
    rejectButton,
    note = ""
) {

    const cleanNote =
        String(
            note || ""
        ).trim();

    let confirmationMessage =
        "";

    if (decision === "completed") {

        confirmationMessage =
            `Approve ${submission.memberName}'s completion of ${submission.adventureTitle}?`;

    } else if (decision === "returned") {

        confirmationMessage =
            `Return ${submission.memberName}'s submission for ${submission.adventureTitle} and request more information?`;

    } else {

        confirmationMessage =
            `Deny ${submission.memberName}'s submission for ${submission.adventureTitle}?`;

    }

    if (
        !window.confirm(
            confirmationMessage
        )
    ) {

        return;

    }

    setDecisionLoading(
        approveButton,
        returnButton,
        rejectButton,
        decision
    );

    clearAdminMessage();

    try {

        const result =
            await submitAdminDecision(
                submission.logId,
                decision,
                cleanNote
            );

        let successMessage =
            "";

        if (decision === "completed") {

            successMessage =
                `${submission.adventureTitle} was approved for ${submission.memberName}.`;

        } else if (decision === "returned") {

            successMessage =
                `${submission.adventureTitle} was returned to ${submission.memberName} for more information.`;

        } else {

            successMessage =
                `${submission.adventureTitle} was denied for ${submission.memberName}.`;

        }

        showAdminMessage(
            successMessage,
            "success"
        );

        await loadPendingQueue();

        return result;

    }

    catch (error) {

        console.error(
            "Unable to process administrator decision.",
            error
        );

        showAdminMessage(
            error?.message ||
            "The administrator decision could not be saved.",
            "error"
        );

        approveButton.disabled =
            false;

        returnButton.disabled =
            false;

        rejectButton.disabled =
            false;

        approveButton.textContent =
            "Approve";

        returnButton.textContent =
            "Return for More Information";

        rejectButton.textContent =
            "Deny";

    }

}
    //--------------------------------------------------
    // Secure Decision Request
    //--------------------------------------------------

    async function submitAdminDecision(
        logId,
        decision,
        note
    ) {

        const idToken =
            await AuthService.getIdToken(
                true
            );

        const response =
            await fetch(
                API_URL,
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "adminDecision",

                            idToken,

                            logId,

                            decision,

                            note

                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                "The administrator service could not be reached."
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.error ||
                "The administrator decision could not be saved."
            );

        }

        return result;

    }

    //--------------------------------------------------
    // Loading and Message Helpers
    //--------------------------------------------------

    function showLoadingState() {

        if (!queueContainer) {

            return;

        }

        queueContainer.innerHTML = `

            <div class="profile-empty-state">

                <div class="profile-empty-icon">
                    ⏳
                </div>

                <h3>
                    Loading Pending Submissions
                </h3>

                <p>
                    The administrator review queue is being refreshed.
                </p>

            </div>

        `;

    }

    function showQueueError(
        message
    ) {

        if (pendingCount) {

            pendingCount.textContent =
                "0";

        }

        if (!queueContainer) {

            return;

        }

        queueContainer.innerHTML = `

            <div class="profile-empty-state">

                <div class="profile-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Approval Queue Unavailable
                </h3>

                <p>
                    ${escapeAdminHTML(message)}
                </p>

            </div>

        `;

    }

    function setRefreshLoading(
        loading
    ) {

        if (!refreshButton) {

            return;

        }

        refreshButton.disabled =
            loading;

        refreshButton.textContent =
            loading
                ? "Refreshing..."
                : "Refresh Queue";

    }

    function setDecisionLoading(
    approveButton,
    returnButton,
    rejectButton,
    decision
) {

    approveButton.disabled =
        true;

    returnButton.disabled =
        true;

    rejectButton.disabled =
        true;

    if (decision === "completed") {

        approveButton.textContent =
            "Approving...";

    } else if (decision === "returned") {

        returnButton.textContent =
            "Returning...";

    } else {

        rejectButton.textContent =
            "Denying...";

    }

}

function showAdminMessage(
    message,
    type
) {

    if (!messageBox) {

        return;

    }

    messageBox.textContent =
        message;

    messageBox.className =
        `auth-modal-message auth-modal-message-${type}`;

    messageBox.hidden =
        false;

}

function clearAdminMessage() {

    if (!messageBox) {

        return;

    }

    messageBox.textContent =
        "";

    messageBox.className =
        "auth-modal-message";

    messageBox.hidden =
        true;

}

function escapeAdminHTML(
    value
) {

    return String(
        value || ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}

})();