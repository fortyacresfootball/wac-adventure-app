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

    const pendingCount =
        document.getElementById(
            "adminPendingCount"
        );

    const refreshButton =
        document.getElementById(
            "refreshAdminQueue"
        );

    const messageBox =
        document.getElementById(
            "adminQueueMessage"
        );

    //--------------------------------------------------
    // Bind Refresh Button
    //--------------------------------------------------

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async () => {

                await loadPendingQueue();

            }
        );

    }

    //--------------------------------------------------
    // Initial Load
    //--------------------------------------------------

    await loadPendingQueue();

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

            const submissions =
                await getPendingSubmissions();

            renderPendingSubmissions(
                submissions
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

        return Array.isArray(
            result.submissions
        )
            ? result.submissions
            : [];

    }

    //--------------------------------------------------
    // Render Queue
    //--------------------------------------------------

    function renderPendingSubmissions(
        submissions
    ) {

        if (pendingCount) {

            pendingCount.textContent =
                String(
                    submissions.length
                );

        }

        if (!queueContainer) {

            return;

        }

        queueContainer.innerHTML =
            "";

        if (
            submissions.length === 0
        ) {

            queueContainer.innerHTML = `

                <div class="profile-empty-state">

                    <div class="profile-empty-icon">
                        ✓
                    </div>

                    <h3>
                        No Pending Submissions
                    </h3>

                    <p>
                        Every submitted adventure has been reviewed.
                    </p>

                </div>

            `;

            return;

        }

        submissions.forEach(
            (submission) => {

                queueContainer.appendChild(
                    createSubmissionCard(
                        submission
                    )
                );

            }
        );

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