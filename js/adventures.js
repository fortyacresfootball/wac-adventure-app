// ======================================
// WAC Adventure Explorer
// Version 5.2
// ======================================

(async function () {

    //-------------------------------------------------
    // Configuration
    //-------------------------------------------------

    const ADVENTURES_PER_PAGE = 25;

    let visibleAdventureCount =
        ADVENTURES_PER_PAGE;

    let currentFilteredAdventures = [];

    //-------------------------------------------------
    // Load Authenticated Member or Guest Mode
    //-------------------------------------------------

    const member =
        typeof AuthService !== "undefined"
            ? AuthService.getCurrentMember()
            : null;

    const memberId =
        String(
            member?.["Member ID"] || ""
        ).trim();

    await MemberState.load(
        memberId
    );

    //-------------------------------------------------
    // Load Adventures
    //-------------------------------------------------

    const allAdventures =
        await Database.getAdventures();

    //-------------------------------------------------
    // Active Adventure Filter
    //
    // Blank Active values remain visible.
    // FALSE, NO, 0, or INACTIVE hide the Adventure.
    //-------------------------------------------------

    const adventures =
        allAdventures.filter(
            (adventure) => {

                const activeValue =
                    String(
                        adventure["Active"] ?? ""
                    )
                        .trim()
                        .toLowerCase();

                if (activeValue === "") {

                    return true;

                }

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
        );

    //-------------------------------------------------
    // Page Elements
    //-------------------------------------------------

    const grid =
        document.getElementById(
            "adventureGrid"
        );

    const count =
        document.getElementById(
            "adventureCount"
        );

    const search =
        document.getElementById(
            "adventureSearch"
        );

    const category =
        document.getElementById(
            "categoryFilter"
        );

    const empty =
        document.getElementById(
            "adventureEmpty"
        );

    const quickGuideButton =
        document.getElementById(
            "openQuickGuide"
        );

    //-------------------------------------------------
    // Validate Required Elements
    //-------------------------------------------------

    if (
        !grid ||
        !count ||
        !search ||
        !category ||
        !empty
    ) {

        console.error(
            "The Adventure Explorer could not find all required page elements."
        );

        return;

    }

    //-------------------------------------------------
    // Create Load More Area
    //-------------------------------------------------

    const loadMoreContainer =
        document.createElement(
            "div"
        );

    loadMoreContainer.id =
        "adventureLoadMoreContainer";

    loadMoreContainer.style.textAlign =
        "center";

    loadMoreContainer.style.marginTop =
        "32px";

    loadMoreContainer.style.marginBottom =
        "24px";

    const loadMoreButton =
        document.createElement(
            "button"
        );

    loadMoreButton.id =
        "loadMoreAdventures";

    loadMoreButton.type =
        "button";

    loadMoreButton.className =
        "small-button";

    loadMoreButton.textContent =
        "Load More Adventures";

    loadMoreContainer.appendChild(
        loadMoreButton
    );

    grid.insertAdjacentElement(
        "afterend",
        loadMoreContainer
    );

    //-------------------------------------------------
    // Load Drawer
    //-------------------------------------------------

    try {

        const drawerHTML =
            await fetch(
                "components/drawer.html"
            )
                .then(
                    (response) => {

                        if (!response.ok) {

                            throw new Error(
                                "Unable to load the Adventure Drawer."
                            );

                        }

                        return response.text();

                    }
                );

        if (
            !document.getElementById(
                "drawerOverlay"
            )
        ) {

            document.body.insertAdjacentHTML(
                "beforeend",
                drawerHTML
            );

        }

        if (
            typeof Drawer !== "undefined" &&
            typeof Drawer.init === "function"
        ) {

            Drawer.init();

        }

    }

    catch (error) {

        console.error(
            "Unable to load the Adventure Drawer.",
            error
        );

    }

    //-------------------------------------------------
    // Build Category List
    //-------------------------------------------------

    category.innerHTML =
        `<option value="">All Categories</option>`;

    [
        ...new Set(
            adventures.map(
                (adventure) =>
                    adventure.Category
            )
        )
    ]
        .filter(Boolean)
        .sort(
            (firstCategory, secondCategory) =>
                String(firstCategory)
                    .localeCompare(
                        String(secondCategory)
                    )
        )
        .forEach(
            (categoryName) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    categoryName;

                option.textContent =
                    categoryName;

                category.appendChild(
                    option
                );

            }
        );

    //-------------------------------------------------
    // HTML Safety Helper
    //-------------------------------------------------

    function escapeHTML(value) {

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

    }

    //-------------------------------------------------
    // Filter Adventures
    //-------------------------------------------------

    function getFilteredAdventures() {

        const searchText =
            String(
                search.value || ""
            )
                .trim()
                .toLowerCase();

        const selectedCategory =
            String(
                category.value || ""
            ).trim();

        return adventures.filter(
            (adventure) => {

                const title =
                    String(
                        adventure.Title || ""
                    ).toLowerCase();

                const categoryName =
                    String(
                        adventure.Category || ""
                    ).toLowerCase();

                const adventureId =
                    String(
                        adventure["ID"] || ""
                    ).toLowerCase();

                const matchesSearch =
                    searchText === "" ||
                    title.includes(
                        searchText
                    ) ||
                    categoryName.includes(
                        searchText
                    ) ||
                    adventureId.includes(
                        searchText
                    );

                const matchesCategory =
                    selectedCategory === "" ||
                    String(
                        adventure.Category || ""
                    ) === selectedCategory;

                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );

    }

    //-------------------------------------------------
    // Create Adventure Card
    //-------------------------------------------------

    function createAdventureCard(
        adventure
    ) {

        const adventureId =
            String(
                adventure["ID"] || ""
            ).trim();

        const adventureTitle =
            String(
                adventure.Title ||
                "Untitled Adventure"
            ).trim();

        const adventureCategory =
            String(
                adventure.Category || ""
            ).trim();

        const completed =
            MemberState.isCompleted(
                adventureId
            );

        const card =
            document.createElement(
                "div"
            );

        card.className =
            `card dark-card adventure-card ${
                completed
                    ? "completed-card"
                    : ""
            }`;

        card.innerHTML = `

            <div class="card-image">

                <img
                    src="assets/badges/${escapeHTML(adventureId)}.webp"
                    alt="${escapeHTML(adventureTitle)}"
                    loading="lazy">

            </div>

            <span class="badge">

                ${escapeHTML(adventureId)}

            </span>

            <h3>

                ${escapeHTML(adventureTitle)}

            </h3>

            <p>

                ${escapeHTML(adventureCategory)}

            </p>

            <button
                type="button"
                class="small-button viewAdventure"
                data-id="${escapeHTML(adventureId)}">

                ${
                    completed
                        ? "Completed ✓"
                        : "Open Adventure"
                }

            </button>

        `;

        //-------------------------------------------------
        // Badge Image Fallback
        //-------------------------------------------------

        const badgeImage =
            card.querySelector(
                "img"
            );

        if (badgeImage) {

            let triedPNG =
                false;

            badgeImage.addEventListener(
                "error",
                () => {

                    if (!triedPNG) {

                        triedPNG =
                            true;

                        badgeImage.src =
                            `assets/badges/${adventureId}.png`;

                        return;

                    }

                    badgeImage.onerror =
                        null;

                    badgeImage.src =
                        "assets/icons/wac-icon.png";

                }
            );

        }

        //-------------------------------------------------
        // Open Adventure Button
        //-------------------------------------------------

        const openButton =
            card.querySelector(
                ".viewAdventure"
            );

        if (openButton) {

            openButton.addEventListener(
                "click",
                () => {

                    if (
                        typeof Drawer !== "undefined" &&
                        typeof Drawer.open === "function"
                    ) {

                        Drawer.open(
                            adventure
                        );

                    }

                }
            );

        }

        return card;

    }

    //-------------------------------------------------
    // Update Adventure Count
    //-------------------------------------------------

    function updateAdventureCount() {

        const totalCount =
            currentFilteredAdventures.length;

        const displayedCount =
            Math.min(
                visibleAdventureCount,
                totalCount
            );

        if (totalCount === 0) {

            count.textContent =
                "0 Adventures";

            return;

        }

        if (
            displayedCount >=
            totalCount
        ) {

            count.textContent =
                `${totalCount} Adventures`;

            return;

        }

        count.textContent =
            `Showing ${displayedCount} of ${totalCount} Adventures`;

    }

    //-------------------------------------------------
    // Update Load More Button
    //-------------------------------------------------

    function updateLoadMoreButton() {

        const totalCount =
            currentFilteredAdventures.length;

        const remainingCount =
            Math.max(
                totalCount -
                visibleAdventureCount,
                0
            );

        const hasMore =
            remainingCount > 0;

        loadMoreContainer.hidden =
            !hasMore;

        if (!hasMore) {

            return;

        }

        const nextBatchCount =
            Math.min(
                ADVENTURES_PER_PAGE,
                remainingCount
            );

        loadMoreButton.textContent =
            `Load ${nextBatchCount} More Adventures`;

    }

    //-------------------------------------------------
    // Render Adventures
    //-------------------------------------------------

    function render() {

        currentFilteredAdventures =
            getFilteredAdventures();

        const visibleAdventures =
            currentFilteredAdventures.slice(
                0,
                visibleAdventureCount
            );

        grid.innerHTML =
            "";

        empty.classList.toggle(
            "hidden",
            currentFilteredAdventures.length !== 0
        );

        visibleAdventures.forEach(
            (adventure) => {

                grid.appendChild(
                    createAdventureCard(
                        adventure
                    )
                );

            }
        );

        updateAdventureCount();
        updateLoadMoreButton();

    }

    //-------------------------------------------------
    // Reset Results to First 25
    //-------------------------------------------------

    function resetAndRender() {

        visibleAdventureCount =
            ADVENTURES_PER_PAGE;

        render();

    }

    //-------------------------------------------------
    // Search and Category Events
    //-------------------------------------------------

    search.addEventListener(
        "input",
        resetAndRender
    );

    category.addEventListener(
        "change",
        resetAndRender
    );

    //-------------------------------------------------
    // Load More Button
    //-------------------------------------------------

    loadMoreButton.addEventListener(
        "click",
        () => {

            visibleAdventureCount +=
                ADVENTURES_PER_PAGE;

            render();

        }
    );

    //-------------------------------------------------
    // Quick Guide Button
    //-------------------------------------------------

    if (quickGuideButton) {

        quickGuideButton.addEventListener(
            "click",
            async () => {

                if (
                    typeof WACRouter !==
                        "undefined" &&
                    typeof WACRouter.loadPage ===
                        "function"
                ) {

                    await WACRouter.loadPage(
                        "quick-guide"
                    );

                }

            }
        );

    }

    //-------------------------------------------------
    // Initial Render
    //-------------------------------------------------

    render();

})();