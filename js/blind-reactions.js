(function () {

    const form =
        document.getElementById(
            "blindReactionQuestionForm"
        );

    const questionInput =
        document.getElementById(
            "blindReactionQuestion"
        );

    const anonymousInput =
        document.getElementById(
            "blindReactionAnonymous"
        );

    const submitButton =
        document.getElementById(
            "submitBlindReactionQuestion"
        );

    const message =
        document.getElementById(
            "blindReactionSubmitMessage"
        );

        const drawCard =
    document.getElementById(
        "blindReactionDrawCard"
    );

const drawButton =
    document.getElementById(
        "drawBlindReactionQuestion"
    );

const drawResult =
    document.getElementById(
        "blindReactionDrawResult"
    );

const drawSubmittedBy =
    document.getElementById(
        "blindReactionDrawSubmittedBy"
    );

const drawQuestion =
    document.getElementById(
        "blindReactionDrawQuestion"
    );

const drawMessage =
    document.getElementById(
        "blindReactionDrawMessage"
    );

    const pendingCount =
    document.getElementById(
        "blindReactionPendingCount"
    );

    const archive =
    document.getElementById(
        "blindReactionArchive"
    );

    const filterButtons =
    document.querySelectorAll(
        ".blind-reaction-filter-button"
    );

let blindReactionArchiveItems =
    [];

let blindReactionArchiveFilter =
    "all";

    let blindReactionCanManage =
    false;

    const answerInput =
    document.getElementById(
        "blindReactionAnswer"
    );

const saveAnswerButton =
    document.getElementById(
        "saveBlindReactionAnswer"
    );

    const returnQuestionButton =
    document.getElementById(
        "returnBlindReactionQuestion"
    );

    const drawAnotherButton =
    document.getElementById(
        "drawAnotherBlindReaction"
    );

async function initializeBlindReactionDrawAccess() {

    if (!drawCard) {

        return;

    }

    try {

        const response =
            await Database
                .getBlindReactionAccess();

        if (
    response?.canDraw === true
) {

    blindReactionCanManage =
    true;

    drawCard.hidden =
        false;

    if (pendingCount) {

        const count =
            Number(
                response.pendingCount || 0
            );

        pendingCount.textContent =
            count === 1
                ? "1 question waiting in the bucket."
                : `${count} questions waiting in the bucket.`;

    }

}

    }
    catch (error) {

        console.error(
            "Blind Reactions Access Error:",
            error
        );

    }

}

let currentBlindReactionQuestionId =
    "";

initializeBlindReactionDrawAccess();

async function loadBlindReactionArchive() {

    if (!archive) {

        return;

    }

    archive.innerHTML =
    `
        <div class="empty-state">
            Loading reactions from the blind...
        </div>
    `;

    try {

        const response =
            await Database
                .getBlindReactionArchive();

        const reactions =
            Array.isArray(
                response?.reactions
            )
                ? response.reactions
                : [];

                blindReactionArchiveItems =
    reactions;

        renderBlindReactionArchive();

    }
    catch (error) {

        console.error(
            "Blind Reactions Archive Error:",
            error
        );

        archive.innerHTML =
            `
                <div class="empty-state">
                    Blind Reactions could not be loaded.
                </div>
            `;

    }

}

function renderBlindReactionArchive() {

    if (!archive) {

        return;

    }

    let reactions =
        blindReactionArchiveItems
            .slice();

    if (
        blindReactionArchiveFilter ===
        "featured"
    ) {

        reactions =
            reactions.filter(
                function (reaction) {

                    return (
                        reaction.featured ===
                        true
                    );

                }
            );

    }

    reactions.sort(
        function (
            firstReaction,
            secondReaction
        ) {

            return Number(
                secondReaction.featured === true
            ) -
            Number(
                firstReaction.featured === true
            );

        }
    );

    if (!reactions.length) {

        archive.innerHTML =
            `
                <div class="empty-state">
                    ${
                        blindReactionArchiveFilter ===
                        "featured"
                            ? "No Featured Reactions yet."
                            : "No Blind Reactions have been answered yet."
                    }
                </div>
            `;

        return;

    }

    archive.innerHTML =
        reactions
            .map(
                function (reaction) {

                    const submittedBy =
                        reaction.submittedBy
                            ? reaction.submittedBy
                            : "Anonymous";

                    const answeredBy =
                        reaction.answeredBy
                            ? reaction.answeredBy
                            : "Paul";

                    const answeredDate =
                        reaction.answeredDateTime
                            ? formatBlindReactionDate(
                                reaction.answeredDateTime
                            )
                            : "";

                    return `
                        <article class="blind-reaction-entry ${
                            reaction.featured
                                ? "is-featured"
                                : ""
                        }">

                            ${
                                reaction.featured
                                    ? `
                                        <div class="blind-reaction-featured-tag">
                                            FEATURED
                                        </div>
                                    `
                                    : ""
                            }

                            <div class="blind-reaction-entry-question">
                                ${escapeBlindReactionHtml(
                                    reaction.question
                                )}
                            </div>

                            <div class="blind-reaction-entry-meta">
                                Asked by
                                ${escapeBlindReactionHtml(
                                    submittedBy
                                )}
                            </div>

                            <div class="blind-reaction-entry-answer-label">
                                PAUL'S REACTION
                            </div>

                            <div class="blind-reaction-entry-answer">
                                ${escapeBlindReactionHtml(
                                    reaction.answer
                                )}
                            </div>

                            <div class="blind-reaction-entry-footer">
                                Answered by
                                ${escapeBlindReactionHtml(
                                    answeredBy
                                )}
                                ${
                                    answeredDate
                                        ? " • " +
                                          escapeBlindReactionHtml(
                                              answeredDate
                                          )
                                        : ""
                                }
                            </div>

                                                        ${
                                blindReactionCanManage
                                    ? `
                                        <button
                                            type="button"
                                            class="blind-reaction-feature-toggle"
                                            data-question-id="${escapeBlindReactionHtml(
                                                reaction.questionId
                                            )}"
                                            data-featured="${
                                                reaction.featured
                                                    ? "true"
                                                    : "false"
                                            }"
                                        >
                                            ${
                                                reaction.featured
                                                    ? "Remove Featured"
                                                    : "Mark Featured"
                                            }
                                        </button>
                                    `
                                    : ""
                            }

                        </article>
                    `;

                }
            )
            .join("");

}

