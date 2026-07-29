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