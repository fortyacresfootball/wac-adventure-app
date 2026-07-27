// ======================================
// WAC Adventure Explorer
// Version 5.1
// ======================================

(async function () {

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

    const adventures =
        await Database.getAdventures();

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
    // Load Drawer
    //-------------------------------------------------

    const drawerHTML =
        await fetch(
            "components/drawer.html"
        )
            .then(
                (response) =>
                    response.text()
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

    Drawer.init();

    //-------------------------------------------------
    // Build Category List
    //-------------------------------------------------

    category.innerHTML =
        `<option value="">All Categories</option>`;

    [...new Set(
        adventures.map(
            (adventure) =>
                adventure.Category
        )
    )]
        .sort()
        .forEach(
            (categoryName) => {

                if (!categoryName) {

                    return;

                }

                category.innerHTML +=
                    `<option value="${categoryName}">${categoryName}</option>`;

            }
        );

    //-------------------------------------------------
    // Render Adventures
    //-------------------------------------------------

    function render() {

        const text =
            search.value
                .toLowerCase();

        const selected =
            category.value;

        const filtered =
            adventures.filter(
                (adventure) => {

                    const title =
                        String(
                            adventure.Title || ""
                        ).toLowerCase();

                    const categoryName =
                        String(
                            adventure.Category || ""
                        ).toLowerCase();

                    return (

                        (
                            title.includes(
                                text
                            ) ||
                            categoryName.includes(
                                text
                            )
                        )

                        &&

                        (
                            selected === "" ||
                            adventure.Category ===
                                selected
                        )

                    );

                }
            );

        count.textContent =
            `${filtered.length} Adventures`;

        grid.innerHTML =
            "";

        empty.classList.toggle(
            "hidden",
            filtered.length !== 0
        );

        //-------------------------------------------------
        // Cards
        //-------------------------------------------------

        filtered.forEach(
            (adventure) => {

                const completed =
                    MemberState.isCompleted(
                        adventure["ID"]
                    );

                grid.innerHTML += `

                    <div class="card dark-card ${
                        completed
                            ? "completed-card"
                            : ""
                    }">

                        <div class="card-image">

                            <img
                                src="assets/badges/${adventure["ID"]}.webp"
                                alt="${adventure.Title}"
                                loading="lazy"
                                onerror="this.src='assets/badges/${adventure["ID"]}.png'">

                        </div>

                        <span class="badge">

                            ${adventure["ID"]}

                        </span>

                        <h3>

                            ${adventure.Title}

                        </h3>

                        <p>

                            ${adventure.Category || ""}

                        </p>

                        <button
                            class="small-button viewAdventure"
                            data-id="${adventure["ID"]}">

                            ${
                                completed
                                    ? "Completed ✓"
                                    : "Open Adventure"
                            }

                        </button>

                    </div>

                `;

            }
        );

        //-------------------------------------------------
        // Adventure Button Events
        //-------------------------------------------------

        document
            .querySelectorAll(
                ".viewAdventure"
            )
            .forEach(
                (button) => {

                    button.onclick =
                        () => {

                            const adventure =
                                adventures.find(
                                    (item) => {

                                        return (
                                            item["ID"] ===
                                            button.dataset.id
                                        );

                                    }
                                );

                            Drawer.open(
                                adventure
                            );

                        };

                }
            );

    }

    //-------------------------------------------------
    // Search and Category Events
    //-------------------------------------------------

    search.addEventListener(
        "input",
        render
    );

    category.addEventListener(
        "change",
        render
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