function formatBlindReactionDate(
    value
) {

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value || ""
        );

    }

    return date.toLocaleString(
        [],
        {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}

function escapeBlindReactionHtml(
    value
) {

    return String(
        value ?? ""
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
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


loadBlindReactionArchive();

if (archive) {

    archive.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    ".blind-reaction-feature-toggle"
                );

            if (
                !button ||
                !blindReactionCanManage
            ) {

                return;

            }

            const questionId =
                button.dataset.questionId || "";

            const currentlyFeatured =
                button.dataset.featured ===
                "true";

            if (!questionId) {

                return;

            }

            button.disabled =
                true;

            button.textContent =
                "Saving...";

            try {

                const response =
                    await Database
                        .setBlindReactionFeatured(
                            questionId,
                            !currentlyFeatured
                        );

                if (
                    !response ||
                    response.success !== true
                ) {

                    throw new Error(
                        response?.error ||
                        "Featured status could not be updated."
                    );

                }

                await loadBlindReactionArchive();

            }
            catch (error) {

                console.error(
                    "Blind Reactions Featured Error:",
                    error
                );

                button.disabled =
                    false;

                button.textContent =
                    currentlyFeatured
                        ? "Remove Featured"
                        : "Mark Featured";

            }

        }
    );

}

filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                blindReactionArchiveFilter =
                    button.dataset.filter ||
                    "all";

                filterButtons.forEach(
                    function (otherButton) {

                        otherButton.classList.toggle(
                            "is-active",
                            otherButton === button
                        );

                    }
                );

                renderBlindReactionArchive();

            }
        );

    }
);

