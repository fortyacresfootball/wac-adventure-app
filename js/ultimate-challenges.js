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

        getChallengeProgressHtml(challengeId, completed, total, percent) {

                    if (challengeId === "UC-BIRD") {

            const birdTasks = this.getTasks().filter(task =>
                String(task["Challenge ID"] || "").trim() === challengeId
            );

            const completedIds =
                this.getCompletedTaskIds(challengeId);

            const speciesCategories = new Set([
                "Backyard and Common Birds",
                "Woodland and Forest Birds",
                "Waterfowl Wetlands and Shorebirds",
                "Raptors and Owls",
                "Warblers and Migratory Songbirds",
                "Michigan Specialty"
            ]);

            const experienceCategories = new Set([
                "Backyard Birding and Identification",
                "Bird Behavior and Natural History",
                "Advanced Birding and Conservation"
            ]);

            const countCompleted = categories => {

                const ids = new Set(
                    birdTasks
                        .filter(task =>
                            categories.has(
                                String(task["Category"] || "").trim()
                            )
                        )
                        .map(task =>
                            String(task["Task ID"] || "").trim()
                        )
                        .filter(Boolean)
                );

                return [...ids].filter(id =>
                    completedIds.has(id)
                ).length;

            };

            const species =
                countCompleted(speciesCategories);

            const specialties =
                countCompleted(new Set(["Michigan Specialty"]));

            const experiences =
                countCompleted(experienceCategories);

            const requirementsMet =
                species >= 75 &&
                specialties >= 3 &&
                experiences >= 3;

            return `
                <div>
                    <strong>Bird species identified:</strong>
                    ${species} / 75 required
                    ${species >= 75 ? "— Met" : ""}
                </div>

                <div>
                    <strong>Michigan Specialty species:</strong>
                    ${specialties} / 3 required
                    ${specialties >= 3 ? "— Met" : ""}
                </div>

                <div>
                    <strong>Birdwatching experiences:</strong>
                    ${experiences} / 3 required
                    ${experiences >= 3 ? "— Met" : ""}
                </div>

                <div>
                    <strong>
                        ${
                            requirementsMet
                                ? "Challenge requirements met"
                                : "Challenge requirements not yet met"
                        }
                    </strong>
                </div>

                <small>
                    Michigan Specialty species also count
                    toward the 75-species requirement.
                </small>
            `;

        }

                    if (challengeId === "UC-BOOKS") {

            const bookTasks = this.getTasks().filter(task =>
                String(task["Challenge ID"] || "").trim() === challengeId
            );

            const completedIds =
                this.getCompletedTaskIds(challengeId);

            const achievementIds = new Set(
                bookTasks
                    .filter(task =>
                        String(task["Category"] || "").trim() ===
                        "Reading Achievements"
                    )
                    .map(task =>
                        String(task["Task ID"] || "").trim()
                    )
                    .filter(Boolean)
            );

            const bookIds = new Set(
                bookTasks
                    .filter(task =>
                        String(task["Category"] || "").trim() !==
                        "Reading Achievements"
                    )
                    .map(task =>
                        String(task["Task ID"] || "").trim()
                    )
                    .filter(Boolean)
            );

            const booksRead = [...bookIds].filter(id =>
                completedIds.has(id)
            ).length;

            const achievements = [...achievementIds].filter(id =>
                completedIds.has(id)
            ).length;

            const requirementsMet =
                booksRead >= 75 && achievements >= 5;

            return `
                <div>
                    <strong>Listed books read:</strong>
                    ${booksRead} / 75 required
                    ${booksRead >= 75 ? "— Met" : ""}
                </div>

                <div>
                    <strong>Reading achievements:</strong>
                    ${achievements} / 5 required
                    ${achievements >= 5 ? "— Met" : ""}
                </div>

                <div>
                    <strong>
                        ${
                            requirementsMet
                                ? "Challenge requirements met"
                                : "Challenge requirements not yet met"
                        }
                    </strong>
                </div>

                <small>
                    Listed-book progress only.
                    Approved substitute tracking is not available yet.
                </small>
            `;

        }

                    if (challengeId === "UC-ANIMAL") {

            const animalTasks = this.getTasks().filter(task =>
                String(task["Challenge ID"] || "").trim() === challengeId
            );

            const completedIds =
                this.getCompletedTaskIds(challengeId);

            const categoryIds = category => new Set(
                animalTasks
                    .filter(task =>
                        String(task["Category"] || "").trim() === category
                    )
                    .map(task =>
                        String(task["Task ID"] || "").trim()
                    )
                    .filter(Boolean)
            );

            const countCompleted = ids =>
                [...ids].filter(id => completedIds.has(id)).length;

            const coreIds = categoryIds("Core");
            const core = countCompleted(coreIds);

            const encounters =
                countCompleted(categoryIds("Animal Encounter"));

            const wildlife =
                countCompleted(categoryIds("Michigan Wildlife Task"));

            const coreMet =
                coreIds.size === 30 && core === 30;

            const requirementsMet =
                coreMet &&
                encounters >= 5 &&
                wildlife >= 5;

            return `
                <div>
                    <strong>Core destinations:</strong>
                    ${core} / 30 required
                    ${coreMet ? "— Met" : ""}
                </div>

                <div>
                    <strong>Animal encounters:</strong>
                    ${encounters} / 5 required
                    ${encounters >= 5 ? "— Met" : ""}
                </div>

                <div>
                    <strong>Michigan wildlife tasks:</strong>
                    ${wildlife} / 5 required
                    ${wildlife >= 5 ? "— Met" : ""}
                </div>

                <div>
                    <strong>
                        ${
                            requirementsMet
                                ? "Challenge requirements met"
                                : "Challenge requirements not yet met"
                        }
                    </strong>
                </div>
            `;

        }

                    if (challengeId === "UC-FOOD") {

            const foodTasks = this.getTasks().filter(task =>
                String(task["Challenge ID"] || "").trim() === challengeId
            );

            const completedIds =
                this.getCompletedTaskIds(challengeId);

            const countCategory = category => {

                const ids = new Set(
                    foodTasks
                        .filter(task =>
                            String(task["Category"] || "").trim() === category
                        )
                        .map(task =>
                            String(task["Task ID"] || "").trim()
                        )
                        .filter(Boolean)
                );

                return [...ids].filter(id =>
                    completedIds.has(id)
                ).length;

            };

            const destinations =
                countCategory("Restaurant Destinations");

            const specialties =
                countCategory("Michigan Specialty Foods");

            const eatingAttempts =
                countCategory("Restaurant Eating Challenges");

            const requirementsMet =
                destinations >= 75 &&
                specialties >= 8 &&
                eatingAttempts >= 3;

            return `
                <div>
                    <strong>Food destinations:</strong>
                    ${destinations} / 75 required
                    ${destinations >= 75 ? "— Met" : ""}
                </div>

                <div>
                    <strong>Specialty-food experiences:</strong>
                    ${specialties} / 8 required
                    ${specialties >= 8 ? "— Met" : ""}
                </div>

                <div>
                    <strong>Eating-challenge attempts:</strong>
                    ${eatingAttempts} / 3 required
                    ${eatingAttempts >= 3 ? "— Met" : ""}
                </div>

                <div>
                    <strong>
                        ${
                            requirementsMet
                                ? "Challenge requirements met"
                                : "Challenge requirements not yet met"
                        }
                    </strong>
                </div>
            `;

        }

        if (challengeId !== "UC-MOVIES") {
            return `${completed} of ${total} Complete · ${percent}%`;
        }

        const tasks = this.getTasks().filter(task =>
            String(task["Challenge ID"] || "").trim() === challengeId
        );

        const completedIds =
            this.getCompletedTaskIds(challengeId);

        const movieIds = new Set(
            tasks
                .map(task => String(task["Task ID"] || "").trim())
                .filter(id => /^MOVIE-\d{3}$/.test(id))
        );

        const filmsWatched = [...movieIds].filter(id =>
            completedIds.has(id)
        ).length;

        const experienceExists = tasks.some(task =>
            String(task["Task ID"] || "").trim() === "MOVIE-EXP-001"
        );

        const experienceComplete =
            experienceExists &&
            completedIds.has("MOVIE-EXP-001");

        const requirementsMet =
            filmsWatched >= 450 && experienceComplete;

        return `
            <div>
                <strong>Listed films watched:</strong>
                ${filmsWatched} / 450 required
                ${filmsWatched >= 450 ? "— Met" : ""}
            </div>

            <div>
                <strong>Paul’s favorites experience:</strong>
                ${
                    !experienceExists
                        ? "Task missing"
                        : experienceComplete
                            ? "Complete"
                            : "Outstanding"
                }
            </div>

            <div>
                <strong>
                    ${
                        requirementsMet
                            ? "Challenge requirements met"
                            : "Challenge requirements not yet met"
                    }
                </strong>
            </div>

            <small>
                Listed-film progress only.
                Substitute tracking is not available yet.
            </small>
        `;

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
                            ${this.getChallengeProgressHtml(challengeId, completed, total, percent)}
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
    ${this.getChallengeProgressHtml(challengeId, completed, total, percent)}
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

if (
    challengeId === "UC-MOVIES" ||
    challengeId === "UC-FOOD" ||
    challengeId === "UC-ANIMAL" ||
    challengeId === "UC-BOOKS" ||
    challengeId === "UC-BIRD"
) {

                                        const progressBox =
                                            container.querySelector(
                                                ".ultimate-challenge-detail .ultimate-challenge-progress"
                                            );

                                        if (progressBox) {
                                            progressBox.innerHTML =
                                                this.getChallengeProgressHtml(challengeId);
                                        }

                                    }

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