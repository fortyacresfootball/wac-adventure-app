// ======================================
// WAC Cabin Opening Checklist
// Version 1.0
// ======================================

(async function () {

    //--------------------------------------------------
    // Checklist Steps
    //--------------------------------------------------

    const checklistSteps = [

        {
            title:
                "Locate the Cabin Keys",

            instructions: `
                <p>
                    Find the extra set of cabin keys hidden at the property.
                </p>
            `,

            notice:
                "Contact the President if you do not know where the keys are located."
        },

        {
            title:
                "Enter and Disable the Alarm",

            instructions: `
                <ol>
                    <li>
                        Unlock and enter through the front door.
                    </li>

                    <li>
                        Go to the laundry room, located to the left of the kitchen.
                    </li>

                    <li>
                        Enter the alarm code and turn off the alarm.
                    </li>
                </ol>
            `,

            notice:
                "Get the alarm code from the President. Do not repeatedly guess at the code."
        },

        {
            title:
                "Turn On the Water",

            instructions: `
                <ol>
                    <li>
                        Go outside to the front of the cabin.
                    </li>

                    <li>
                        Locate the access panel to the left of the deck.
                    </li>

                    <li>
                        Open the access panel.
                    </li>

                    <li>
                        Find the water-valve handle hanging inside on the left.
                        You may need to reach inside to feel it.
                    </li>

                    <li>
                        Use the handle to turn on the water.
                    </li>
                </ol>
            `,

            notice:
                "During winter, make sure the lightbulb inside the access area is working and remains on to prevent freezing. Replace the bulb if it is burned out."
        },

        {
            title:
                "Turn On the Water Pump",

            instructions: `
                <ol>
                    <li>
                        Walk to the utility pole near the left rear of the cabin.
                    </li>

                    <li>
                        Locate and open the gray electrical box.
                    </li>

                    <li>
                        Turn on both marked pump switches.
                    </li>
                </ol>
            `,

            notice:
                "The two marked pump switches should be the only switches currently turned off."
        },

        {
            title:
                "Turn On the Water Heater",

            instructions: `
                <ol>
                    <li>
                        Return inside the cabin.
                    </li>

                    <li>
                        Go to the back bedroom.
                    </li>

                    <li>
                        Locate the electrical panel behind the door.
                    </li>

                    <li>
                        Find the two red switches.
                    </li>

                    <li>
                        Turn both red switches on.
                    </li>
                </ol>
            `,

            notice:
                "The two red switches should be the only switches currently in the off position."
        },

        {
            title:
                "Set the Heat When Needed",

            instructions: `
                <ol>
                    <li>
                        Locate the thermostat near the front door.
                    </li>

                    <li>
                        During cold weather, set the heat to a comfortable temperature.
                    </li>
                </ol>
            `,

            notice:
                "When leaving the WAC, return the thermostat to 50°F."
        },

        {
            title:
                "Open the Garage",

            instructions: `
                <p>
                    Open the garage when access is needed.
                </p>

                <p>
                    The garage-door keys and keys for the recreational equipment
                    are hidden inside the garage.
                </p>
            `,

            notice:
                "Contact the President if you do not know where the garage or equipment keys are stored."
        },

        {
            title:
                "Unlock Equipment Before Moving It",

            instructions: `
                <ol>
                    <li>
                        Locate all chains and locks securing the recreational equipment.
                    </li>

                    <li>
                        Completely unlock and remove the chains.
                    </li>

                    <li>
                        Confirm nothing remains attached before moving any equipment.
                    </li>
                </ol>
            `,

            notice:
                "Never attempt to pull equipment from the garage while it is still chained or locked."
        }

    ];

    //--------------------------------------------------
    // Member Information
    //--------------------------------------------------

    const member =
        typeof AuthService !== "undefined"
            ? AuthService.getCurrentMember()
            : null;

    const memberId =
        String(
            member?.["Member ID"] ||
            "guest"
        ).trim();

    const memberName =
        String(
            member?.["Display Name"] ||
            member?.["First Name"] ||
            "WAC Member"
        ).trim();

    //--------------------------------------------------
    // Storage Key
    //--------------------------------------------------

    const storageKey =
        `wac-cabin-opening-${memberId}`;

    //--------------------------------------------------
    // State
    //--------------------------------------------------

    let currentStepIndex = 0;

    let completedSteps =
        new Array(
            checklistSteps.length
        ).fill(false);

    //--------------------------------------------------
    // Elements
    //--------------------------------------------------

    const stepCounter =
        document.getElementById(
            "cabinStepCounter"
        );

    const progressPercent =
        document.getElementById(
            "cabinProgressPercent"
        );

    const progressFill =
        document.getElementById(
            "cabinProgressFill"
        );

    const stepCard =
        document.getElementById(
            "cabinStepCard"
        );

    const stepTitle =
        document.getElementById(
            "cabinStepTitle"
        );

    const stepInstructions =
        document.getElementById(
            "cabinStepInstructions"
        );

    const stepNotice =
        document.getElementById(
            "cabinStepNotice"
        );

    const stepComplete =
        document.getElementById(
            "cabinStepComplete"
        );

    const previousButton =
        document.getElementById(
            "previousCabinStep"
        );

    const nextButton =
        document.getElementById(
            "nextCabinStep"
        );

    const exitButton =
        document.getElementById(
            "exitCabinChecklist"
        );

    const reviewSection =
        document.getElementById(
            "cabinReviewSection"
        );

    const reviewList =
        document.getElementById(
            "cabinReviewList"
        );

    const returnToChecklistButton =
        document.getElementById(
            "returnToChecklist"
        );

    const finishButton =
        document.getElementById(
            "finishCabinChecklist"
        );

    const completionSection =
        document.getElementById(
            "cabinCompletionSection"
        );

    const completionDetails =
        document.getElementById(
            "cabinCompletionDetails"
        );

    const returnToAdventuresButton =
        document.getElementById(
            "returnToAdventures"
        );

    //--------------------------------------------------
    // Load Saved Progress
    //--------------------------------------------------

    function loadSavedProgress() {

        try {

            const savedValue =
                localStorage.getItem(
                    storageKey
                );

            if (!savedValue) {

                return;

            }

            const savedState =
                JSON.parse(
                    savedValue
                );

            if (
                Array.isArray(
                    savedState.completedSteps
                ) &&
                savedState.completedSteps.length ===
                    checklistSteps.length
            ) {

                completedSteps =
                    savedState.completedSteps.map(
                        Boolean
                    );

            }

            const savedStep =
                Number(
                    savedState.currentStepIndex
                );

            if (
                Number.isInteger(savedStep) &&
                savedStep >= 0 &&
                savedStep <
                    checklistSteps.length
            ) {

                currentStepIndex =
                    savedStep;

            }

        }

        catch (error) {

            console.warn(
                "Unable to load the saved cabin checklist.",
                error
            );

        }

    }

    //--------------------------------------------------
    // Save Progress
    //--------------------------------------------------

    function saveProgress() {

        try {

            localStorage.setItem(
                storageKey,
                JSON.stringify({

                    currentStepIndex:
                        currentStepIndex,

                    completedSteps:
                        completedSteps,

                    updatedAt:
                        new Date().toISOString()

                })
            );

        }

        catch (error) {

            console.warn(
                "Unable to save cabin checklist progress.",
                error
            );

        }

    }

    //--------------------------------------------------
    // Calculate Completion
    //--------------------------------------------------

    function getCompletedCount() {

        return completedSteps.filter(
            Boolean
        ).length;

    }

    //--------------------------------------------------
    // Update Progress Display
    //--------------------------------------------------

    function updateProgress() {

        const completedCount =
            getCompletedCount();

        const percent =
            Math.round(
                (
                    completedCount /
                    checklistSteps.length
                ) * 100
            );

        stepCounter.textContent =
            `Step ${currentStepIndex + 1} of ${checklistSteps.length}`;

        progressPercent.textContent =
            `${percent}% Complete`;

        progressFill.style.width =
            `${percent}%`;

    }

    //--------------------------------------------------
    // Render Current Step
    //--------------------------------------------------

    function renderStep() {

        const step =
            checklistSteps[
                currentStepIndex
            ];

        stepCard.hidden =
            false;

        reviewSection.hidden =
            true;

        completionSection.hidden =
            true;

        stepTitle.textContent =
            step.title;

        stepInstructions.innerHTML =
            step.instructions;

        if (step.notice) {

            stepNotice.textContent =
                step.notice;

            stepNotice.hidden =
                false;

        } else {

            stepNotice.textContent =
                "";

            stepNotice.hidden =
                true;

        }

        stepComplete.checked =
            completedSteps[
                currentStepIndex
            ];

        previousButton.disabled =
            currentStepIndex === 0;

        nextButton.textContent =
            currentStepIndex ===
                checklistSteps.length - 1
                ? "Review Checklist"
                : "Next Step";

        updateProgress();
        saveProgress();

    }

    //--------------------------------------------------
    // Render Review
    //--------------------------------------------------

    function renderReview() {

        stepCard.hidden =
            true;

        reviewSection.hidden =
            false;

        completionSection.hidden =
            true;

        reviewList.innerHTML =
            "";

        checklistSteps.forEach(
            (step, index) => {

                const complete =
                    completedSteps[index];

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    `cabin-review-item ${
                        complete
                            ? "complete"
                            : "incomplete"
                    }`;

                item.innerHTML = `

                    <span class="cabin-review-status">

                        ${
                            complete
                                ? "✓"
                                : "!"
                        }

                    </span>

                    <span>

                        ${index + 1}. ${step.title}

                    </span>

                `;

                reviewList.appendChild(
                    item
                );

            }
        );

        const allComplete =
            completedSteps.every(
                Boolean
            );

        finishButton.disabled =
            !allComplete;

        finishButton.textContent =
            allComplete
                ? "Finish Opening Checklist"
                : "Complete All Steps to Finish";

        updateProgress();
        saveProgress();

        reviewSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

    //--------------------------------------------------
    // Finish Checklist
    //--------------------------------------------------

    function finishChecklist() {

        if (
            !completedSteps.every(
                Boolean
            )
        ) {

            alert(
                "All cabin-opening steps must be completed before finishing the checklist."
            );

            return;

        }

        const completedAt =
            new Date();

        const formattedDate =
            completedAt.toLocaleString(
                "en-US",
                {

                    dateStyle:
                        "medium",

                    timeStyle:
                        "short"

                }
            );

        localStorage.removeItem(
            storageKey
        );

        stepCard.hidden =
            true;

        reviewSection.hidden =
            true;

        completionSection.hidden =
            false;

        completionDetails.textContent =
            `Completed by ${memberName} on ${formattedDate}.`;

        completionSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

    //--------------------------------------------------
    // Previous Step
    //--------------------------------------------------

    previousButton.addEventListener(
        "click",
        () => {

            if (currentStepIndex > 0) {

                currentStepIndex -= 1;

                renderStep();

            }

        }
    );

    //--------------------------------------------------
    // Next Step
    //--------------------------------------------------

    nextButton.addEventListener(
        "click",
        () => {

            completedSteps[
                currentStepIndex
            ] =
                stepComplete.checked;

            saveProgress();

            if (
                currentStepIndex <
                checklistSteps.length - 1
            ) {

                currentStepIndex += 1;

                renderStep();

                return;

            }

            renderReview();

        }
    );

    //--------------------------------------------------
    // Completion Checkbox
    //--------------------------------------------------

    stepComplete.addEventListener(
        "change",
        () => {

            completedSteps[
                currentStepIndex
            ] =
                stepComplete.checked;

            updateProgress();
            saveProgress();

        }
    );

    //--------------------------------------------------
    // Return From Review
    //--------------------------------------------------

    returnToChecklistButton.addEventListener(
        "click",
        () => {

            const firstIncompleteStep =
                completedSteps.findIndex(
                    (complete) =>
                        !complete
                );

            if (
                firstIncompleteStep !== -1
            ) {

                currentStepIndex =
                    firstIncompleteStep;

            }

            renderStep();

        }
    );

    //--------------------------------------------------
    // Finish Button
    //--------------------------------------------------

    finishButton.addEventListener(
        "click",
        finishChecklist
    );

    //--------------------------------------------------
    // Exit Checklist
    //--------------------------------------------------

    exitButton.addEventListener(
        "click",
        async () => {

            saveProgress();

            if (
                typeof WACRouter !==
                    "undefined"
            ) {

                await WACRouter.loadPage(
                    "home"
                );

            }

        }
    );

    //--------------------------------------------------
    // Return to Adventures
    //--------------------------------------------------

    returnToAdventuresButton.addEventListener(
        "click",
        async () => {

            if (
                typeof WACRouter !==
                    "undefined"
            ) {

                await WACRouter.loadPage(
                    "adventures"
                );

            }

        }
    );

    //--------------------------------------------------
    // Initial Render
    //--------------------------------------------------

    loadSavedProgress();
    renderStep();

})();