if (
    drawButton &&
    drawResult &&
    drawSubmittedBy &&
    drawQuestion &&
    drawMessage
) {

    drawButton.addEventListener(
        "click",
        async function () {

            drawButton.disabled =
                true;

            drawButton.textContent =
                "Drawing...";

            drawMessage.textContent =
                "";

                if (drawAnotherButton) {

    drawAnotherButton.hidden =
        true;

}

            drawResult.hidden =
    true;

try {

                const response =
                    await Database
                        .drawBlindReactionQuestion();

                if (
                    !response ||
                    response.success !== true
                ) {

                    throw new Error(
                        response?.error ||
                        "A question could not be drawn."
                    );

                }

                if (
                    !response.question
                ) {

                    drawMessage.textContent =
                        response.message ||
                        "The Blind Reactions bucket is empty.";

                    return;

                }

                currentBlindReactionQuestionId =
    response.question.questionId || "";

                drawSubmittedBy.textContent =
                    response.question.submittedBy
                        ? "Submitted by " +
                          response.question.submittedBy
                        : "";

                drawQuestion.textContent =
                    response.question.question;

                drawResult.hidden =
                    false;

            }
            catch (error) {

                console.error(
                    "Blind Reactions Draw Error:",
                    error
                );

                drawMessage.textContent =
                    error?.message ||
                    "A question could not be drawn.";

            }
            finally {

                drawButton.disabled =
                    false;

                drawButton.textContent =
                    "Draw a Question";

            }

        }
    );

}

if (
    returnQuestionButton &&
    drawResult &&
    answerInput &&
    drawMessage
) {

    returnQuestionButton.addEventListener(
        "click",
        function () {

            currentBlindReactionQuestionId =
                "";

            answerInput.value =
                "";

            drawResult.hidden =
                true;

            if (drawAnotherButton) {

                drawAnotherButton.hidden =
                    true;

            }

            drawMessage.textContent =
                "Question returned to the bucket.";

        }
    );

}

if (
    drawAnotherButton &&
    drawButton
) {

    drawAnotherButton.addEventListener(
        "click",
        function () {

            drawAnotherButton.hidden =
                true;

            drawMessage.textContent =
                "";

            drawButton.click();

        }
    );

}

if (
    saveAnswerButton &&
    answerInput &&
    drawMessage
) {

    saveAnswerButton.addEventListener(
        "click",
        async function () {

            const answer =
                answerInput.value.trim();

            if (
                !currentBlindReactionQuestionId
            ) {

                drawMessage.textContent =
                    "Draw a question before saving a reaction.";

                return;

            }

            if (!answer) {

                drawMessage.textContent =
                    "Please enter your reaction.";

                return;

            }

            saveAnswerButton.disabled =
                true;

            saveAnswerButton.textContent =
                "Saving...";

            drawMessage.textContent =
                "";

            try {

                const response =
                    await Database
                        .saveBlindReactionAnswer({
                            questionId:
                                currentBlindReactionQuestionId,
                            answer:
                                answer
                        });

                if (
                    !response ||
                    response.success !== true
                ) {

                    throw new Error(
                        response?.error ||
                        "The reaction could not be saved."
                    );

                }

                drawMessage.textContent =
                    "Your Blind Reaction was saved.";

                currentBlindReactionQuestionId =
                    "";

                answerInput.value =
                    "";

                drawResult.hidden =
                    true;

                    if (drawAnotherButton) {

    drawAnotherButton.hidden =
        false;

}

await initializeBlindReactionDrawAccess();

await loadBlindReactionArchive();

            }
            catch (error) {

                console.error(
                    "Blind Reactions Save Error:",
                    error
                );

                drawMessage.textContent =
                    error?.message ||
                    "The reaction could not be saved.";

            }
            finally {

                saveAnswerButton.disabled =
                    false;

                saveAnswerButton.textContent =
                    "Save Reaction";

            }

        }
    );

}

    if (
        !form ||
        !questionInput ||
        !anonymousInput ||
        !submitButton ||
        !message
    ) {

        return;

    }

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const question =
                questionInput.value.trim();

            if (!question) {

                message.textContent =
                    "Please enter a question.";

                return;

            }

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Submitting...";

            message.textContent =
                "";

            try {

                const response =
                    await Database
                        .submitBlindReactionQuestion({
                            question:
                                question,
                            anonymous:
                                anonymousInput.checked
                        });

                if (
                    !response ||
                    response.success !== true
                ) {

                    throw new Error(
                        response?.error ||
                        "The question could not be submitted."
                    );

                }

                form.reset();

                message.textContent =
                    "Your question was tossed into the Blind Reactions bucket.";

                    await initializeBlindReactionDrawAccess();
                    
            }
            catch (error) {

                console.error(
                    "Blind Reactions Submit Error:",
                    error
                );

                message.textContent =
                    error?.message ||
                    "The question could not be submitted.";

            }
            finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Question";

            }

        }
    );

})();