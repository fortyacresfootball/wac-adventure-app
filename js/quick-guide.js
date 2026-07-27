// ======================================
// WAC Adventure Quick Guide
// Version 1.0
// ======================================

(async function () {

    "use strict";

    //--------------------------------------------------
    // Page Elements
    //--------------------------------------------------

    const list =
        document.getElementById(
            "quickGuideList"
        );

    const count =
        document.getElementById(
            "quickGuideCount"
        );

    const search =
        document.getElementById(
            "quickGuideSearch"
        );

    const category =
        document.getElementById(
            "quickGuideCategory"
        );

    const printButton =
        document.getElementById(
            "printQuickGuide"
        );

    const empty =
        document.getElementById(
            "quickGuideEmpty"
        );

    if (
        !list ||
        !count ||
        !search ||
        !category ||
        !empty
    ) {

        console.error(
            "Quick Guide page elements could not be found."
        );

        return;

    }

    //--------------------------------------------------
    // Load Adventures
    //--------------------------------------------------

    let adventures = [];

    try {

        adventures =
            await Database.getAdventures();

    }

    catch (error) {

        console.error(
            "Unable to load the Adventure Quick Guide.",
            error
        );

        list.innerHTML = `

            <div class="profile-empty-state">

                <div class="profile-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Quick Guide Unavailable
                </h3>

                <p>
                    The adventure database could not be loaded.
                </p>

            </div>

        `;

        count.textContent =
            "0 Adventures";

        return;

    }

    adventures =
        Array.isArray(adventures)
            ? adventures
            : [];

    //--------------------------------------------------
    // Build Category List
    //--------------------------------------------------

    const categories =
        [...new Set(

            adventures
                .map((adventure) => {

                    return String(
                        adventure.Category || ""
                    ).trim();

                })
                .filter(Boolean)

        )]
            .sort((first, second) => {

                return first.localeCompare(
                    second
                );

            });

    categories.forEach(
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

    //--------------------------------------------------
    // Search and Filter Events
    //--------------------------------------------------

    search.addEventListener(
        "input",
        renderQuickGuide
    );

    category.addEventListener(
        "change",
        renderQuickGuide
    );

    //--------------------------------------------------
    // Print Guide
    //--------------------------------------------------

    if (printButton) {

        printButton.addEventListener(
            "click",
            () => {

                window.print();

            }
        );

    }

    //--------------------------------------------------
    // Initial Render
    //--------------------------------------------------

    renderQuickGuide();

    //--------------------------------------------------
    // Render Guide
    //--------------------------------------------------

    function renderQuickGuide() {

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

        const filtered =
            adventures.filter(
                (adventure) => {

                    const adventureId =
                        String(
                            adventure["ID"] || ""
                        )
                            .trim()
                            .toLowerCase();

                    const title =
                        String(
                            adventure.Title || ""
                        )
                            .trim()
                            .toLowerCase();

                    const mission =
                        String(
                            adventure.Mission || ""
                        )
                            .trim()
                            .toLowerCase();

                    const adventureCategory =
                        String(
                            adventure.Category || ""
                        ).trim();

                    const matchesText =
                        !searchText ||
                        adventureId.includes(
                            searchText
                        ) ||
                        title.includes(
                            searchText
                        ) ||
                        mission.includes(
                            searchText
                        ) ||
                        adventureCategory
                            .toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesCategory =
                        !selectedCategory ||
                        adventureCategory ===
                            selectedCategory;

                    return (
                        matchesText &&
                        matchesCategory
                    );

                }
            );

        count.textContent =
            filtered.length === 1
                ? "1 Adventure"
                : `${filtered.length} Adventures`;

        list.innerHTML =
            "";

        empty.classList.toggle(
            "hidden",
            filtered.length !== 0
        );

        if (
            filtered.length === 0
        ) {

            return;

        }

        const grouped =
            groupAdventuresByCategory(
                filtered
            );

        Object.entries(grouped)
            .forEach(
                ([
                    categoryName,
                    categoryAdventures
                ]) => {

                    list.appendChild(
                        createCategorySection(
                            categoryName,
                            categoryAdventures
                        )
                    );

                }
            );

    }

    //--------------------------------------------------
    // Group Adventures
    //--------------------------------------------------

    function groupAdventuresByCategory(
        filteredAdventures
    ) {

        const grouped = {};

        filteredAdventures
            .slice()
            .sort(
                (
                    firstAdventure,
                    secondAdventure
                ) => {

                    const categoryCompare =
                        String(
                            firstAdventure.Category || ""
                        )
                            .localeCompare(
                                String(
                                    secondAdventure.Category || ""
                                )
                            );

                    if (
                        categoryCompare !== 0
                    ) {

                        return categoryCompare;

                    }

                    return String(
                        firstAdventure["ID"] || ""
                    ).localeCompare(
                        String(
                            secondAdventure["ID"] || ""
                        ),
                        undefined,
                        {
                            numeric: true
                        }
                    );

                }
            )
            .forEach(
                (adventure) => {

                    const categoryName =
                        String(
                            adventure.Category ||
                            "Other Adventures"
                        ).trim();

                    if (
                        !grouped[
                            categoryName
                        ]
                    ) {

                        grouped[
                            categoryName
                        ] = [];

                    }

                    grouped[
                        categoryName
                    ].push(
                        adventure
                    );

                }
            );

        return grouped;

    }

    //--------------------------------------------------
    // Category Section
    //--------------------------------------------------

    function createCategorySection(
        categoryName,
        categoryAdventures
    ) {

        const section =
            document.createElement(
                "section"
            );

        section.className =
            "quick-guide-category";

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "quick-guide-category-header";

        const title =
            document.createElement(
                "h2"
            );

        title.textContent =
            categoryName;

        const categoryCount =
            document.createElement(
                "span"
            );

        categoryCount.className =
            "chip";

        categoryCount.textContent =
            categoryAdventures.length === 1
                ? "1 Adventure"
                : `${categoryAdventures.length} Adventures`;

        header.append(
            title,
            categoryCount
        );

        const items =
            document.createElement(
                "div"
            );

        items.className =
            "quick-guide-category-list";

        categoryAdventures.forEach(
            (adventure) => {

                items.appendChild(
                    createAdventureReference(
                        adventure
                    )
                );

            }
        );

        section.append(
            header,
            items
        );

        return section;

    }

    //--------------------------------------------------
    // Adventure Reference Entry
    //--------------------------------------------------

    function createAdventureReference(
        adventure
    ) {

        const article =
            document.createElement(
                "article"
            );

        article.className =
            "quick-guide-item";

        const badge =
            document.createElement(
                "div"
            );

        badge.className =
            "quick-guide-badge";

        const image =
            document.createElement(
                "img"
            );

        const adventureId =
            String(
                adventure["ID"] || ""
            ).trim();

        image.src =
            `assets/badges/${adventureId}.webp`;

        image.alt =
            `${adventure.Title || adventureId} badge`;

        image.loading =
            "lazy";

        image.onerror = () => {

            image.onerror =
                null;

            image.src =
                `assets/badges/${adventureId}.png`;

        };

        badge.appendChild(
            image
        );

        const content =
            document.createElement(
                "div"
            );

        content.className =
            "quick-guide-item-content";

        const heading =
            document.createElement(
                "div"
            );

        heading.className =
            "quick-guide-item-heading";

        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            `${adventureId} — ${
                adventure.Title ||
                "Untitled Adventure"
            }`;

        const points =
            document.createElement(
                "span"
            );

        points.className =
            "quick-guide-points";

        points.textContent =
            `${Number(
                adventure.Points ||
                100
            ) || 100} Points`;

        heading.append(
            title,
            points
        );

        const mission =
            document.createElement(
                "p"
            );

        mission.className =
            "quick-guide-mission";

        mission.textContent =
            adventure.Mission ||
            "Mission details have not yet been added.";

        const action =
            document.createElement(
                "button"
            );

        action.type =
            "button";

        action.className =
            "small-button quick-guide-open-button";

        action.textContent =
            "Open Full Adventure";

        action.addEventListener(
            "click",
            async () => {

                if (
                    typeof WACRouter ===
                        "undefined" ||
                    typeof WACRouter.loadPage !==
                        "function"
                ) {

                    return;

                }

                window.WAC.selectedBadge =
                    adventureId;

                await WACRouter.loadPage(
                    "adventures"
                );

                setTimeout(
                    () => {

                        const adventureButton =
                            document.querySelector(
                                `.viewAdventure[data-id="${escapeSelectorValue(
                                    adventureId
                                )}"]`
                            );

                        if (
                            adventureButton
                        ) {

                            adventureButton.click();

                        }

                    },
                    150
                );

            }
        );

        content.append(
            heading,
            mission,
            action
        );

        article.append(
            badge,
            content
        );

        return article;

    }

    //--------------------------------------------------
    // CSS Selector Helper
    //--------------------------------------------------

    function escapeSelectorValue(
        value
    ) {

        if (
            window.CSS &&
            typeof window.CSS.escape ===
                "function"
        ) {

            return window.CSS.escape(
                String(
                    value || ""
                )
            );

        }

        return String(
            value || ""
        )
            .replaceAll(
                "\\",
                "\\\\"
            )
            .replaceAll(
                '"',
                '\\"'
            );

    }

})();