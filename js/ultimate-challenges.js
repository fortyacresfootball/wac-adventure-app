window.UltimateChallenges = {

    data: null,

    async init() {

        try {

            const response =
                await Database.getUltimateChallenges();

            this.data =
                response || {
                    challenges: [],
                    tasks: [],
                    progress: []
                };

            console.log(
                "Ultimate Challenges loaded:",
                this.data
            );

            this.renderChallengeList();

        } catch (error) {

            console.error(
                "Ultimate Challenges load error:",
                error
            );

            const container =
                document.getElementById(
                    "ultimateChallengeList"
                );

            if (container) {

                container.innerHTML =
                    `
                        <div class="ultimate-challenge-loading">
                            Unable to load Ultimate Challenges.
                        </div>
                    `;
            }
        }
    },

    getChallenges() {

        return Array.isArray(
            this.data?.challenges
        )
            ? this.data.challenges
            : [];
    },

    getTasks() {

        return Array.isArray(
            this.data?.tasks
        )
            ? this.data.tasks
            : [];
    },

    getProgress() {

        return Array.isArray(
            this.data?.progress
        )
            ? this.data.progress
            : [];
    },

    isProgressComplete(item) {

        return (
            item?.["Completed"] === true ||
            String(
                item?.["Completed"] || ""
            )
                .trim()
                .toLowerCase() === "true"
        );
    },

    getCompletedTaskIds(
        challengeId
    ) {

        return new Set(
            this.getProgress()
                .filter(
                    item =>
                        String(
                            item[
                                "Challenge ID"
                            ] || ""
                        ).trim() ===
                            challengeId &&
                        this.isProgressComplete(
                            item
                        )
                )
                .map(
                    item =>
                        String(
                            item[
                                "Task ID"
                            ] || ""
                        ).trim()
                )
        );
    },

    renderChallengeList() {

        const container =
            document.getElementById(
                "ultimateChallengeList"
            );

        if (!container) {
            return;
        }

        const challenges =
            this.getChallenges();

        const tasks =
            this.getTasks();

        const challengeCount =
            document.getElementById(
                "ultimateChallengesCount"
            );

        if (challengeCount) {

            challengeCount.textContent =
                challenges.length;
        }

        if (challenges.length === 0) {

            container.innerHTML =
                `
                    <div class="ultimate-challenge-loading">
                        No Ultimate Challenges are currently available.
                    </div>
                `;

            return;
        }

        container.innerHTML = "";

        challenges.forEach(
            challenge => {

                const challengeId =
                    String(
                        challenge[
                            "Challenge ID"
                        ] || ""
                    ).trim();

                const challengeName =
                    String(
                        challenge[
                            "Challenge Name"
                        ] || ""
                    ).trim();

                const description =
                    String(
                        challenge[
                            "Description"
                        ] || ""
                    ).trim();

                const challengeTasks =
                    tasks.filter(
                        task =>
                            String(
                                task[
                                    "Challenge ID"
                                ] || ""
                            ).trim() ===
                            challengeId
                    );

                const completedTaskIds =
                    this.getCompletedTaskIds(
                        challengeId
                    );

                const total =
                    challengeTasks.length;

                const completed =
                    challengeTasks.filter(
                        task =>
                            completedTaskIds.has(
                                String(
                                    task[
                                        "Task ID"
                                    ] || ""
                                ).trim()
                            )
                    ).length;

                const percent =
                    total > 0
                        ? Math.round(
                            (
                                completed /
                                total
                            ) *
                            100
                        )
                        : 0;

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "ultimate-challenge-card";

                card.innerHTML =
                    `
                        <h2>
                            ${challengeName}
                        </h2>

                        <p>
                            ${description}
                        </p>

                        <div class="ultimate-challenge-progress">
                            ${completed} of ${total} Complete
                            · ${percent}%
                        </div>

                        <button
                            type="button"
                            class="small-button"
                            data-challenge-id="${challengeId}"
                        >
                            Open Challenge
                        </button>
                    `;

                const openButton =
                    card.querySelector(
                        "[data-challenge-id]"
                    );

                if (openButton) {

                    openButton.addEventListener(
                        "click",
                        () => {

                            this.openChallenge(
                                challengeId
                            );
                        }
                    );
                }

                container.appendChild(
                    card
                );
            }
        );
    },

    openChallenge(
        challengeId
    ) {

        const container =
            document.getElementById(
                "ultimateChallengeList"
            );

        if (!container) {
            return;
        }

        const challenges =
            this.getChallenges();

        const tasks =
            this.getTasks();

        const challenge =
            challenges.find(
                item =>
                    String(
                        item[
                            "Challenge ID"
                        ] || ""
                    ).trim() ===
                    challengeId
            );

        if (!challenge) {

            container.innerHTML =
                `
                    <div class="ultimate-challenge-loading">
                        Challenge could not be found.
                    </div>
                `;

            return;
        }

        const challengeTasks =
            tasks.filter(
                task =>
                    String(
                        task[
                            "Challenge ID"
                        ] || ""
                    ).trim() ===
                    challengeId
            );

        const completedTaskIds =
            this.getCompletedTaskIds(
                challengeId
            );

            const total =
    challengeTasks.length;

const completed =
    challengeTasks.filter(
        task =>
            completedTaskIds.has(
                String(
                    task[
                        "Task ID"
                    ] || ""
                ).trim()
            )
    ).length;

const percent =
    total > 0
        ? Math.round(
            (
                completed /
                total
            ) *
            100
        )
        : 0;

        container.innerHTML =
            `
                <div class="ultimate-challenge-detail">

                    <button
                        type="button"
                        class="small-button"
                        id="ultimateChallengeBackButton"
                    >
                        ← All Challenges
                    </button>

                    <h2>
                        ${challenge[
                            "Challenge Name"
                        ] || ""}
                    </h2>

                    <p>
                        ${challenge[
                            "Description"
                        ] || ""}
                    </p>

                    <p>
                        <strong>Rules:</strong>
                        ${challenge[
                            "Rules"
                        ] || ""}
                    </p>

                    <div class="ultimate-challenge-progress">
    ${completed} of ${total} Complete
    · ${percent}%
</div>

                    <div
                        id="ultimateChallengeTaskList"
                    ></div>

                </div>
            `;

        const taskList =
            document.getElementById(
                "ultimateChallengeTaskList"
            );

        if (taskList) {

            challengeTasks.forEach(
                task => {

                    const taskId =
                        String(
                            task[
                                "Task ID"
                            ] || ""
                        ).trim();

                    const checked =
                        completedTaskIds.has(
                            taskId
                        );

                    const item =
                        document.createElement(
                            "label"
                        );

                    item.className =
                        "ultimate-challenge-task";

                    item.innerHTML =
                        `
                            <input
                                type="checkbox"
                                data-task-id="${taskId}"
                                ${checked ? "checked" : ""}
                            >

                            <span>
                                <strong>
                                    ${task[
                                        "Task Name"
                                    ] || ""}
                                </strong>

                                <small>
                                    ${task[
                                        "Task Description"
                                    ] || ""}
                                </small>
                            </span>
                        `;

                    const checkbox =
                        item.querySelector(
                            "[data-task-id]"
                        );

                    if (checkbox) {

                        checkbox.addEventListener(
                            "change",
                            async () => {

                                const requestedState =
                                    checkbox.checked;

                                checkbox.disabled =
                                    true;

                                try {

                                    const response =
                                        await Database.saveUltimateChallengeProgress(
                                            challengeId,
                                            taskId,
                                            requestedState
                                        );

                                    this.updateLocalProgress(
                                        challengeId,
                                        taskId,
                                        requestedState,
                                        response?.progress
                                    );

                                    console.log(
                                        "Ultimate Challenge progress saved:",
                                        taskId,
                                        requestedState
                                    );

                                } catch (error) {

                                    console.error(
                                        "Unable to save Ultimate Challenge progress:",
                                        error
                                    );

                                    checkbox.checked =
                                        !requestedState;

                                    alert(
                                        "Unable to save challenge progress."
                                    );

                                } finally {

                                    checkbox.disabled =
                                        false;
                                }
                            }
                        );
                    }

                    taskList.appendChild(
                        item
                    );
                }
            );
        }

        const backButton =
            document.getElementById(
                "ultimateChallengeBackButton"
            );

        if (backButton) {

            backButton.addEventListener(
                "click",
                () => {

                    this.renderChallengeList();
                }
            );
        }
    },

    updateLocalProgress(
        challengeId,
        taskId,
        completed,
        savedProgress
    ) {

        if (!Array.isArray(
            this.data?.progress
        )) {

            this.data.progress = [];
        }

        const existing =
            this.data.progress.find(
                item =>
                    String(
                        item[
                            "Challenge ID"
                        ] || ""
                    ).trim() ===
                        challengeId &&
                    String(
                        item[
                            "Task ID"
                        ] || ""
                    ).trim() ===
                        taskId
            );

        if (existing) {

            existing["Completed"] =
                completed;

            if (savedProgress) {

                Object.assign(
                    existing,
                    savedProgress
                );
            }

            return;
        }

        this.data.progress.push(
            savedProgress || {
                "Challenge ID": challengeId,
                "Task ID": taskId,
                "Completed": completed
            }
        );
    }

};

UltimateChallenges.init();