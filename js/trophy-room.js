const TrophyRoom = {

    trophies: [],
    activeCategory: "All",

    categoryOrder: [
        "All",
        "Big Game",
        "Small Game",
        "Waterfowl",
        "Fishing",
        "Turkey",
        "Upland",
        "Other"
    ],

    async init() {

        try {

            //-------------------------------------------------
            // Load Trophies from Google Spreadsheet
            //-------------------------------------------------

            const data =
                await Database.getTrophies();

            this.trophies =
                Array.isArray(data)
                    ? data.filter(
                        item => {

                            const activeValue =
                                String(
                                    item["Active"] ?? ""
                                )
                                    .trim()
                                    .toLowerCase();

                            // Blank Active values remain visible.
                            if (activeValue === "") {
                                return true;
                            }

                            // These values hide the trophy.
                            return ![
                                "false",
                                "no",
                                "n",
                                "0",
                                "inactive"
                            ].includes(
                                activeValue
                            );

                        }
                    )
                    : [];

            this.renderFilters();
            this.render();

        } catch (error) {

            console.error(
                "Trophy Room load error:",
                error
            );

            this.showError();
        }
    },


    /* ==========================================
       FILTERS
    ========================================== */

    renderFilters() {

        const container =
            document.getElementById(
                "trophyFilters"
            );

        if (!container) {
            return;
        }

        const categories =
            new Set(
                this.trophies
                    .map(
                        item =>
                            String(
                                item["Category"] || ""
                            ).trim()
                    )
                    .filter(Boolean)
            );

        const availableCategories =
            this.categoryOrder.filter(
                category =>
                    category === "All" ||
                    categories.has(category)
            );

        categories.forEach(
            category => {

                if (
                    category &&
                    !availableCategories.includes(
                        category
                    )
                ) {

                    availableCategories.push(
                        category
                    );
                }

            }
        );

        container.innerHTML =
            availableCategories
                .map(
                    category => {

                        const active =
                            category ===
                            this.activeCategory
                                ? "active"
                                : "";

                        return `
                            <button
                                type="button"
                                class="trophy-filter ${active}"
                                data-trophy-category="${this.escapeAttribute(category)}"
                            >
                                ${this.escapeHTML(category)}
                            </button>
                        `;

                    }
                )
                .join("");

        container
            .querySelectorAll(
                "[data-trophy-category]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            this.activeCategory =
                                button.dataset
                                    .trophyCategory;

                            this.renderFilters();
                            this.render();
                        }
                    );

                }
            );
    },


    /* ==========================================
       MAIN RENDER
    ========================================== */

    render() {

        const list =
            document.getElementById(
                "trophyList"
            );

        const count =
            document.getElementById(
                "trophyCount"
            );

        if (!list) {
            return;
        }

        const filtered =
            this.activeCategory === "All"
                ? this.trophies
                : this.trophies.filter(
                    item =>
                        String(
                            item["Category"] || ""
                        ).trim() ===
                        this.activeCategory
                );

        if (count) {

            const word =
                filtered.length === 1
                    ? "Trophy"
                    : "Trophies";

            count.textContent =
                `${filtered.length} ${word}`;
        }

        if (filtered.length === 0) {

            list.innerHTML =
                this.emptyState();

            return;
        }

        list.innerHTML =
            filtered
                .map(
                    item =>
                        this.createTrophyCard(
                            item
                        )
                )
                .join("");

        this.bindAdventureButtons();
    },


    /* ==========================================
       TROPHY CARD
    ========================================== */

    createTrophyCard(item) {

        const title =
            this.escapeHTML(
                item["Title"] ||
                "WAC Trophy"
            );

        const category =
            this.escapeHTML(
                item["Category"] ||
                "Other"
            );

        const species =
            this.escapeHTML(
                item["Species"] ||
                ""
            );

        const date =
            this.escapeHTML(
                item["Date"] ||
                ""
            );

        const location =
            this.escapeHTML(
                item["Location"] ||
                ""
            );

        const hunter =
            this.escapeHTML(
                item["Hunter"] ||
                ""
            );

        const story =
            this.escapeHTML(
                item["Story"] ||
                ""
            );

        const image =
            this.escapeAttribute(
                item["Image"] ||
                "assets/icons/wac-icon.png"
            );

        const adventureId =
            String(
                item["AdventureID"] ||
                ""
            ).trim();


        //-------------------------------------------------
        // Metadata
        //-------------------------------------------------

        let metadata = "";

        if (location) {

            metadata += `
                <span class="trophy-meta-item">
                    <strong>Location:</strong>
                    ${location}
                </span>
            `;
        }

        if (hunter) {

            metadata += `
                <span class="trophy-meta-item">
                    <strong>Hunter:</strong>
                    ${hunter}
                </span>
            `;
        }


        //-------------------------------------------------
        // Trophy Details
        //-------------------------------------------------

        let details = "";

        const rawDetails =
            String(
                item["Details"] ||
                ""
            ).trim();

        if (rawDetails) {

            const detailItems =
                rawDetails
                    .split("|")
                    .map(
                        detail =>
                            detail.trim()
                    )
                    .filter(Boolean);

            if (detailItems.length) {

                details = `
                    <div class="trophy-details">

                        ${detailItems
                            .map(
                                detail => `
                                    <span class="trophy-detail">
                                        ${this.escapeHTML(detail)}
                                    </span>
                                `
                            )
                            .join("")}

                    </div>
                `;
            }
        }


        //-------------------------------------------------
        // Related Adventure Button
        //-------------------------------------------------

        let adventureButton = "";

        if (adventureId) {

            adventureButton = `
                <div class="trophy-adventure">

                    <button
                        type="button"
                        data-trophy-adventure="${this.escapeAttribute(adventureId)}"
                    >
                        View Related Adventure
                    </button>

                </div>
            `;
        }


        //-------------------------------------------------
        // Build Card
        //-------------------------------------------------

        return `
            <article class="trophy-card">

                <div class="trophy-photo-wrap">

                    <img
                        class="trophy-photo"
                        src="${image}"
                        alt="${title}"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.src='assets/icons/wac-icon.png';
                        "
                    >

                    <span class="trophy-category-badge">
                        ${category}
                    </span>

                </div>


                <div class="trophy-story">

                    ${
                        date
                            ? `
                                <div class="trophy-date">
                                    ${date}
                                </div>
                            `
                            : ""
                    }

                    <h2 class="trophy-title">
                        ${title}
                    </h2>

                    ${
                        species
                            ? `
                                <div class="trophy-species">
                                    ${species}
                                </div>
                            `
                            : ""
                    }

                    ${
                        metadata
                            ? `
                                <div class="trophy-meta">
                                    ${metadata}
                                </div>
                            `
                            : ""
                    }

                    <p class="trophy-story-text">
                        ${story}
                    </p>

                    ${details}

                    ${adventureButton}

                </div>

            </article>
        `;
    },


    /* ==========================================
       RELATED ADVENTURE BUTTONS
    ========================================== */

    bindAdventureButtons() {

        document
            .querySelectorAll(
                "[data-trophy-adventure]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const adventureId =
                                String(
                                    button.dataset
                                        .trophyAdventure ||
                                    ""
                                ).trim();

                            if (!adventureId) {
                                return;
                            }

                            if (
                                typeof Database ===
                                    "undefined" ||
                                typeof Database
                                    .getAdventures !==
                                    "function"
                            ) {
                                return;
                            }

                            try {

                                const adventures =
                                    await Database
                                        .getAdventures();

                                const adventure =
                                    adventures.find(
                                        item =>
                                            String(
                                                item["ID"] ||
                                                ""
                                            ).trim() ===
                                            adventureId
                                    );

                                if (
                                    adventure &&
                                    typeof Drawer !==
                                        "undefined" &&
                                    typeof Drawer.open ===
                                        "function"
                                ) {

                                    Drawer.open(
                                        adventure
                                    );
                                }

                            } catch (error) {

                                console.error(
                                    "Unable to open related adventure:",
                                    error
                                );
                            }

                        }
                    );

                }
            );
    },


    /* ==========================================
       EMPTY STATE
    ========================================== */

    emptyState() {

        return `
            <div class="trophy-empty">

                <div class="trophy-empty-icon">
                    🦌
                </div>

                <h2>
                    The Trophy Room Is Ready
                </h2>

                <p>
                    No trophies have been added yet.
                    Hunting successes, memorable catches,
                    photographs, and their stories will
                    appear here.
                </p>

            </div>
        `;
    },


    /* ==========================================
       ERROR STATE
    ========================================== */

    showError() {

        const list =
            document.getElementById(
                "trophyList"
            );

        const count =
            document.getElementById(
                "trophyCount"
            );

        if (count) {

            count.textContent =
                "Unable to load";
        }

        if (!list) {
            return;
        }

        list.innerHTML = `
            <div class="trophy-empty">

                <div class="trophy-empty-icon">
                    ⚠️
                </div>

                <h2>
                    Trophy Room Could Not Load
                </h2>

                <p>
                    The Trophy Room could not retrieve
                    information from the WAC database.
                </p>

            </div>
        `;
    },


    /* ==========================================
       SECURITY / DISPLAY HELPERS
    ========================================== */

    escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    },


    escapeAttribute(value) {

        return this.escapeHTML(
            value
        );
    }

};


/* ==========================================
   START PAGE
========================================== */

TrophyRoom.init();