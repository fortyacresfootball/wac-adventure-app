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

    const archive =
    document.getElementById(
        "blindReactionArchive"
    );

    const answerInput =
    document.getElementById(
        "blindReactionAnswer"
    );

const saveAnswerButton =
    document.getElementById(
        "saveBlindReactionAnswer"
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

            drawCard.hidden =
                false;

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

        if (!reactions.length) {

            archive.innerHTML =
                `
                    <div class="empty-state">
                        No Blind Reactions have been answered yet.
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
                                ? reaction.answeredDateTime
                                : "";

                        return `
                            <article class="blind-reaction-entry">

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

                            </article>
                        `;

                    }
                )
                .join("");

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