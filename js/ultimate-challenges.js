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
            }
        );
    }

};

UltimateChallenges.init();