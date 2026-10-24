window.UltimateChallenges = {

    data: null,

    async init() {

        try {

            const response =
                await Database.getUltimateChallenges();

            this.data =
                response;

            console.log(
                "Ultimate Challenges loaded:",
                response
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

    renderChallengeList() {

        const container =
            document.getElementById(
                "ultimateChallengeList"
            );

        if (!container) {
            return;
        }

        const challenges =
            Array.isArray(
                this.data?.challenges
            )
                ? this.data.challenges
                : [];

        const tasks =
            Array.isArray(
                this.data?.tasks
            )
                ? this.data.tasks
                : [];

        const progress =
            Array.isArray(
                this.data?.progress
            )
                ? this.data.progress
                : [];

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
                    new Set(
                        progress
                            .filter(
                                item =>
                                    String(
                                        item[
                                            "Challenge ID"
                                        ] || ""
                                    ).trim() ===
                                        challengeId &&
                                    (
                                        item[
                                            "Completed"
                                        ] === true ||
                                        String(
                                            item[
                                                "Completed"
                                            ] || ""
                                        )
                                            .trim()
                                            .toLowerCase() ===
                                            "true"
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

                container.appendChild(
                    card
                );

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
            Array.isArray(
                this.data?.challenges
            )
                ? this.data.challenges
                : [];

        const tasks =
            Array.isArray(
                this.data?.tasks
            )
                ? this.data.tasks
                : [];

                const progress =
    Array.isArray(
        this.data?.progress
    )
        ? this.data.progress
        : [];

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
    new Set(
        progress
            .filter(
                item =>
                    String(
                        item["Challenge ID"] || ""
                    ).trim() === challengeId &&
                    (
                        item["Completed"] === true ||
                        String(
                            item["Completed"] || ""
                        )
                            .trim()
                            .toLowerCase() === "true"
                    )
            )
            .map(
                item =>
                    String(
                        item["Task ID"] || ""
                    ).trim()
            )
    );

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
                        ${challenge["Challenge Name"] || ""}
                    </h2>

                    <p>
                        ${challenge["Description"] || ""}
                    </p>

                    <p>
                        <strong>Rules:</strong>
                        ${challenge["Rules"] || ""}
                    </p>

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
                        task["Task ID"] || ""
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
                                ${task["Task Name"] || ""}
                            </strong>

                            <small>
                                ${task["Task Description"] || ""}
                            </small>
                        </span>
                    `;

                taskList.appendChild(
                    item
                );

                const checkbox =
                    item.querySelector(
                        "[data-task-id]"
                    );

                if (checkbox) {

                    checkbox.addEventListener(
                        "change",
                        async () => {

                            try {

                                await Database.saveUltimateChallengeProgress(
                                    challengeId,
                                    taskId,
                                    checkbox.checked
                                );

                                console.log(
                                    "Ultimate Challenge progress saved:",
                                    taskId,
                                    checkbox.checked
                                );

                            } catch (error) {

                                console.error(
                                    "Unable to save Ultimate Challenge progress:",
                                    error
                                );

                                checkbox.checked =
                                    !checkbox.checked;

                                alert(
                                    "Unable to save challenge progress."
                                );
                            }
                        }
                    );
                }
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
    }

};

UltimateChallenges.init();